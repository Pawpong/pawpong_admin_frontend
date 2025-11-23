import apiClient from '../../../shared/api/axios';
import type {
  ApiResponse,
  StandardQuestion,
  StandardQuestionUpdateRequest,
  StandardQuestionToggleStatusRequest,
  StandardQuestionReorderRequest,
} from '../../../shared/types/api.types';

/**
 * 표준 질문 관리 API 클라이언트
 */
export const standardQuestionApi = {
  /**
   * 표준 질문 전체 목록 조회 (비활성화 포함)
   */
  getAllQuestions: async (): Promise<StandardQuestion[]> => {
    const response = await apiClient.get<ApiResponse<StandardQuestion[]>>(
      '/standard-question-admin'
    );
    return response.data.data;
  },

  /**
   * 표준 질문 수정
   */
  updateQuestion: async (
    id: string,
    data: StandardQuestionUpdateRequest
  ): Promise<StandardQuestion> => {
    const response = await apiClient.patch<ApiResponse<StandardQuestion>>(
      `/standard-question-admin/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * 표준 질문 활성화/비활성화 상태 변경
   */
  toggleQuestionStatus: async (
    id: string,
    data: StandardQuestionToggleStatusRequest
  ): Promise<StandardQuestion> => {
    const response = await apiClient.patch<ApiResponse<StandardQuestion>>(
      `/standard-question-admin/${id}/status`,
      data
    );
    return response.data.data;
  },

  /**
   * 표준 질문 순서 변경
   */
  reorderQuestions: async (data: StandardQuestionReorderRequest): Promise<boolean> => {
    const response = await apiClient.post<ApiResponse<boolean>>(
      '/standard-question-admin/reorder',
      data
    );
    return response.data.data;
  },

  /**
   * 표준 질문 재시딩 (초기화)
   */
  reseedQuestions: async (): Promise<boolean> => {
    const response = await apiClient.post<ApiResponse<boolean>>(
      '/standard-question-admin/reseed'
    );
    return response.data.data;
  },
};
