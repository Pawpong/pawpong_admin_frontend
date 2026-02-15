import apiClient from '../../../shared/api/axios';
import type {
  ApiResponse,
  ApplicationMonitoringResponse,
  ApplicationMonitoringRequest,
  ApplicationDetailData,
} from '../../../shared/types/api.types';

/**
 * 입양자 관리 API 클라이언트
 *
 * 입양자 도메인에 대한 관리자 기능을 제공합니다:
 * - 입양 신청 모니터링
 * - 후기 신고 관리
 */
export const adopterApi = {
  /**
   * 입양 신청 리스트 조회
   * 엔드포인트: GET /api/adopter-admin/applications
   * 전체 입양 신청 내역을 조회합니다 (페이지네이션, 필터링 지원)
   */
  getApplicationList: async (params?: ApplicationMonitoringRequest): Promise<ApplicationMonitoringResponse> => {
    const response = await apiClient.get<ApiResponse<ApplicationMonitoringResponse>>('/adopter-admin/applications', {
      params,
    });
    return response.data.data;
  },

  /**
   * 입양 신청 상세 조회
   * 엔드포인트: GET /api/adopter-admin/applications/:applicationId
   * 특정 입양 신청의 상세 정보를 조회합니다
   */
  getApplicationDetail: async (applicationId: string): Promise<ApplicationDetailData> => {
    const response = await apiClient.get<ApiResponse<ApplicationDetailData>>(
      `/adopter-admin/applications/${applicationId}`,
    );
    return response.data.data;
  },
};
