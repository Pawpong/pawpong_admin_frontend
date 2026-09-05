import apiClient from '../../../shared/api/axios';

export interface UploadResponse {
  fileName: string;
  cdnUrl: string;
  url: string;
  filename: string;
  size: number;
}

/**
 * 업로드 API
 */
export const uploadApi = {
  /**
   * 단일 파일 업로드
   * POST /api/v2/upload/single
   */
  uploadSingle: async (file: File, folder?: string): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
      formData.append('folder', folder);
    }

    const response = await apiClient.post<{ data: UploadResponse }>('/v2/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  },

  /**
   * 다중 파일 업로드
   * POST /api/v2/upload/multiple
   */
  uploadMultiple: async (files: File[], folder?: string): Promise<UploadResponse[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    if (folder) {
      formData.append('folder', folder);
    }

    const response = await apiClient.post<{ data: UploadResponse[] }>('/v2/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  },

  /**
   * 파일 삭제
   * DELETE /api/v2/upload
   */
  deleteFile: async (fileName: string): Promise<void> => {
    await apiClient.delete('/v2/upload', {
      data: { fileName },
    });
  },
};
