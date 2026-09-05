// 관리자 OpenAPI의 요청/응답 계약 (2026-09-05).

export type SystemHealthResponse = {
  overallStatus: 'healthy' | 'warning' | 'critical';
  asOf: string;
  period: {
    from: string;
    to: string;
  };
  services: ServicesHealth;
  summary: HealthSummary;
  issueGroups: IssueGroup[];
};

export type ServicesHealth = {
  kafka: ServiceStatus;
  redis: ServiceStatus;
  api: ServiceStatus;
};

export type ServiceStatus = {
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  lastErrorAt: string;
};

export type HealthSummary = {
  critical: number;
  warning: number;
  info: number;
};

export type IssueGroup = {
  category: 'infrastructure' | 'api_error' | 'security_probe' | 'application';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  count: number;
  firstAt: string;
  lastAt: string;
  isResolved: boolean;
};

export type NotificationAdminResponse = {
  notificationId: string;
  userId: string;
  userRole: 'adopter' | 'breeder';
  type:
    | 'profile_review'
    | 'profile_re_review'
    | 'matching'
    | 'breeder_approved'
    | 'breeder_rejected'
    | 'breeder_unapproved'
    | 'breeder_onboarding_incomplete'
    | 'breeder_suspended'
    | 'new_consult_request'
    | 'consult_request_confirmed'
    | 'consult_completed'
    | 'document_reminder'
    | 'profile_completion_reminder'
    | 'admin_broadcast'
    | 'new_review_registered'
    | 'new_pet_registered'
    | 'community_post_liked';
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  targetUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type NotificationStatsResponse = {
  totalNotifications: number;
  unreadNotifications: number;
  notificationsByType: Record<string, unknown>;
  notificationsByRole: Record<string, unknown>;
};

export type PopularKeywordResponse = {
  keywordId: string;
  keyword: string;
  rank: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreatePopularKeywordRequest = {
  keyword: string;
  rank?: number;
  isActive?: boolean;
};

export type UpdatePopularKeywordRequest = {
  keyword?: string;
  rank?: number;
  isActive?: boolean;
};

export type CommunityReportAdminItemResponse = {
  reportId: string;
  postId: string;
  reporterId: string;
  reporterNickname: string;
  reason: 'spam' | 'inappropriate_content' | 'false_info' | 'hateful_content' | 'other';
  description?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
};

export type UpdateContestEntryStatusRequest = {
  status: 'hidden' | 'deleted';
};

export type NotificationEmailPreviewCatalogResponse = {
  breederApproval: NotificationEmailTemplatePreview;
  breederRejection: NotificationEmailTemplatePreview;
  newApplication: NotificationEmailTemplatePreview;
  documentReminder: NotificationEmailTemplatePreview;
  applicationConfirmation: NotificationEmailTemplatePreview;
  newReview: NotificationEmailTemplatePreview;
};

export type NotificationEmailTemplatePreview = {
  subject: string;
  html: string;
};

export type NotificationEmailPreviewResponse = {
  recipient: string;
  subject: string;
  preview: string;
  sent: boolean;
};

export type BreederApprovalEmailPreviewRequest = {
  email: string;
  breederName: string;
};

export type BreederRejectionEmailPreviewRequest = {
  email: string;
  breederName: string;
  rejectionReasons: string[];
};

export type ApplicationConfirmationEmailPreviewRequest = {
  email: string;
  applicantName: string;
  breederName: string;
};
