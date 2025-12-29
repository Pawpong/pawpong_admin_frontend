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
    BreederStats,
    SetTestAccountResponse,
} from '../../../shared/types/api.types';

/**
 * 브리더 관리 API 클라이언트
 *
 * 백엔드 모듈 구조:
 * - /breeder-verification-admin: 브리더 인증 관리 (BreederVerificationAdminModule)
 * - /breeder-level-admin: 브리더 레벨 변경 (BreederLevelAdminModule)
 * - /breeder-admin: 입양 신청 모니터링, 제재, 리마인드 (BreederAdminModule)
 */
export const breederApi = {
    /**
     * 승인 대기 브리더 목록 조회
     * 엔드포인트: GET /api/breeder-verification-admin/verification/pending
     */
    getPendingVerifications: async (): Promise<BreederVerification[]> => {
        const response = await apiClient.get<ApiResponse<BreederVerificationPaginationResponse>>(
            '/breeder-verification-admin/verification/pending',
        );
        return response.data.data.items;
    },

    /**
     * 브리더 목록 조회 (통합 검색)
     * 엔드포인트: GET /api/breeder-verification-admin/breeders
     */
    getBreeders: async (
        status?: string,
        page: number = 1,
        limit: number = 10,
    ): Promise<BreederVerificationPaginationResponse> => {
        const response = await apiClient.get<ApiResponse<BreederVerificationPaginationResponse>>(
            '/breeder-verification-admin/breeders',
            {
                params: {
                    verificationStatus: status,
                    pageNumber: page,
                    itemsPerPage: limit,
                },
            },
        );
        return response.data.data;
    },

    /**
     * 브리더 인증 승인/거절
     * 엔드포인트: PATCH /api/breeder-verification-admin/verification/:breederId
     */
    updateVerification: async (breederId: string, action: VerificationAction): Promise<void> => {
        await apiClient.patch(`/breeder-verification-admin/verification/${breederId}`, action);
    },

    /**
     * 브리더 상세 정보 조회
     * 엔드포인트: GET /api/breeder-verification-admin/verification/:breederId
     */
    getBreederDetail: async (breederId: string): Promise<BreederVerification> => {
        const response = await apiClient.get<ApiResponse<BreederVerification>>(
            `/breeder-verification-admin/verification/${breederId}`,
        );
        return response.data.data;
    },

    /**
     * 브리더 신고 목록 조회
     * 엔드포인트: GET /api/breeder-report-admin/reports
     * 모듈: BreederReportAdminModule
     */
    getReports: async (page: number = 1, limit: number = 10): Promise<PaginationResponse<BreederReport>> => {
        const response = await apiClient.get<ApiResponse<PaginationResponse<BreederReport>>>(
            '/breeder-report-admin/reports',
            {
                params: {
                    pageNumber: page,
                    itemsPerPage: limit,
                },
            },
        );
        return response.data.data;
    },

    /**
     * 브리더 신고 처리
     * 엔드포인트: PATCH /api/breeder-report-admin/reports/:reportId
     * 모듈: BreederReportAdminModule
     */
    handleReport: async (reportId: string, action: ReportAction): Promise<void> => {
        await apiClient.patch(`/breeder-report-admin/reports/${reportId}`, action);
    },

    /**
     * 브리더 레벨 변경 (뉴 ↔ 엘리트)
     * 엔드포인트: PATCH /api/breeder-level-admin/level/:breederId
     * 모듈: BreederLevelAdminModule
     */
    changeLevel: async (breederId: string, newLevel: 'new' | 'elite'): Promise<void> => {
        await apiClient.patch(`/breeder-level-admin/level/${breederId}`, {
            newLevel,
        });
    },

    /**
     * 브리더 계정 정지 (영구정지)
     * 엔드포인트: POST /api/breeder-admin/suspend/:breederId
     * 모듈: BreederAdminModule (향후 breeder-suspend/admin으로 분리 예정)
     */
    suspendBreeder: async (breederId: string, reason: string): Promise<void> => {
        await apiClient.post(`/breeder-admin/suspend/${breederId}`, {
            reason,
        });
    },

    /**
     * 브리더 계정 정지 해제
     * 엔드포인트: POST /api/breeder-admin/unsuspend/:breederId
     * 모듈: BreederAdminModule
     */
    unsuspendBreeder: async (breederId: string): Promise<void> => {
        await apiClient.post(`/breeder-admin/unsuspend/${breederId}`);
    },

    /**
     * 리마인드 알림 보내기
     * 엔드포인트: POST /api/breeder-admin/remind
     * remindType: 'document_reminder' | 'profile_completion_reminder'
     */
    sendReminder: async (
        breederIds: string[],
        remindType: 'document_reminder' | 'profile_completion_reminder',
    ): Promise<void> => {
        await apiClient.post('/breeder-admin/remind', {
            breederIds,
            remindType,
        });
    },

    /**
     * 입양 신청 모니터링
     * 엔드포인트: GET /api/breeder-admin/applications
     * 모듈: BreederAdminModule
     */
    getApplications: async (filters?: ApplicationMonitoringRequest): Promise<ApplicationMonitoringResponse> => {
        const response = await apiClient.get<ApiResponse<ApplicationMonitoringResponse>>(
            '/breeder-admin/applications',
            {
                params: filters,
            },
        );
        return response.data.data;
    },

    /**
     * 승인된 브리더 통계 조회
     * 엔드포인트: GET /api/breeder-verification-admin/stats
     * 모듈: BreederVerificationAdminModule
     */
    getBreederStats: async (): Promise<BreederStats> => {
        const response = await apiClient.get<ApiResponse<BreederStats>>('/breeder-verification-admin/stats');
        return response.data.data;
    },

    /**
     * 테스트 계정 설정/해제
     * 엔드포인트: PATCH /api/breeder-admin/test-account/:breederId
     * 모듈: BreederAdminModule
     * 테스트 계정은 탐색 페이지와 홈 화면에 노출되지 않습니다.
     */
    setTestAccount: async (breederId: string, isTestAccount: boolean): Promise<SetTestAccountResponse> => {
        const response = await apiClient.patch<ApiResponse<SetTestAccountResponse>>(
            `/breeder-admin/test-account/${breederId}`,
            { isTestAccount },
        );
        return response.data.data;
    },
};
