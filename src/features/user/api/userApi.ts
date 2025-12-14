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
 * 사용자 관리 API 클라이언트
 */
export const userApi = {
  /**
   * 사용자 목록 조회
   */
  getUsers: async (filters?: UserSearchRequest): Promise<UserManagement[]> => {
    const response = await apiClient.get<ApiResponse<PaginationResponse<UserManagement>>>('/user-admin/users', { params: filters });
    // 백엔드가 페이지네이션 구조로 반환: {items: [], pagination: {...}}
    const data = response.data.data;
    if (data && Array.isArray(data.items)) {
      return data.items;
    }
    // 만약 직접 배열로 오면 그대로 반환
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  },

  /**
   * 사용자 상태 변경
   */
  updateUserStatus: async (
    userId: string,
    role: 'adopter' | 'breeder',
    data: UserStatusUpdateRequest
  ): Promise<UserStatusUpdateResponse> => {
    const response = await apiClient.patch<ApiResponse<UserStatusUpdateResponse>>(
      `/user-admin/users/${userId}/status`,
      data,
      { params: { role } }
    );
    return response.data.data;
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
    }
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
    const response = await apiClient.get<ApiResponse<ProfileBanner[]>>('/breeder-management-admin/profile-banners');
    return response.data.data;
  },

  /**
   * 활성화된 프로필 배너 목록 조회 (프로필 페이지 표시용)
   */
  getActiveBanners: async (): Promise<ProfileBanner[]> => {
    const response = await apiClient.get<ApiResponse<ProfileBanner[]>>('/breeder-management-admin/profile-banners/active');
    return response.data.data;
  },

  /**
   * 프로필 배너 생성
   */
  createBanner: async (data: ProfileBannerRequest): Promise<ProfileBanner> => {
    const response = await apiClient.post<ApiResponse<ProfileBanner>>('/breeder-management-admin/profile-banner', data);
    return response.data.data;
  },

  /**
   * 프로필 배너 수정
   */
  updateBanner: async (bannerId: string, data: Partial<ProfileBannerRequest>): Promise<ProfileBanner> => {
    const response = await apiClient.put<ApiResponse<ProfileBanner>>(`/breeder-management-admin/profile-banner/${bannerId}`, data);
    return response.data.data;
  },

  /**
   * 프로필 배너 삭제
   */
  deleteBanner: async (bannerId: string): Promise<void> => {
    await apiClient.delete(`/breeder-management-admin/profile-banner/${bannerId}`);
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
    const response = await apiClient.get<ApiResponse<CounselBanner[]>>('/breeder-management-admin/counsel-banners');
    return response.data.data;
  },

  /**
   * 활성화된 상담 배너 목록 조회 (상담 신청 페이지 표시용)
   */
  getActiveBanners: async (): Promise<CounselBanner[]> => {
    const response = await apiClient.get<ApiResponse<CounselBanner[]>>('/breeder-management-admin/counsel-banners/active');
    return response.data.data;
  },

  /**
   * 상담 배너 생성
   */
  createBanner: async (data: CounselBannerRequest): Promise<CounselBanner> => {
    const response = await apiClient.post<ApiResponse<CounselBanner>>('/breeder-management-admin/counsel-banner', data);
    return response.data.data;
  },

  /**
   * 상담 배너 수정
   */
  updateBanner: async (bannerId: string, data: Partial<CounselBannerRequest>): Promise<CounselBanner> => {
    const response = await apiClient.put<ApiResponse<CounselBanner>>(`/breeder-management-admin/counsel-banner/${bannerId}`, data);
    return response.data.data;
  },

  /**
   * 상담 배너 삭제
   */
  deleteBanner: async (bannerId: string): Promise<void> => {
    await apiClient.delete(`/breeder-management-admin/counsel-banner/${bannerId}`);
  },
};
