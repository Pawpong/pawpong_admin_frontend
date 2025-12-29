import axios, { type InternalAxiosRequestConfig } from 'axios';

// API 베이스 URL (포트 수정: 8080)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Axios 인스턴스 생성
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터: 액세스 토큰 자동 추가
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// 응답 인터셉터: 에러 처리 및 토큰 갱신
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // 401 에러이고 재시도하지 않았다면 토큰 갱신 시도
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                // 토큰 갱신 API 호출 (관리자용)
                const response = await axios.post(`${API_BASE_URL}/auth-admin/refresh`, {
                    refreshToken,
                });

                const { accessToken, refreshToken: newRefreshToken } = response.data.data;

                // 새 토큰 저장
                localStorage.setItem('accessToken', accessToken);
                if (newRefreshToken) {
                    localStorage.setItem('refreshToken', newRefreshToken);
                }

                // 원래 요청 재시도
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                }
                return apiClient(originalRequest);
            } catch (refreshError) {
                // 토큰 갱신 실패 시 로그아웃 처리 및 상태 완전 초기화
                console.error('Token refresh failed:', refreshError);

                // 로컬 스토리지 완전 초기화
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('auth-storage'); // Zustand persist storage

                // 로그인 페이지로 강제 리다이렉트
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }

                return Promise.reject(new Error('세션이 만료되었습니다. 다시 로그인해주세요.'));
            }
        }

        return Promise.reject(error);
    },
);

export default apiClient;
