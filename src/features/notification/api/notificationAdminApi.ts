import apiClient from '../../../shared/api/axios';

/**
 * 어드민 푸시 발송 대상 타입
 * - all_adopters: 입양자 전체
 * - all_breeders: 브리더 전체
 * - individual: 단일 사용자 (role + userId 필요)
 */
export type AdminPushTargetType = 'all_adopters' | 'all_breeders' | 'individual';

export type AdminPushIndividualRole = 'adopter' | 'breeder';

export interface AdminPushTarget {
  type: AdminPushTargetType;
  role?: AdminPushIndividualRole;
  userId?: string;
}

export interface SendAdminPushRequest {
  target: AdminPushTarget;
  title: string;
  body: string;
  targetUrl?: string;
}

/**
 * 어드민 푸시 발송 결과 — 백엔드 AdminPushResultResponseDto 와 1:1.
 */
export interface AdminPushResult {
  recipients: number;
  notificationsCreated: number;
  pushTokensTargeted: number;
  pushSuccess: number;
  pushFailed: number;
  invalidTokens: number;
}

interface ApiResponse<T> {
  success: boolean;
  code: number;
  data: T;
  message: string;
  timestamp: string;
}

/**
 * 어드민 알림 관리 API 클라이언트
 *
 * 엔드포인트 prefix: /api/notification-admin
 */
export const notificationAdminApi = {
  /**
   * 어드민 푸시 발송 (전체 or 개별)
   * 엔드포인트: POST /api/notification-admin/push
   */
  async sendPush(payload: SendAdminPushRequest): Promise<AdminPushResult> {
    const response = await apiClient.post<ApiResponse<AdminPushResult>>('/notification-admin/push', payload);
    return response.data.data;
  },
};
