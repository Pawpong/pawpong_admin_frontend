import apiClient from '../../../shared/api/axios';

/** 생성 후처리 — pixelate 는 결과를 실제 도트 격자로 스냅시킨다 (포퐁 기본 콘셉트) */
export type AiImagePostProcessType = 'none' | 'pixelate';

/** 원본 보존 강도 — high 는 반려동물 얼굴·무늬를 더 강하게 살린다 */
export type AiImageInputFidelity = 'low' | 'high';

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
  /** referenceImageObjectKeys 와 같은 순서 */
  referenceImageUrls: string[];
  postProcessType: AiImagePostProcessType;
  pixelSize: number;
  paletteSize: number;
  inputFidelity: AiImageInputFidelity;
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
  postProcessType?: AiImagePostProcessType;
  pixelSize?: number;
  paletteSize?: number;
  inputFidelity?: AiImageInputFidelity;
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
  postProcessType?: AiImagePostProcessType;
  pixelSize?: number;
  paletteSize?: number;
  referenceImageObjectKeys?: string[];
  inputFidelity?: AiImageInputFidelity;
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

interface AssetUploadResult {
  objectKey: string;
  imageUrl: string | null;
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
   * POST /api/ai-image-admin/asset — 필터 애셋을 서버 경유로 올리고 파일키를 돌려준다.
   *
   * 버킷에 CORS 가 없어 브라우저의 presigned PUT 은 preflight 에서 403 으로 막힌다.
   * 그래서 upload-url 대신 multipart 업로드를 쓴다. 이미지 생성이 아니라 전송만이라 기본보다 넉넉히 기다린다.
   */
  uploadAsset: async (file: File, purpose: AiImageAssetPurpose): Promise<string> => {
    const formData = new FormData();
    formData.append('purpose', purpose);
    formData.append('file', file);
    // 공용 클라이언트 기본값이 JSON 이라 명시하지 않으면 axios 가 FormData 를 JSON 으로 바꿔 보낸다
    const response = await apiClient.post<{ data: AssetUploadResult }>('/ai-image-admin/asset', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60_000,
    });
    return response.data.data.objectKey;
  },
};
