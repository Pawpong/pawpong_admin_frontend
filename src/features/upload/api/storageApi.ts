import apiClient from '../../../shared/api/axios';

/**
 * 스토리지 파일 정보
 */
export interface StorageFile {
  key: string;
  size: number;
  lastModified: string;
  url: string;
  folder: string;
}

/**
 * 폴더별 통계
 */
export interface FolderStats {
  count: number;
  totalSize: number;
}

/**
 * 스토리지 파일 목록 응답
 */
export interface StorageListResponse {
  success: boolean;
  code: number;
  data: {
    files: StorageFile[];
    totalFiles: number;
    folderStats: Record<string, FolderStats>;
    isTruncated: boolean;
  };
  message: string;
  timestamp: string;
}

/**
 * 파일 삭제 응답
 */
export interface DeleteFilesResponse {
  success: boolean;
  code: number;
  data: {
    deletedCount: number;
    failedFiles: string[];
  };
  message: string;
  timestamp: string;
}

/**
 * 파일 참조 정보
 */
export interface FileReference {
  fileKey: string;
  isReferenced: boolean;
  references: {
    collection: string;
    field: string;
    count: number;
  }[];
}

/**
 * 파일 참조 확인 응답
 */
export interface FileReferenceResponse {
  success: boolean;
  code: number;
  data: {
    files: FileReference[];
    referencedCount: number;
    orphanedCount: number;
  };
  message: string;
  timestamp: string;
}

/**
 * DB 참조 파일 목록 응답
 */
export interface ReferencedFilesResponse {
  success: boolean;
  code: number;
  data: string[];
  message: string;
  timestamp: string;
}

/**
 * 스토리지 관리 API
 */
export const storageApi = {
  /**
   * 전체 파일 목록 조회
   */
  async getFiles(prefix?: string): Promise<StorageListResponse> {
    const params: Record<string, unknown> = {};
    if (prefix) {
      params.prefix = prefix;
    }
    const response = await apiClient.get<StorageListResponse>('/upload-admin/files', { params });
    return response.data;
  },

  /**
   * 특정 폴더의 파일 목록 조회
   */
  async getFilesByFolder(folder: string): Promise<StorageListResponse> {
    const response = await apiClient.get<StorageListResponse>(`/upload-admin/files/folder/${folder}`);
    return response.data;
  },

  /**
   * 단일 파일 삭제
   */
  async deleteFile(fileName: string): Promise<void> {
    await apiClient.delete('/upload-admin/file', { params: { fileName } });
  },

  /**
   * 다중 파일 삭제
   */
  async deleteMultipleFiles(fileNames: string[]): Promise<DeleteFilesResponse> {
    const response = await apiClient.delete<DeleteFilesResponse>('/upload-admin/files', {
      data: { fileNames },
    });
    return response.data;
  },

  /**
   * 폴더 전체 삭제
   */
  async deleteFolder(folder: string): Promise<DeleteFilesResponse> {
    const response = await apiClient.delete<DeleteFilesResponse>('/upload-admin/folder', {
      params: { folder },
    });
    return response.data;
  },

  /**
   * 파일 DB 참조 확인
   */
  async checkFileReferences(fileKeys: string[]): Promise<FileReferenceResponse> {
    const response = await apiClient.post<FileReferenceResponse>('/upload-admin/files/check-references', {
      fileKeys,
    });
    return response.data;
  },

  /**
   * DB에서 참조 중인 모든 파일 조회
   */
  async getReferencedFiles(): Promise<ReferencedFilesResponse> {
    const response = await apiClient.get<ReferencedFilesResponse>('/upload-admin/files/referenced');
    return response.data;
  },
};
