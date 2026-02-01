import apiClient from '../../../shared/api/axios';
import type {
  ApiResponse,
  UserManagement,
  UserSearchRequest,
  UserStatusUpdateRequest,
  UserStatusUpdateResponse,
  PaginationResponse,
} from '../../../shared/types/api.types';

/**
 * 관리자 프로필 인터페이스
 */
export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  status: string;
  adminLevel: string;
  createdAt: string;
}

/**
 * 프로필 이미지 업로드 응답
 */
export interface ProfileImageUploadResponse {
  adminId: string;
  profileImageUrl: string;
  message: string;
  updatedAt: string;
}

/**
 * 프로필 배너 인터페이스
 */
export interface ProfileBanner {
  bannerId: string;
  imageUrl: string;
  imageFileName: string;
  bannerType: 'login' | 'signup';
  linkType?: 'internal' | 'external';
  linkUrl?: string;
  title?: string;
  description?: string;
  order: number;
  isActive: boolean;
}

/**
 * 프로필 배너 생성/수정 요청
 */
export interface ProfileBannerRequest {
  imageFileName: string;
  bannerType: 'login' | 'signup';
  linkType?: 'internal' | 'external';
  linkUrl?: string;
  order: number;
  isActive?: boolean;
  title?: string;
  description?: string;
}

/**
 * 상담 배너 인터페이스
 */
export interface CounselBanner {
  bannerId: string;
  imageUrl: string;
  imageFileName: string;
  linkType?: 'internal' | 'external';
  linkUrl?: string;
  title?: string;
  description?: string;
  order: number;
  isActive: boolean;
}

/**
 * 상담 배너 생성/수정 요청
 */
export interface CounselBannerRequest {
  imageFileName: string;
  linkType?: 'internal' | 'external';
  linkUrl?: string;
  order: number;
  isActive?: boolean;
  title?: string;
  description?: string;
}

/**
 * 탈퇴 사용자 인터페이스
 */
export interface DeletedUser {
  userId: string;
  email: string;
  nickname: string;
  userRole: 'adopter' | 'breeder';
  deleteReason: string;
  deleteReasonDetail?: string;
  deletedAt: string;
  createdAt: string;
  phone?: string;
}

/**
 * 탈퇴 사용자 검색 필터
 */
export interface DeletedUserSearchRequest {
  page?: number;
  pageSize?: number;
  role?: 'all' | 'adopter' | 'breeder';
  deleteReason?: string;
}

/**
 * 탈퇴 사용자 통계
 */
export interface DeletedUserStats {
  totalDeletedUsers: number;
  totalDeletedAdopters: number;
  totalDeletedBreeders: number;
  adopterReasonStats: Array<{
    reason: string;
    reasonLabel: string;
    count: number;
    percentage: number;
  }>;
  breederReasonStats: Array<{
    reason: string;
    reasonLabel: string;
    count: number;
    percentage: number;
  }>;
  otherReasonDetails: Array<{
    userType: 'adopter' | 'breeder';
    reason: string;
    deletedAt: string;
  }>;
  last7DaysCount: number;
  last30DaysCount: number;
}

/**
 * 사용자 관리 API 클라이언트
 */
export const userApi = {
  /**
   * 사용자 목록 조회
   */
  getUsers: async (filters?: UserSearchRequest): Promise<PaginationResponse<UserManagement>> => {
    const response = await apiClient.get<ApiResponse<PaginationResponse<UserManagement>>>('/user-admin/users', {
      params: filters,
    });
    // 백엔드가 페이지네이션 구조로 반환: {items: [], pagination: {...}}
    return response.data.data;
  },

  /**
   * 사용자 상태 변경
   */
  updateUserStatus: async (
    userId: string,
    role: 'adopter' | 'breeder',
    data: UserStatusUpdateRequest,
  ): Promise<UserStatusUpdateResponse> => {
    const response = await apiClient.patch<ApiResponse<UserStatusUpdateResponse>>(
      `/user-admin/users/${userId}/status`,
      data,
      { params: { role } },
    );
    return response.data.data;
  },

  /**
   * 탈퇴 사용자 목록 조회
   */
  getDeletedUsers: async (filters?: DeletedUserSearchRequest): Promise<PaginationResponse<DeletedUser>> => {
    const response = await apiClient.get<ApiResponse<PaginationResponse<DeletedUser>>>('/user-admin/deleted-users', {
      params: filters,
    });
    return response.data.data;
  },

  /**
   * 탈퇴 사용자 통계 조회
   */
  getDeletedUserStats: async (): Promise<DeletedUserStats> => {
    const response = await apiClient.get<ApiResponse<DeletedUserStats>>('/user-admin/deleted-users/stats');
    return response.data.data;
  },

  /**
   * 탈퇴 사용자 복구
   */
  restoreDeletedUser: async (userId: string, role: 'adopter' | 'breeder'): Promise<void> => {
    await apiClient.patch(`/user-admin/deleted-users/${userId}/restore`, {}, { params: { role } });
  },

  /**
   * 사용자 영구 삭제 (하드 딜리트)
   * deleted 상태의 사용자만 삭제 가능하며, super_admin 권한이 필요합니다.
   */
  hardDeleteUser: async (userId: string, role: 'adopter' | 'breeder'): Promise<void> => {
    await apiClient.patch(`/user-admin/users/${userId}/hard-delete`, {}, { params: { role } });
  },
};

/**
 * 관리자 프로필 조회
 */
export const getAdminProfile = async (): Promise<AdminProfile> => {
  const response = await apiClient.get<ApiResponse<AdminProfile>>('/user-admin/profile');
  return response.data.data;
};

/**
 * 관리자 프로필 이미지 업로드
 */
export const uploadProfileImage = async (file: File): Promise<ProfileImageUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<ApiResponse<ProfileImageUploadResponse>>(
    '/user-admin/profile/image',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
  return response.data.data;
};

/**
 * 프로필 배너 API
 */
export const profileBannerApi = {
  /**
   * 전체 프로필 배너 목록 조회 (관리자용)
   */
  getAllBanners: async (): Promise<ProfileBanner[]> => {
    const response = await apiClient.get<ApiResponse<ProfileBanner[]>>('/auth-admin/profile-banners');
    return response.data.data;
  },

  /**
   * 활성화된 프로필 배너 목록 조회 (로그인 페이지 표시용)
   */
  getActiveBanners: async (): Promise<ProfileBanner[]> => {
    const response = await apiClient.get<ApiResponse<ProfileBanner[]>>('/auth/login-banners');
    return response.data.data;
  },

  /**
   * 프로필 배너 생성
   */
  createBanner: async (data: ProfileBannerRequest): Promise<ProfileBanner> => {
    const response = await apiClient.post<ApiResponse<ProfileBanner>>('/auth-admin/profile-banner', data);
    return response.data.data;
  },

  /**
   * 프로필 배너 수정
   */
  updateBanner: async (bannerId: string, data: Partial<ProfileBannerRequest>): Promise<ProfileBanner> => {
    const response = await apiClient.put<ApiResponse<ProfileBanner>>(`/auth-admin/profile-banner/${bannerId}`, data);
    return response.data.data;
  },

  /**
   * 프로필 배너 삭제
   */
  deleteBanner: async (bannerId: string): Promise<void> => {
    await apiClient.delete(`/auth-admin/profile-banner/${bannerId}`);
  },
};

/**
 * 상담 배너 API
 */
export const counselBannerApi = {
  /**
   * 전체 상담 배너 목록 조회 (관리자용)
   */
  getAllBanners: async (): Promise<CounselBanner[]> => {
    const response = await apiClient.get<ApiResponse<CounselBanner[]>>('/auth-admin/counsel-banners');
    return response.data.data;
  },

  /**
   * 활성화된 상담 배너 목록 조회 (회원가입 페이지 표시용)
   */
  getActiveBanners: async (): Promise<CounselBanner[]> => {
    const response = await apiClient.get<ApiResponse<CounselBanner[]>>('/auth/register-banners');
    return response.data.data;
  },

  /**
   * 상담 배너 생성
   */
  createBanner: async (data: CounselBannerRequest): Promise<CounselBanner> => {
    const response = await apiClient.post<ApiResponse<CounselBanner>>('/auth-admin/counsel-banner', data);
    return response.data.data;
  },

  /**
   * 상담 배너 수정
   */
  updateBanner: async (bannerId: string, data: Partial<CounselBannerRequest>): Promise<CounselBanner> => {
    const response = await apiClient.put<ApiResponse<CounselBanner>>(`/auth-admin/counsel-banner/${bannerId}`, data);
    return response.data.data;
  },

  /**
   * 상담 배너 삭제
   */
  deleteBanner: async (bannerId: string): Promise<void> => {
    await apiClient.delete(`/auth-admin/counsel-banner/${bannerId}`);
  },
};
