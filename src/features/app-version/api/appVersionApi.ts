import apiClient from '../../../shared/api/axios';

/**
 * 앱 버전 정보
 */
export interface AppVersion {
  appVersionId: string;
  platform: 'ios' | 'android';
  latestVersion: string;
  minRequiredVersion: string;
  forceUpdateMessage: string;
  recommendUpdateMessage: string;
  iosStoreUrl: string;
  androidStoreUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 앱 버전 생성 요청
 */
export interface AppVersionCreateRequest {
  platform: 'ios' | 'android';
  latestVersion: string;
  minRequiredVersion: string;
  forceUpdateMessage: string;
  recommendUpdateMessage: string;
  iosStoreUrl: string;
  androidStoreUrl: string;
  isActive?: boolean;
}

/**
 * 앱 버전 수정 요청
 */
export interface AppVersionUpdateRequest {
  latestVersion?: string;
  minRequiredVersion?: string;
  forceUpdateMessage?: string;
  recommendUpdateMessage?: string;
  iosStoreUrl?: string;
  androidStoreUrl?: string;
  isActive?: boolean;
}

/**
 * 앱 버전 페이지네이션 응답
 */
interface AppVersionPaginationResponse {
  success: boolean;
  code: number;
  data: {
    items: AppVersion[];
    pagination: {
      currentPage: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
  message: string;
  timestamp: string;
}

/**
 * 앱 버전 단일 응답
 */
interface AppVersionResponse {
  success: boolean;
  code: number;
  data: AppVersion;
  message: string;
  timestamp: string;
}

/**
 * 앱 버전 관리 API (관리자 전용)
 */
export const appVersionApi = {
  /**
   * 앱 버전 목록 조회
   */
  async getAppVersions(page: number = 1, pageSize: number = 10): Promise<AppVersionPaginationResponse> {
    const response = await apiClient.get<AppVersionPaginationResponse>('/app-version-admin', {
      params: { page, limit: pageSize },
    });
    return response.data;
  },

  /**
   * 앱 버전 생성
   */
  async createAppVersion(data: AppVersionCreateRequest): Promise<AppVersionResponse> {
    const response = await apiClient.post<AppVersionResponse>('/app-version-admin', data);
    return response.data;
  },

  /**
   * 앱 버전 수정
   */
  async updateAppVersion(appVersionId: string, data: AppVersionUpdateRequest): Promise<AppVersionResponse> {
    const response = await apiClient.patch<AppVersionResponse>(`/app-version-admin/${appVersionId}`, data);
    return response.data;
  },

  /**
   * 앱 버전 삭제
   */
  async deleteAppVersion(appVersionId: string): Promise<void> {
    await apiClient.delete(`/app-version-admin/${appVersionId}`);
  },
};
