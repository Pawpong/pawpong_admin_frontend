import apiClient from '../../../shared/api/axios';
import type { ApiResponse, PlatformStats } from '../../../shared/types/api.types';

/**
 * 플랫폼 통계 API 클라이언트
 */
export const platformApi = {
  /**
   * 플랫폼 전체 통계 조회
   */
  getStats: async (): Promise<PlatformStats> => {
    const response = await apiClient.get<ApiResponse<PlatformStats>>('/platform-admin/stats');
    return response.data.data;
  },
};
