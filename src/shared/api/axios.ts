import axios, { type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../../features/auth/store/authStore';
import {
  assertAdminRequestSession,
  captureAdminRequestSession,
  getAdminSessionRefreshToken,
  isCurrentAdminRequestSession,
  sameAdminRequestSession,
  SessionChangedError,
  type AdminRequestSession,
} from './adminRequestSession';

const API_BASE_URL = import.meta.env.DEV
  ? '/api'
  : import.meta.env.VITE_API_BASE_URL || 'https://api.pawpong.kr/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

interface SessionRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _authSession?: AdminRequestSession;
}

let refreshInFlight: { session: AdminRequestSession; promise: Promise<string> } | null = null;

function refreshAccessToken(session: AdminRequestSession): Promise<string> {
  assertAdminRequestSession(session);
  if (!refreshInFlight || !sameAdminRequestSession(refreshInFlight.session, session)) {
    const promise = (async () => {
      const refreshToken = getAdminSessionRefreshToken(session);
      if (!refreshToken) throw new Error('No refresh token');
      const response = await axios.post(`${API_BASE_URL}/auth-admin/refresh`, { refreshToken }, { timeout: 10000 });
      assertAdminRequestSession(session);
      const accessToken = response.data.data?.accessToken;
      if (typeof accessToken !== 'string' || !accessToken) throw new Error('Invalid access token');
      // 관리자 갱신 응답은 accessToken만 반환한다. 기존 refreshToken을 유지한다.
      useAuthStore.getState().updateTokens(accessToken, refreshToken);
      return accessToken;
    })().finally(() => { if (refreshInFlight?.promise === promise) refreshInFlight = null; });
    refreshInFlight = { session, promise };
  }
  return refreshInFlight.promise;
}

apiClient.interceptors.request.use((config: SessionRequestConfig) => {
  // 최초 호출 시 동기적으로 세션을 고정하고 재시도에서도 같은 세션만 허용한다.
  const session = config._authSession ?? captureAdminRequestSession();
  assertAdminRequestSession(session);
  config._authSession = session;
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error: unknown) => { throw error; }, { synchronous: true });

apiClient.interceptors.response.use(
  (response) => {
    const session = (response.config as SessionRequestConfig)._authSession;
    if (session) assertAdminRequestSession(session);
    return response;
  },
  async (error) => {
    const request = error.config as SessionRequestConfig | undefined;
    const session = request?._authSession;
    if (session) assertAdminRequestSession(session);
    // 로그인 실패는 입력 오류로 그대로 전달하고, 갱신 요청 자체는 재시도하지 않는다.
    if (!request || !session || error.response?.status !== 401 || request._retry ||
        request.url === '/auth-admin/login' || request.url === '/auth-admin/refresh') {
      return Promise.reject(error);
    }
    request._retry = true;
    try {
      const currentToken = localStorage.getItem('accessToken');
      // 다른 요청이 이미 토큰을 갱신했다면 늦게 도착한 401도 새 토큰으로 재시도한다.
      const token = currentToken && request.headers.Authorization !== `Bearer ${currentToken}`
        ? currentToken
        : await refreshAccessToken(session);
      assertAdminRequestSession(session);
      request.headers.Authorization = `Bearer ${token}`;
      return apiClient(request);
    } catch (refreshError) {
      if (!isCurrentAdminRequestSession(session)) return Promise.reject(new SessionChangedError());
      if (refreshError instanceof SessionChangedError) return Promise.reject(refreshError);
      useAuthStore.getState().logout();
      if (window.location.pathname !== '/login') window.location.href = '/login';
      return Promise.reject(new Error('세션이 만료되었습니다. 다시 로그인해주세요.'));
    }
  },
);

export default apiClient;
