import apiClient from '../../../shared/api/axios';
import type { PaginationResponse } from '../../../shared/types/api.types';

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
    const items: Announcement[] = [];
    let page = 1;
    let hasNextPage: boolean;
    do {
      const response = await apiClient.get<PaginationResponse<Announcement>>('/announcement-admin/announcements', {
        params: { page, limit: 100 },
      });
      items.push(...response.data.items);
      hasNextPage = response.data.pagination.hasNextPage;
      page += 1;
    } while (hasNextPage);
    return items;
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
   * PATCH /api/announcement-admin/announcement/:announcementId
   */
  updateAnnouncement: async (announcementId: string, data: AnnouncementUpdateRequest): Promise<Announcement> => {
    const response = await apiClient.patch(`/announcement-admin/announcement/${announcementId}`, data);
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
