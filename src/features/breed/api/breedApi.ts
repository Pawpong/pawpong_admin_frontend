import apiClient from '../../../shared/api/axios';
import type { ApiResponse, Breed, BreedCreateRequest, BreedUpdateRequest } from '../../../shared/types/api.types';

/**
 * 품종 관리 API 클라이언트
 */
export const breedApi = {
    /**
     * 모든 품종 조회
     */
    getAllBreeds: async (): Promise<Breed[]> => {
        const response = await apiClient.get<ApiResponse<Breed[]>>('/breeds-admin');
        return response.data.data;
    },

    /**
     * 특정 품종 조회
     */
    getBreedById: async (id: string): Promise<Breed> => {
        const response = await apiClient.get<ApiResponse<Breed>>(`/breeds-admin/${id}`);
        return response.data.data;
    },

    /**
     * 품종 생성
     */
    createBreed: async (data: BreedCreateRequest): Promise<Breed> => {
        const response = await apiClient.post<ApiResponse<Breed>>('/breeds-admin', data);
        return response.data.data;
    },

    /**
     * 품종 수정
     */
    updateBreed: async (id: string, data: BreedUpdateRequest): Promise<Breed> => {
        const response = await apiClient.patch<ApiResponse<Breed>>(`/breeds-admin/${id}`, data);
        return response.data.data;
    },

    /**
     * 품종 삭제
     */
    deleteBreed: async (id: string): Promise<void> => {
        await apiClient.delete(`/breeds-admin/${id}`);
    },
};
