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
  verificationInfo: {
    verificationStatus: 'pending' | 'approved' | 'rejected';
    subscriptionPlan: 'basic' | 'premium';
    submittedAt?: string;
    documentUrls: string[];
    isSubmittedByEmail?: boolean;
  };
  profileInfo?: any;
  createdAt: string;
}

export interface BreederVerificationPaginationResponse {
  breeders: BreederVerification[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface VerificationAction {
  action: 'approve' | 'reject';
  rejectionReason?: string;
}

/**
 * 신고 관련 타입 (백엔드 API와 일치)
 */
export interface BreederReport {
  breederName: string;
  breederId: string;
  report: {
    reportId: string;
    reporterId: string;
    reason: string;
    description: string;
    status: 'pending' | 'approved' | 'rejected';
    reportedAt: string;
    adminAction?: string;
  };
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
  pageNumber?: number;
  itemsPerPage?: number;
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
  statisticsInfo?: any;
}

export interface UserSearchRequest {
  userRole?: 'adopter' | 'breeder';
  accountStatus?: 'active' | 'suspended' | 'deactivated';
  searchKeyword?: string;
  pageNumber?: number;
  itemsPerPage?: number;
}

export interface UserStatusUpdateRequest {
  accountStatus: 'active' | 'suspended' | 'deactivated';
  reason?: string;
}

export interface UserStatusUpdateResponse {
  userId: string;
  accountStatus: string;
  updatedAt: string;
}

/**
 * 표준 질문 관련 타입
 */
export interface StandardQuestion {
  id: string;
  title: string;
  description: string;
  type: 'text' | 'textarea' | 'number' | 'radio' | 'checkbox' | 'select' | 'date' | 'file';
  options: string[];
  isRequired: boolean;
  isActive: boolean;
  order: number;
}
