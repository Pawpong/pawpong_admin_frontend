import apiClient from '../../../shared/api/axios';
import type {
    ApiResponse,
    Banner,
    BannerCreateRequest,
    BannerUpdateRequest,
    FAQ,
    FaqCreateRequest,
    FaqUpdateRequest,
} from '../../../shared/types/api.types';

/**
 * 콘텐츠 관리 API 클라이언트
 */
export const contentApi = {
    // ==================== 배너 관리 ====================

    /**
     * 배너 전체 목록 조회
     */
    getBanners: async (): Promise<Banner[]> => {
        const response = await apiClient.get<ApiResponse<Banner[]>>('/home-admin/banners');
        return response.data.data;
    },

    /**
     * 배너 생성
     */
    createBanner: async (data: BannerCreateRequest): Promise<Banner> => {
        const response = await apiClient.post<ApiResponse<Banner>>('/home-admin/banner', data);
        return response.data.data;
    },

    /**
     * 배너 수정
     */
    updateBanner: async (bannerId: string, data: BannerUpdateRequest): Promise<Banner> => {
        const response = await apiClient.put<ApiResponse<Banner>>(`/home-admin/banner/${bannerId}`, data);
        return response.data.data;
    },

    /**
     * 배너 삭제
     */
    deleteBanner: async (bannerId: string): Promise<void> => {
        await apiClient.delete(`/home-admin/banner/${bannerId}`);
    },

    // ==================== FAQ 관리 ====================

    /**
     * FAQ 전체 목록 조회
     */
    getFaqs: async (): Promise<FAQ[]> => {
        const response = await apiClient.get<ApiResponse<FAQ[]>>('/home-admin/faqs');
        return response.data.data;
    },

    /**
     * FAQ 생성
     */
    createFaq: async (data: FaqCreateRequest): Promise<FAQ> => {
        const response = await apiClient.post<ApiResponse<FAQ>>('/home-admin/faq', data);
        return response.data.data;
    },

    /**
     * FAQ 수정
     */
    updateFaq: async (faqId: string, data: FaqUpdateRequest): Promise<FAQ> => {
        const response = await apiClient.put<ApiResponse<FAQ>>(`/home-admin/faq/${faqId}`, data);
        return response.data.data;
    },

    /**
     * FAQ 삭제
     */
    deleteFaq: async (faqId: string): Promise<void> => {
        await apiClient.delete(`/home-admin/faq/${faqId}`);
    },
};
