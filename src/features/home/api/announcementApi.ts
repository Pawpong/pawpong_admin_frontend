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
 * 공지사항 관리 API (관리자 전용)
 */
export const announcementApi = {
    /**
     * 공지사항 목록 조회 (관리자 - 모든 상태 포함)
     * GET /api/announcement-admin/announcements
     */
    getAnnouncements: async (): Promise<Announcement[]> => {
        const response = await apiClient.get<{
            data: {
                items: Announcement[];
            };
        }>('/announcement-admin/announcements');
        return response.data.data.items;
    },

    /**
     * 공지사항 생성
     * POST /api/announcement-admin/announcement
     */
    createAnnouncement: async (data: AnnouncementCreateRequest): Promise<Announcement> => {
        const response = await apiClient.post<{ data: Announcement }>('/announcement-admin/announcement', data);
        return response.data.data;
    },

    /**
     * 공지사항 수정
     * PUT /api/announcement-admin/announcement/:announcementId
     */
    updateAnnouncement: async (announcementId: string, data: AnnouncementUpdateRequest): Promise<Announcement> => {
        const response = await apiClient.put<{ data: Announcement }>(
            `/announcement-admin/announcement/${announcementId}`,
            data,
        );
        return response.data.data;
    },

    /**
     * 공지사항 삭제
     * DELETE /api/announcement-admin/announcement/:announcementId
     */
    deleteAnnouncement: async (announcementId: string): Promise<void> => {
        await apiClient.delete(`/announcement-admin/announcement/${announcementId}`);
    },
};
