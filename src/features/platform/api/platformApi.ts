import apiClient from '../../../shared/api/axios';
import type { ApiResponse, PlatformStats, MvpStats } from '../../../shared/types/api.types';

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

  /**
   * MVP 통계 조회
   * 활성 사용자, 상담/입양 신청, 필터 사용, 브리더 재제출 통계
   */
  getMvpStats: async (): Promise<MvpStats> => {
    const response = await apiClient.get<ApiResponse<MvpStats>>('/platform-admin/mvp-stats');
    return response.data.data;
  },
};
