import axios, { type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../../features/auth/store/authStore';

const API_BASE_URL = import.meta.env.DEV
  ? '/api'
  : import.meta.env.VITE_API_BASE_URL || 'https://api.pawpong.kr/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

class SessionChangedError extends Error {}

let refreshInFlight: Promise<string> | null = null;

function refreshAccessToken(): Promise<string> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token');
      const response = await axios.post(`${API_BASE_URL}/auth-admin/refresh`, { refreshToken }, { timeout: 10000 });
      if (localStorage.getItem('refreshToken') !== refreshToken) throw new SessionChangedError('Session changed');
      const accessToken = response.data.data?.accessToken;
      if (typeof accessToken !== 'string' || !accessToken) throw new Error('Invalid access token');
      // 관리자 갱신 응답은 accessToken만 반환한다. 기존 refreshToken을 유지한다.
      useAuthStore.getState().updateTokens(accessToken, refreshToken);
      return accessToken;
    })().finally(() => { refreshInFlight = null; });
  }
  return refreshInFlight;
}

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    // 로그인 실패는 입력 오류로 그대로 전달하고, 갱신 요청 자체는 재시도하지 않는다.
    if (!request || error.response?.status !== 401 || request._retry ||
        request.url === '/auth-admin/login' || request.url === '/auth-admin/refresh') {
      return Promise.reject(error);
    }
    request._retry = true;
    try {
      const currentToken = localStorage.getItem('accessToken');
      // 다른 요청이 이미 토큰을 갱신했다면 늦게 도착한 401도 새 토큰으로 재시도한다.
      const token = currentToken && request.headers.Authorization !== `Bearer ${currentToken}`
        ? currentToken
        : await refreshAccessToken();
      request.headers.Authorization = `Bearer ${token}`;
      return apiClient(request);
    } catch (refreshError) {
      if (refreshError instanceof SessionChangedError) return Promise.reject(refreshError);
      useAuthStore.getState().logout();
      if (window.location.pathname !== '/login') window.location.href = '/login';
      return Promise.reject(new Error('세션이 만료되었습니다. 다시 로그인해주세요.'));
    }
  },
);

export default apiClient;
