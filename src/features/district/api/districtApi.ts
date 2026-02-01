import apiClient from '../../../shared/api/axios';
import type {
  ApiResponse,
  District,
  DistrictCreateRequest,
  DistrictUpdateRequest,
} from '../../../shared/types/api.types';

/**
 * 지역 관리 API 클라이언트
 */
export const districtApi = {
  /**
   * 모든 지역 조회
   */
  getAllDistricts: async (): Promise<District[]> => {
    const response = await apiClient.get<ApiResponse<District[]>>('/districts-admin');
    return response.data.data;
  },

  /**
   * 특정 지역 조회
   */
  getDistrictById: async (id: string): Promise<District> => {
    const response = await apiClient.get<ApiResponse<District>>(`/districts-admin/${id}`);
    return response.data.data;
  },

  /**
   * 지역 생성
   */
  createDistrict: async (data: DistrictCreateRequest): Promise<District> => {
    const response = await apiClient.post<ApiResponse<District>>('/districts-admin', data);
    return response.data.data;
  },

  /**
   * 지역 수정
   */
  updateDistrict: async (id: string, data: DistrictUpdateRequest): Promise<District> => {
    const response = await apiClient.patch<ApiResponse<District>>(`/districts-admin/${id}`, data);
    return response.data.data;
  },

  /**
   * 지역 삭제
   */
  deleteDistrict: async (id: string): Promise<void> => {
    await apiClient.delete(`/districts-admin/${id}`);
  },
};
