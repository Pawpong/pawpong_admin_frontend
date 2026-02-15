import apiClient from '../../../shared/api/axios';
import type {
  ApiResponse,
  PlatformStats,
  MvpStats,
  PhoneWhitelist,
  PhoneWhitelistCreateRequest,
  PhoneWhitelistUpdateRequest,
  PhoneWhitelistListResponse,
  ApplicationMonitoringResponse,
  ApplicationMonitoringRequest,
  ApplicationDetailData,
} from '../../../shared/types/api.types';

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

  /**
   * 입양 신청 리스트 조회
   * 전체 입양 신청 내역을 조회합니다 (페이지네이션, 필터링 지원)
   */
  getApplicationList: async (params?: ApplicationMonitoringRequest): Promise<ApplicationMonitoringResponse> => {
    const response = await apiClient.get<ApiResponse<ApplicationMonitoringResponse>>('/platform-admin/applications', {
      params,
    });
    return response.data.data;
  },

  /**
   * 입양 신청 상세 조회
   * 특정 입양 신청의 상세 정보를 조회합니다
   */
  getApplicationDetail: async (applicationId: string): Promise<ApplicationDetailData> => {
    const response = await apiClient.get<ApiResponse<ApplicationDetailData>>(
      `/platform-admin/applications/${applicationId}`,
    );
    return response.data.data;
  },

  // ================== 전화번호 화이트리스트 관리 ==================

  /**
   * 전화번호 화이트리스트 목록 조회
   */
  getPhoneWhitelist: async (): Promise<PhoneWhitelistListResponse> => {
    const response = await apiClient.get<ApiResponse<PhoneWhitelistListResponse>>('/platform-admin/phone-whitelist');
    return response.data.data;
  },

  /**
   * 전화번호 화이트리스트 추가
   */
  addPhoneWhitelist: async (data: PhoneWhitelistCreateRequest): Promise<PhoneWhitelist> => {
    const response = await apiClient.post<ApiResponse<PhoneWhitelist>>('/platform-admin/phone-whitelist', data);
    return response.data.data;
  },

  /**
   * 전화번호 화이트리스트 수정
   */
  updatePhoneWhitelist: async (id: string, data: PhoneWhitelistUpdateRequest): Promise<PhoneWhitelist> => {
    const response = await apiClient.patch<ApiResponse<PhoneWhitelist>>(`/platform-admin/phone-whitelist/${id}`, data);
    return response.data.data;
  },

  /**
   * 전화번호 화이트리스트 삭제
   */
  deletePhoneWhitelist: async (id: string): Promise<void> => {
    await apiClient.delete(`/platform-admin/phone-whitelist/${id}`);
  },
};
