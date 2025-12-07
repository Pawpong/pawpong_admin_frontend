import apiClient from '../../../shared/api/axios';
import type {
  ApiResponse,
  UserManagement,
  UserSearchRequest,
  UserStatusUpdateRequest,
  UserStatusUpdateResponse,
} from '../../../shared/types/api.types';

/**
 * 사용자 관리 API 클라이언트
 */
export const userApi = {
  /**
   * 사용자 목록 조회
   */
  getUsers: async (filters?: UserSearchRequest): Promise<UserManagement[]> => {
    const response = await apiClient.get<ApiResponse<any>>('/user-admin/users', { params: filters });
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
