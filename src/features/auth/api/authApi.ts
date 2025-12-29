import apiClient from '../../../shared/api/axios';
import type { ApiResponse, LoginRequest, AuthResponse } from '../../../shared/types/api.types';

/**
 * 인증 API 클라이언트
 */
export const authApi = {
    /**
     * 로그인
     */
    login: async (credentials: LoginRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth-admin/login', credentials);
        return response.data.data;
    },

    /**
     * 로그아웃
     */
    logout: async (): Promise<void> => {
        await apiClient.post('/auth/logout');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    },

    /**
     * 토큰 갱신
     */
    refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
        const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh', { refreshToken });
        return response.data.data;
    },
};
