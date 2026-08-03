import axios from 'axios';

import apiClient from '../../../shared/api/axios';

/** AI 필터 (관리자 응답 — 프롬프트 포함) */
export interface AiImageFilter {
  filterId: string;
  name: string;
  description: string;
  thumbnailUrl?: string;
  thumbnailFileName: string | null;
  prompt: string;
  negativePrompt: string;
  model: string;
  outputSize: string;
  referenceImageObjectKeys: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/** 필터 생성/수정 요청 */
export interface AiImageFilterRequest {
  name: string;
  description?: string;
  thumbnailFileName?: string;
  prompt: string;
  negativePrompt?: string;
  model: string;
  outputSize?: string;
  referenceImageObjectKeys?: string[];
  isActive?: boolean;
  sortOrder?: number;
}

/** 프롬프트 미리보기 요청 */
export interface AiImagePreviewRequest {
  prompt: string;
  negativePrompt?: string;
  inputObjectKey: string;
  model?: string;
  outputSize?: string;
  postProcessType?: 'none' | 'pixelate';
  pixelSize?: number;
  paletteSize?: number;
}

/** 미리보기 결과 — 생성 실패도 200 으로 내려오므로 isSuccess 로 판단한다 */
export interface AiImagePreviewResult {
  isSuccess: boolean;
  outputObjectKey: string | null;
  outputImageUrl: string | null;
  latencyMs: number;
  errorCode: string | null;
  errorMessage: string | null;
}

/** AI Agent 가동 상태 */
export interface AiImageAgentHealth {
  status: 'SERVING' | 'DEGRADED' | 'UNREACHABLE';
  isReachable: boolean;
  version: string | null;
  inFlightJobs: number;
  kafkaConnected: boolean;
  openaiConfigured: boolean;
  errorMessage: string | null;
}

/** 생성 작업 상태 */
export type AiImageJobStatus = 'pending' | 'queued' | 'processing' | 'succeeded' | 'failed';

/** 생성 작업 1건 (관리자 응답 — 프롬프트 스냅샷 포함) */
export interface AiImageJob {
  jobId: string;
  userId: string;
  userRole: 'adopter' | 'breeder';
  contestId: string | null;
  filterId: string;
  status: AiImageJobStatus;
  inputObjectKey: string;
  inputImageUrl: string | null;
  outputObjectKey: string | null;
  outputImageUrl: string | null;
  promptSnapshot: string;
  negativePromptSnapshot: string;
  modelSnapshot: string;
  outputSizeSnapshot: string;
  attempt: number;
  errorCode: string | null;
  createdAt: string;
  completedAt: string | null;
}

/** 작업 목록 조회 조건 */
export interface AiImageJobQuery {
  status?: AiImageJobStatus;
  userId?: string;
  filterId?: string;
}

/** 페이지네이션 응답 봉투 (usePaginatedData 계약) */
interface PaginatedEnvelope<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      currentPage: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

/** 애셋 업로드 용도 — 백엔드 키 경로가 용도별로 갈린다 */
export type AiImageAssetPurpose = 'thumbnail' | 'reference' | 'source';

interface UploadUrlResult {
  uploadUrl: string;
  objectKey: string;
  expiresInSeconds: number;
}

export const aiImageApi = {
  /** GET /api/ai-image-admin/filters */
  getFilters: async (): Promise<AiImageFilter[]> => {
    const response = await apiClient.get<{ data: AiImageFilter[] }>('/ai-image-admin/filters');
    return response.data.data;
  },

  /** POST /api/ai-image-admin/filter */
  createFilter: async (payload: AiImageFilterRequest): Promise<AiImageFilter> => {
    const response = await apiClient.post<{ data: AiImageFilter }>('/ai-image-admin/filter', payload);
    return response.data.data;
  },

  /** PATCH /api/ai-image-admin/filter/{filterId} */
  updateFilter: async (filterId: string, payload: Partial<AiImageFilterRequest>): Promise<AiImageFilter> => {
    const response = await apiClient.patch<{ data: AiImageFilter }>(`/ai-image-admin/filter/${filterId}`, payload);
    return response.data.data;
  },

  /** DELETE /api/ai-image-admin/filter/{filterId} */
  deleteFilter: async (filterId: string): Promise<void> => {
    await apiClient.delete(`/ai-image-admin/filter/${filterId}`);
  },

  /**
   * POST /api/ai-image-admin/filter/preview
   *
   * OpenAI 왕복이 끼어 있어 수십 초가 걸린다. 공용 클라이언트의 10초 타임아웃으로는
   * 항상 끊기므로 이 호출에만 별도 타임아웃을 준다(백엔드 상한 120초 + 여유).
   */
  generatePreview: async (payload: AiImagePreviewRequest): Promise<AiImagePreviewResult> => {
    const response = await apiClient.post<{ data: AiImagePreviewResult }>(
      '/ai-image-admin/filter/preview',
      payload,
      { timeout: 130_000 },
    );
    return response.data.data;
  },

  /** GET /api/ai-image-admin/agent/health */
  getAgentHealth: async (): Promise<AiImageAgentHealth> => {
    const response = await apiClient.get<{ data: AiImageAgentHealth }>('/ai-image-admin/agent/health');
    return response.data.data;
  },

  /** GET /api/ai-image-admin/jobs */
  getJobs: async (page: number, pageSize: number, query: AiImageJobQuery = {}) => {
    const response = await apiClient.get<PaginatedEnvelope<AiImageJob>>('/ai-image-admin/jobs', {
      params: { page, limit: pageSize, ...query },
    });
    return response.data;
  },

  /**
   * 필터 애셋을 버킷에 직접 올리고 파일키를 돌려준다.
   *
   * 1) 백엔드에서 presigned PUT URL 을 받고 2) 버킷으로 직접 PUT 한다.
   * 2단계는 공용 apiClient 를 쓰지 않는다 — Authorization 헤더가 섞이면
   * 서명 검증이 깨지고, 401 인터셉터가 버킷 응답에 반응해버린다.
   */
  uploadAsset: async (file: File, purpose: AiImageAssetPurpose): Promise<string> => {
    const issued = await apiClient.post<{ data: UploadUrlResult }>('/ai-image-admin/upload-url', {
      purpose,
      contentType: file.type,
    });
    const { uploadUrl, objectKey } = issued.data.data;

    // presigned URL 은 서명 시점의 Content-Type 과 정확히 일치해야 통과한다
    await axios.put(uploadUrl, file, { headers: { 'Content-Type': file.type } });

    return objectKey;
  },
};
