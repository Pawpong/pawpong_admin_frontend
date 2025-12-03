import apiClient from '../../../shared/api/axios';
import type {
  ApiResponse,
  PaginationResponse,
  BreederVerification,
  BreederVerificationPaginationResponse,
  VerificationAction,
  BreederReport,
  ReportAction,
  ApplicationMonitoringResponse,
  ApplicationMonitoringRequest,
} from '../../../shared/types/api.types';

/**
 * 브리더 관리 API 클라이언트
 */
export const breederApi = {
  /**
   * 승인 대기 브리더 목록 조회
   */
  getPendingVerifications: async (): Promise<BreederVerification[]> => {
    const response = await apiClient.get<ApiResponse<BreederVerificationPaginationResponse>>(
      '/breeder-admin/verification/pending'
    );
    return response.data.data.breeders;
  },

  /**
   * 브리더 인증 승인/거절
   */
  updateVerification: async (breederId: string, action: VerificationAction): Promise<void> => {
    await apiClient.patch(`/breeder-admin/verification/${breederId}`, action);
  },

  /**
   * 브리더 신고 목록 조회
   */
  getReports: async (page: number = 1, limit: number = 10): Promise<PaginationResponse<BreederReport>> => {
    const response = await apiClient.get<ApiResponse<PaginationResponse<BreederReport>>>('/breeder-admin/reports', {
      params: { page, limit },
    });
    return response.data.data;
  },

  /**
   * 브리더 신고 처리
   */
  handleReport: async (breederId: string, reportId: string, action: ReportAction): Promise<void> => {
    await apiClient.patch(`/breeder-admin/reports/${breederId}/${reportId}`, action);
  },

  /**
   * 브리더 레벨 변경 (뉴 ↔ 엘리트)
   */
  changeLevel: async (breederId: string, level: 'new' | 'elite', reason?: string): Promise<void> => {
    await apiClient.patch(`/breeder-admin/level/${breederId}`, {
      level,
      reason,
    });
  },

  /**
   * 브리더 계정 정지 (영구정지)
   */
  suspendBreeder: async (breederId: string, reason: string): Promise<void> => {
    await apiClient.post(`/breeder-admin/suspend/${breederId}`, {
      reason,
    });
  },

  /**
   * 리마인드 알림 보내기 (미완료 브리더들에게 일괄 발송)
   */
  sendReminder: async (breederIds: string[], message: string): Promise<void> => {
    await apiClient.post('/breeder-admin/remind', {
      breederIds,
      message,
    });
  },

  /**
   * 입양 신청 모니터링
   */
  getApplications: async (filters?: ApplicationMonitoringRequest): Promise<ApplicationMonitoringResponse> => {
    const response = await apiClient.get<ApiResponse<ApplicationMonitoringResponse>>('/breeder-admin/applications', {
      params: filters,
    });
    return response.data.data;
  },
};
