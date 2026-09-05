import apiClient from '../../../shared/api/axios';
import { useAuthStore } from '../store/authStore';
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
    try {
      await apiClient.post('/v2/auth/logout');
    } finally {
      useAuthStore.getState().logout();
    }
  },

  /**
   * 토큰 갱신
   */
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const response = await apiClient.post<ApiResponse<{ accessToken: string }>>('/auth-admin/refresh', { refreshToken });
    return response.data.data;
  },
};
