import apiClient from '../../../shared/api/axios';

/**
 * 공지사항 타입 정의
 */
export interface Notice {
  noticeId: string;
  title: string;
  content: string;
  authorName: string;
  status: 'published' | 'draft' | 'archived';
  isPinned: boolean;
  viewCount: number;
  publishedAt?: string;
  expiredAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 공지사항 생성 요청
 */
export interface NoticeCreateRequest {
  title: string;
  content: string;
  status?: 'published' | 'draft' | 'archived';
  isPinned?: boolean;
  publishedAt?: string;
  expiredAt?: string;
}

/**
 * 공지사항 수정 요청
 */
export interface NoticeUpdateRequest {
  title?: string;
  content?: string;
  status?: 'published' | 'draft' | 'archived';
  isPinned?: boolean;
  publishedAt?: string;
  expiredAt?: string;
}

/**
 * 페이지네이션 응답
 */
export interface NoticePaginationResponse {
  success: boolean;
  code: number;
  data: {
    items: Notice[];
    pagination: {
      currentPage: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
  message: string;
  timestamp: string;
}

/**
 * 공지사항 상세 응답
 */
export interface NoticeDetailResponse {
  success: boolean;
  code: number;
  data: Notice;
  message: string;
  timestamp: string;
}

/**
 * 공지사항 API
 */
export const noticeApi = {
  /**
   * 공지사항 목록 조회 (관리자)
   */
  async getNotices(
    page: number = 1,
    limit: number = 10,
    status?: 'published' | 'draft' | 'archived',
  ): Promise<NoticePaginationResponse> {
    const params: Record<string, unknown> = { page, limit };
    if (status) {
      params.status = status;
    }

    const response = await apiClient.get<NoticePaginationResponse>('/notice-admin', { params });
    return response.data;
  },

  /**
   * 공지사항 상세 조회 (관리자)
   */
  async getNoticeDetail(noticeId: string): Promise<NoticeDetailResponse> {
    const response = await apiClient.get<NoticeDetailResponse>(`/notice-admin/${noticeId}`);
    return response.data;
  },

  /**
   * 공지사항 생성
   */
  async createNotice(data: NoticeCreateRequest): Promise<NoticeDetailResponse> {
    const response = await apiClient.post<NoticeDetailResponse>('/notice-admin', data);
    return response.data;
  },

  /**
   * 공지사항 수정
   */
  async updateNotice(noticeId: string, data: NoticeUpdateRequest): Promise<NoticeDetailResponse> {
    const response = await apiClient.patch<NoticeDetailResponse>(`/notice-admin/${noticeId}`, data);
    return response.data;
  },

  /**
   * 공지사항 삭제
   */
  async deleteNotice(noticeId: string): Promise<void> {
    await apiClient.delete(`/notice-admin/${noticeId}`);
  },
};
