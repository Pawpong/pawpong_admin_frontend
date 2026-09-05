import apiClient from '../../../shared/api/axios';
import type { ApiResponse, PaginationResponse } from '../../../shared/types/api.types';
import type {
  SystemHealthResponse,
  NotificationAdminResponse,
  NotificationStatsResponse,
  PopularKeywordResponse,
  CreatePopularKeywordRequest,
  UpdatePopularKeywordRequest,
  CommunityReportAdminItemResponse,
  UpdateContestEntryStatusRequest,
  NotificationEmailPreviewCatalogResponse,
  NotificationEmailPreviewResponse,
  BreederApprovalEmailPreviewRequest,
  BreederRejectionEmailPreviewRequest,
  ApplicationConfirmationEmailPreviewRequest,
} from './operations.types';

export type EmailType =
  | 'breeder-approval'
  | 'breeder-rejection'
  | 'new-application'
  | 'document-reminder'
  | 'application-confirmation'
  | 'new-review';
export interface NotificationQuery {
  userId?: string;
  userRole?: 'adopter' | 'breeder';
  type?: NotificationAdminResponse['type'];
  isRead?: boolean;
  pageNumber: number;
  itemsPerPage: number;
}
export const operationsApi = {
  async getSystemHealth(periodHours: number = 24) {
    return (
      await apiClient.get<ApiResponse<SystemHealthResponse>>('/platform-admin/system-health', {
        params: { periodHours },
      })
    ).data.data;
  },
  async getNotifications(params: NotificationQuery) {
    return (
      await apiClient.get<ApiResponse<PaginationResponse<NotificationAdminResponse>>>(
        '/notification-admin/notifications',
        { params },
      )
    ).data.data;
  },
  async getNotificationStats() {
    return (await apiClient.get<ApiResponse<NotificationStatsResponse>>('/notification-admin/stats')).data.data;
  },
  async getKeywords() {
    return (await apiClient.get<ApiResponse<PopularKeywordResponse[]>>('/popular-keyword-admin')).data.data;
  },
  async getKeyword(id: string) {
    return (await apiClient.get<ApiResponse<PopularKeywordResponse>>(`/popular-keyword-admin/${id}`)).data.data;
  },
  async createKeyword(data: CreatePopularKeywordRequest) {
    return (await apiClient.post<ApiResponse<PopularKeywordResponse>>('/popular-keyword-admin', data)).data.data;
  },
  async updateKeyword(id: string, data: UpdatePopularKeywordRequest) {
    return (await apiClient.patch<ApiResponse<PopularKeywordResponse>>(`/popular-keyword-admin/${id}`, data)).data.data;
  },
  async deleteKeyword(id: string) {
    await apiClient.delete(`/popular-keyword-admin/${id}`);
  },
  async getCommunityReports(params: { page: number; limit: number; status?: 'pending' | 'resolved' | 'dismissed' }) {
    return (
      await apiClient.get<ApiResponse<PaginationResponse<CommunityReportAdminItemResponse>>>(
        '/community-admin/reports',
        { params },
      )
    ).data.data;
  },
  async resolveCommunityReport(reportId: string) {
    await apiClient.post(`/community-admin/reports/${reportId}/resolve`);
  },
  async dismissCommunityReport(reportId: string) {
    await apiClient.post(`/community-admin/reports/${reportId}/dismiss`);
  },
  async updateContestEntry(entryId: string, data: UpdateContestEntryStatusRequest) {
    await apiClient.patch(`/contest-admin/entries/${entryId}/status`, data);
  },
  async sendDocumentReminders() {
    return (
      await apiClient.post<ApiResponse<{ sentCount: number; breederIds: string[] }>>(
        '/breeder-verification-admin/document-reminders/send',
        undefined,
        { timeout: 120_000 },
      )
    ).data.data;
  },
  async getEmailCatalog() {
    return (
      await apiClient.get<ApiResponse<NotificationEmailPreviewCatalogResponse>>(
        '/notification-email-preview-admin/preview-all',
      )
    ).data.data;
  },
  async renderEmail(type: EmailType) {
    return (
      await apiClient.get<string>('/notification-email-preview-admin/render', {
        params: { type },
        responseType: 'text',
      })
    ).data;
  },
  async sendApprovalEmail(data: BreederApprovalEmailPreviewRequest) {
    return (
      await apiClient.post<ApiResponse<NotificationEmailPreviewResponse>>(
        '/notification-email-preview-admin/breeder-approval',
        data,
      )
    ).data.data;
  },
  async sendRejectionEmail(data: BreederRejectionEmailPreviewRequest) {
    return (
      await apiClient.post<ApiResponse<NotificationEmailPreviewResponse>>(
        '/notification-email-preview-admin/breeder-rejection',
        data,
      )
    ).data.data;
  },
  async sendApplicationEmail(data: BreederApprovalEmailPreviewRequest) {
    return (
      await apiClient.post<ApiResponse<NotificationEmailPreviewResponse>>(
        '/notification-email-preview-admin/new-application',
        data,
      )
    ).data.data;
  },
  async sendReminderEmail(data: BreederApprovalEmailPreviewRequest) {
    return (
      await apiClient.post<ApiResponse<NotificationEmailPreviewResponse>>(
        '/notification-email-preview-admin/document-reminder',
        data,
      )
    ).data.data;
  },
  async sendConfirmationEmail(data: ApplicationConfirmationEmailPreviewRequest) {
    return (
      await apiClient.post<ApiResponse<NotificationEmailPreviewResponse>>(
        '/notification-email-preview-admin/application-confirmation',
        data,
      )
    ).data.data;
  },
  async sendReviewEmail(data: BreederApprovalEmailPreviewRequest) {
    return (
      await apiClient.post<ApiResponse<NotificationEmailPreviewResponse>>(
        '/notification-email-preview-admin/new-review',
        data,
      )
    ).data.data;
  },
};
