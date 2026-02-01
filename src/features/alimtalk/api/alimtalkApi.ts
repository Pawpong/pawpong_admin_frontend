import apiClient from '../../../shared/api/axios';
import type {
  ApiResponse,
  AlimtalkTemplate,
  AlimtalkTemplateListResponse,
  AlimtalkTemplateUpdateRequest,
  AlimtalkTemplateCreateRequest,
} from '../../../shared/types/api.types';

/**
 * 알림톡 템플릿 관리 API 클라이언트
 *
 * 백엔드 모듈: AlimtalkAdminModule
 * 엔드포인트: /api/alimtalk-admin/*
 */
export const alimtalkApi = {
  /**
   * 알림톡 템플릿 목록 조회
   * 엔드포인트: GET /api/alimtalk-admin/templates
   */
  getTemplates: async (): Promise<AlimtalkTemplate[]> => {
    const response = await apiClient.get<ApiResponse<AlimtalkTemplateListResponse>>('/alimtalk-admin/templates');
    return response.data.data.templates;
  },

  /**
   * 알림톡 템플릿 상세 조회
   * 엔드포인트: GET /api/alimtalk-admin/templates/:templateCode
   */
  getTemplateByCode: async (templateCode: string): Promise<AlimtalkTemplate> => {
    const response = await apiClient.get<ApiResponse<AlimtalkTemplate>>(`/alimtalk-admin/templates/${templateCode}`);
    return response.data.data;
  },

  /**
   * 알림톡 템플릿 수정
   * 엔드포인트: PUT /api/alimtalk-admin/templates/:templateCode
   */
  updateTemplate: async (
    templateCode: string,
    updateData: AlimtalkTemplateUpdateRequest,
  ): Promise<AlimtalkTemplate> => {
    const response = await apiClient.put<ApiResponse<AlimtalkTemplate>>(
      `/alimtalk-admin/templates/${templateCode}`,
      updateData,
    );
    return response.data.data;
  },

  /**
   * 알림톡 템플릿 생성
   * 엔드포인트: POST /api/alimtalk-admin/templates
   */
  createTemplate: async (createData: AlimtalkTemplateCreateRequest): Promise<AlimtalkTemplate> => {
    const response = await apiClient.post<ApiResponse<AlimtalkTemplate>>('/alimtalk-admin/templates', createData);
    return response.data.data;
  },

  /**
   * 알림톡 템플릿 삭제
   * 엔드포인트: DELETE /api/alimtalk-admin/templates/:templateCode
   */
  deleteTemplate: async (templateCode: string): Promise<void> => {
    await apiClient.delete(`/alimtalk-admin/templates/${templateCode}`);
  },

  /**
   * 알림톡 템플릿 캐시 새로고침
   * 엔드포인트: POST /api/alimtalk-admin/templates/refresh-cache
   */
  refreshCache: async (): Promise<void> => {
    await apiClient.post('/alimtalk-admin/templates/refresh-cache');
  },
};
