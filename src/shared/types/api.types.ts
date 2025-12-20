/**
 * API 공통 응답 타입
 */
export interface ApiResponse<T> {
  success: boolean;
  code: number;
  data: T;
  message?: string;
  error?: string;
  timestamp: string;
}

/**
 * 페이지네이션 응답 타입
 */
export interface PaginationResponse<T> {
  items: T[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * 인증 관련 타입
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  adminId: string;
  email: string;
  name: string;
  adminLevel: 'super_admin' | 'breeder_admin' | 'report_admin' | 'stats_admin';
  permissions: {
    canManageUsers: boolean;
    canManageBreeders: boolean;
    canManageReports: boolean;
    canViewStatistics: boolean;
    canManageAdmins: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

/**
 * 사용자 관련 타입
 */
export interface User {
  userId: string;
  email: string;
  name: string;
  role: 'adopter' | 'breeder';
  status: 'active' | 'suspended' | 'deleted';
  createdAt: string;
  lastLoginAt?: string;
}

/**
 * 브리더 인증 관련 타입 (백엔드 API와 일치)
 */
export interface BreederVerification {
  breederId: string;
  breederName: string;
  emailAddress: string;
  accountStatus?: 'active' | 'suspended' | 'deleted';
  verificationInfo: {
    verificationStatus: 'pending' | 'approved' | 'rejected';
    subscriptionPlan: 'basic' | 'premium';
    level: 'new' | 'elite';
    submittedAt?: string;
    documents: Array<{
      type: string;
      fileName: string;
      fileUrl?: string;
      url?: string; // 호환성을 위해 유지
      uploadedAt: Date;
    }>;
    isSubmittedByEmail?: boolean;
  };
  profileInfo?: Record<string, unknown>;
  createdAt: string;
  updatedAt?: string;
}

export type BreederVerificationPaginationResponse = PaginationResponse<BreederVerification>;

export interface VerificationAction {
  verificationStatus: 'reviewing' | 'approved' | 'rejected';
  rejectionReason?: string;
}

/**
 * 신고 관련 타입 (백엔드 API와 일치 - 평면 구조)
 */
export interface BreederReport {
  reportId: string;
  reporterId: string;
  reporterName: string;
  type: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  reportedAt: string;
  targetType: 'breeder';
  targetId: string;
  targetName: string;
  adminNotes?: string;
}

export interface ReviewReport {
  reportId: string;
  reviewId: string;
  reviewContent: string;
  reviewAuthorName: string;
  breederId: string;
  breederName: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  description: string;
  status: 'pending' | 'resolved' | 'rejected';
  reportedAt: string;
}

export interface ReportAction {
  action: 'resolve' | 'reject';
  adminNotes: string;
}

/**
 * 콘텐츠 관련 타입 (백엔드 API와 일치)
 */
export interface Banner {
  bannerId: string;
  imageUrl: string;
  linkType: 'internal' | 'external';
  linkUrl: string;
  title?: string;
  description?: string;
  order: number;
  isActive?: boolean;
}

export interface BannerCreateRequest {
  imageFileName: string;
  linkType: 'internal' | 'external';
  linkUrl: string;
  order?: number;
  isActive?: boolean;
  title?: string;
  description?: string;
}

export interface BannerUpdateRequest {
  imageFileName?: string;
  linkType?: 'internal' | 'external';
  linkUrl?: string;
  order?: number;
  isActive?: boolean;
  title?: string;
  description?: string;
}

export interface FAQ {
  faqId: string;
  question: string;
  answer: string;
  category: 'service' | 'adoption' | 'breeder' | 'payment' | 'etc';
  userType: 'adopter' | 'breeder' | 'both';
  order: number;
  isActive?: boolean;
}

export interface FaqCreateRequest {
  question: string;
  answer: string;
  category: 'service' | 'adoption' | 'breeder' | 'payment' | 'etc';
  userType: 'adopter' | 'breeder' | 'both';
  order?: number;
  isActive?: boolean;
}

export interface FaqUpdateRequest {
  question?: string;
  answer?: string;
  category?: 'service' | 'adoption' | 'breeder' | 'payment' | 'etc';
  userType?: 'adopter' | 'breeder' | 'both';
  order?: number;
  isActive?: boolean;
}

/**
 * 통계 관련 타입 (백엔드 API와 일치)
 */
export interface UserStats {
  totalAdopterCount: number;
  newAdopterCount: number;
  activeAdopterCount: number;
  totalBreederCount: number;
  newBreederCount: number;
  approvedBreederCount: number;
  pendingBreederCount: number;
}

export interface AdoptionStats {
  totalApplicationCount: number;
  newApplicationCount: number;
  completedAdoptionCount: number;
  pendingApplicationCount: number;
  rejectedApplicationCount: number;
}

export interface PopularBreed {
  breedName: string;
  petType: string;
  applicationCount: number;
  completedAdoptionCount: number;
  averagePrice: number;
}

export interface RegionalStats {
  cityName: string;
  districtName: string;
  breederCount: number;
  applicationCount: number;
  completedAdoptionCount: number;
}

export interface BreederPerformance {
  breederId: string;
  breederName: string;
  cityName: string;
  applicationCount: number;
  completedAdoptionCount: number;
  averageRating: number;
  totalReviewCount: number;
  profileViewCount: number;
}

export interface ReportStats {
  totalReportCount: number;
  newReportCount: number;
  resolvedReportCount: number;
  pendingReportCount: number;
  dismissedReportCount: number;
}

export interface PlatformStats {
  userStatistics: UserStats;
  adoptionStatistics: AdoptionStats;
  popularBreeds: PopularBreed[];
  regionalStatistics: RegionalStats[];
  breederPerformanceRanking: BreederPerformance[];
  reportStatistics: ReportStats;
}

/**
 * MVP 통계 관련 타입 (백엔드 API와 일치)
 */
export interface ActiveUserStats {
  adopters7Days: number;
  adopters14Days: number;
  adopters28Days: number;
  breeders7Days: number;
  breeders14Days: number;
  breeders28Days: number;
}

export interface ConsultationStats {
  consultations7Days: number;
  consultations14Days: number;
  consultations28Days: number;
  adoptions7Days: number;
  adoptions14Days: number;
  adoptions28Days: number;
}

export interface FilterUsageItem {
  filterType: string;
  filterValue: string;
  usageCount: number;
}

export interface FilterUsageStats {
  topLocations: FilterUsageItem[];
  topBreeds: FilterUsageItem[];
  emptyResultFilters: FilterUsageItem[];
}

export interface BreederResubmissionStats {
  totalRejections: number;
  resubmissions: number;
  resubmissionRate: number;
  resubmissionApprovals: number;
  resubmissionApprovalRate: number;
}

/**
 * 브리더 통계 타입
 */
export interface BreederStats {
  totalApproved: number;
  eliteCount: number;
  newCount: number;
}

export interface MvpStats {
  activeUserStats: ActiveUserStats;
  consultationStats: ConsultationStats;
  filterUsageStats: FilterUsageStats;
  breederResubmissionStats: BreederResubmissionStats;
}

/**
 * 입양 신청 모니터링 관련 타입 (백엔드 API와 일치)
 */
export interface ApplicationData {
  applicationId: string;
  adopterId: string;
  adopterName: string;
  breederId: string;
  breederName: string;
  petId: string;
  petName: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected' | 'completed';
  appliedAt: string;
  lastUpdatedAt: string;
}

export interface ApplicationMonitoringResponse {
  applications: ApplicationData[];
  totalCount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  completedCount: number;
}

export interface ApplicationMonitoringRequest {
  targetBreederId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

/**
 * 사용자 관리 관련 타입 (백엔드 API와 일치)
 */
export interface UserManagement {
  userId: string;
  userName: string;
  emailAddress: string;
  userRole: 'adopter' | 'breeder';
  accountStatus: 'active' | 'suspended' | 'deactivated';
  lastLoginAt: string;
  createdAt: string;
  statisticsInfo?: Record<string, unknown>;
}

export interface UserSearchRequest {
  userRole?: 'adopter' | 'breeder';
  accountStatus?: 'active' | 'suspended' | 'deactivated';
  searchKeyword?: string;
  page?: number;
  limit?: number;
}

export interface UserStatusUpdateRequest {
  accountStatus: 'active' | 'suspended' | 'deleted';
  actionReason?: string;
}

export interface UserStatusUpdateResponse {
  userId: string;
  accountStatus: string;
  updatedAt: string;
}

/**
 * 표준 질문 관련 타입 (백엔드 API와 일치)
 */
export interface StandardQuestion {
  id: string;
  type: 'text' | 'textarea' | 'checkbox' | 'radio' | 'select';
  label: string;
  required: boolean;
  order: number;
  isActive: boolean;
  options?: string[];
  placeholder?: string;
  description?: string;
}

export interface StandardQuestionUpdateRequest {
  type?: 'text' | 'textarea' | 'checkbox' | 'radio' | 'select';
  label?: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  description?: string;
}

export interface StandardQuestionToggleStatusRequest {
  isActive: boolean;
}

export interface ReorderItem {
  id: string;
  order: number;
}

export interface StandardQuestionReorderRequest {
  reorderData: ReorderItem[];
}

/**
 * 후기 신고 관련 타입 (백엔드 API와 일치)
 */
export interface ReviewReportItem {
  reviewId: string;
  breederId: string;
  breederName: string;
  reportedBy: string;
  reporterName: string;
  reportReason: string;
  reportDescription: string;
  reportedAt: string;
  content: string;
  writtenAt: string;
  isVisible: boolean;
}

export interface ReviewDeleteResponse {
  reviewId: string;
  breederId: string;
  breederName: string;
  deleteReason: string;
  deletedAt: string;
  message: string;
}

/**
 * 품종 관리 관련 타입 (백엔드 API와 일치)
 */
export interface Breed {
  id: string;
  petType: 'dog' | 'cat';
  category: string;
  categoryDescription?: string;
  breeds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BreedCreateRequest {
  petType: 'dog' | 'cat';
  category: string;
  categoryDescription?: string;
  breeds: string[];
}

export interface BreedUpdateRequest {
  category?: string;
  categoryDescription?: string;
  breeds?: string[];
}

/**
 * 지역 관리 관련 타입 (백엔드 API와 일치)
 */
export interface District {
  id: string;
  city: string;
  districts: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DistrictCreateRequest {
  city: string;
  districts: string[];
}

export interface DistrictUpdateRequest {
  city?: string;
  districts?: string[];
}
