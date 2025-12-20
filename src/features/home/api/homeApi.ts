import apiClient from '../../../shared/api/axios';

export interface Banner {
  bannerId: string;
  desktopImageUrl: string; // PC/Pad 버전 이미지 URL
  mobileImageUrl: string; // 모바일 버전 이미지 URL
  desktopImageFileName: string; // PC/Pad 버전 파일명 (수정 시 필요)
  mobileImageFileName: string; // 모바일 버전 파일명 (수정 시 필요)
  linkType: 'internal' | 'external';
  linkUrl: string;
  title?: string;
  description?: string;
  order: number;
  isActive?: boolean;
}

export interface BannerCreateRequest {
  desktopImageFileName: string; // PC/Pad 버전 파일명
  mobileImageFileName: string; // 모바일 버전 파일명
  linkType: 'internal' | 'external';
  linkUrl: string;
  title?: string;
  description?: string;
  order?: number;
  isActive?: boolean;
}

export interface BannerUpdateRequest {
  desktopImageFileName?: string; // PC/Pad 버전 파일명
  mobileImageFileName?: string; // 모바일 버전 파일명
  linkType?: 'internal' | 'external';
  linkUrl?: string;
  title?: string;
  description?: string;
  order?: number;
  isActive?: boolean;
}

export interface Faq {
  faqId: string;
  question: string;
  answer: string;
  category: string;
  userType: 'adopter' | 'breeder';
  order: number;
  isActive?: boolean;
}

export interface FaqCreateRequest {
  question: string;
  answer: string;
  category: string;
  userType: 'adopter' | 'breeder';
  order?: number;
  isActive?: boolean;
}

export interface FaqUpdateRequest {
  question?: string;
  answer?: string;
  category?: string;
  userType?: 'adopter' | 'breeder';
  order?: number;
  isActive?: boolean;
}

/**
 * 홈페이지 관리 API (배너, FAQ)
 */
export const homeApi = {
  // ===== 배너 관리 =====

  /**
   * 배너 목록 조회 (관리자)
   * GET /api/home-admin/banners
   */
  getBanners: async (): Promise<Banner[]> => {
    const response = await apiClient.get<{ data: Banner[] }>('/home-admin/banners');
    return response.data.data;
  },

  /**
   * 배너 생성
   * POST /api/home-admin/banner
   */
  createBanner: async (data: BannerCreateRequest): Promise<Banner> => {
    const response = await apiClient.post<{ data: Banner }>('/home-admin/banner', data);
    return response.data.data;
  },

  /**
   * 배너 수정
   * PUT /api/home-admin/banner/:bannerId
   */
  updateBanner: async (bannerId: string, data: BannerUpdateRequest): Promise<Banner> => {
    const response = await apiClient.put<{ data: Banner }>(`/home-admin/banner/${bannerId}`, data);
    return response.data.data;
  },

  /**
   * 배너 삭제
   * DELETE /api/home-admin/banner/:bannerId
   */
  deleteBanner: async (bannerId: string): Promise<void> => {
    await apiClient.delete(`/home-admin/banner/${bannerId}`);
  },

  // ===== FAQ 관리 =====

  /**
   * FAQ 목록 조회 (관리자)
   * GET /api/home-admin/faqs
   */
  getFaqs: async (): Promise<Faq[]> => {
    const response = await apiClient.get<{ data: Faq[] }>('/home-admin/faqs');
    return response.data.data;
  },

  /**
   * FAQ 생성
   * POST /api/home-admin/faq
   */
  createFaq: async (data: FaqCreateRequest): Promise<Faq> => {
    const response = await apiClient.post<{ data: Faq }>('/home-admin/faq', data);
    return response.data.data;
  },

  /**
   * FAQ 수정
   * PUT /api/home-admin/faq/:faqId
   */
  updateFaq: async (faqId: string, data: FaqUpdateRequest): Promise<Faq> => {
    const response = await apiClient.put<{ data: Faq }>(`/home-admin/faq/${faqId}`, data);
    return response.data.data;
  },

  /**
   * FAQ 삭제
   * DELETE /api/home-admin/faq/:faqId
   */
  deleteFaq: async (faqId: string): Promise<void> => {
    await apiClient.delete(`/home-admin/faq/${faqId}`);
  },
};
