import apiClient from '../../../shared/api/axios';
import type {
  ApiResponse,
  PaginationResponse,
  ReviewReportItem,
  ReviewDeleteResponse,
} from '../../../shared/types/api.types';

/**
 * 후기 신고 관리 API 클라이언트
 */
export const reviewReportApi = {
  /**
   * 신고된 후기 목록 조회
   */
  getReviewReports: async (page: number = 1, limit: number = 10): Promise<PaginationResponse<ReviewReportItem>> => {
    const response = await apiClient.get<ApiResponse<PaginationResponse<ReviewReportItem>>>(
      '/adopter-admin/reviews/reports',
      { params: { page, limit } },
    );
    return response.data.data;
  },

  /**
   * 부적절한 후기 삭제
   */
  deleteReview: async (breederId: string, reviewId: string): Promise<ReviewDeleteResponse> => {
    const response = await apiClient.delete<ApiResponse<ReviewDeleteResponse>>(
      `/adopter-admin/reviews/${breederId}/${reviewId}`,
    );
    return response.data.data;
  },
};
