import apiClient from '../../../shared/api/axios';

export interface Announcement {
  announcementId: string;
  title: string;
  content: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementCreateRequest {
  title: string;
  content: string;
  isActive?: boolean;
  order?: number;
}

export interface AnnouncementUpdateRequest {
  title?: string;
  content?: string;
  isActive?: boolean;
  order?: number;
}

/**
 * 공지사항(팝업/배너) 관리 API (관리자 전용)
 *
 * 백엔드 응답 형식:
 * - 목록: PaginationResponseDto를 직접 반환 {items: [...], pagination: {...}}
 * - 단건: AnnouncementResponseDto를 직접 반환 {...}
 */
export const announcementApi = {
  /**
   * 공지사항 목록 조회
   * GET /api/announcement-admin/announcements
   */
  getAnnouncements: async (): Promise<Announcement[]> => {
    const response = await apiClient.get('/announcement-admin/announcements');
    const body = response.data;

    // ApiResponseDto 래핑된 경우: {success, data: {items: [...]}}
    if (body.data?.items) return body.data.items;
    // PaginationResponseDto 직접 반환: {items: [...]}
    if (body.items) return body.items;
    // 배열 직접 반환
    if (Array.isArray(body.data)) return body.data;
    if (Array.isArray(body)) return body;

    return [];
  },

  /**
   * 공지사항 생성
   * POST /api/announcement-admin/announcement
   */
  createAnnouncement: async (data: AnnouncementCreateRequest): Promise<Announcement> => {
    const response = await apiClient.post('/announcement-admin/announcement', data);
    return response.data.data ?? response.data;
  },

  /**
   * 공지사항 수정
   * PUT /api/announcement-admin/announcement/:announcementId
   */
  updateAnnouncement: async (announcementId: string, data: AnnouncementUpdateRequest): Promise<Announcement> => {
    const response = await apiClient.put(`/announcement-admin/announcement/${announcementId}`, data);
    return response.data.data ?? response.data;
  },

  /**
   * 공지사항 삭제
   * DELETE /api/announcement-admin/announcement/:announcementId
   */
  deleteAnnouncement: async (announcementId: string): Promise<void> => {
    await apiClient.delete(`/announcement-admin/announcement/${announcementId}`);
  },
};
