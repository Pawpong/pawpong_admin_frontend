import apiClient from '../../../shared/api/axios';

export interface DeepLink {
  id: string;
  slug: string;
  title: string;
  description: string;
  targetPath: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeepLinkCreateRequest {
  slug?: string;
  title: string;
  description?: string;
  targetPath: string;
  imageUrl?: string;
  isActive?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  code: number;
  data: T;
  message: string;
  timestamp: string;
}

interface DeepLinkPage {
  items: DeepLink[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const deepLinkApi = {
  async getDeepLinks(page = 1, limit = 10): Promise<ApiResponse<DeepLinkPage>> {
    const response = await apiClient.get<ApiResponse<DeepLinkPage>>('/deep-link-admin', { params: { page, limit } });
    return response.data;
  },
  async createDeepLink(payload: DeepLinkCreateRequest): Promise<DeepLink> {
    const response = await apiClient.post<ApiResponse<DeepLink>>('/deep-link-admin', payload);
    return response.data.data;
  },
  async updateDeepLink(id: string, payload: Partial<DeepLinkCreateRequest>): Promise<DeepLink> {
    const response = await apiClient.put<ApiResponse<DeepLink>>(`/deep-link-admin/${id}`, payload);
    return response.data.data;
  },
  async deleteDeepLink(id: string): Promise<void> {
    await apiClient.delete(`/deep-link-admin/${id}`);
  },
};
