import apiClient from '../../../shared/api/axios';
import type { ApiResponse } from '../../../shared/types/api.types';
import type { CommunityReportReview } from '../model/community-report.types';
import {
  COMMUNITY_REPORT_PHOTO_MAX_BYTES,
  COMMUNITY_REPORT_PHOTO_TIMEOUT_MS,
  COMMUNITY_REPORT_PHOTO_TYPES,
} from '../constants/community-report-photo';

function assertReportId(reportId: string) {
  if (!/^[a-f\d]{24}$/i.test(reportId)) throw new Error('신고 정보를 확인할 수 없습니다.');
}

export async function getCommunityReportReview(reportId: string): Promise<CommunityReportReview> {
  assertReportId(reportId);
  const result = await apiClient.get<ApiResponse<CommunityReportReview>>(`/community-admin/reports/${reportId}`, { withCredentials: false });
  return result.data.data;
}

export async function getCommunityReportPhoto(
  reportId: string,
  index: number,
  sourceVersion: string,
  signal: AbortSignal,
): Promise<Blob> {
  assertReportId(reportId);
  if (!Number.isInteger(index) || index < 0 || index > 9 || !/^[a-f\d]{64}$/.test(sourceVersion)) {
    throw new Error('사진 정보를 확인할 수 없습니다.');
  }
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal.addEventListener('abort', abort, { once: true });
  if (signal.aborted) controller.abort();
  try {
    const result = await apiClient.get<Blob>(`/community-admin/reports/${reportId}/photos/${index}`, {
      params: { sourceVersion },
      responseType: 'blob',
      withCredentials: false,
      signal: controller.signal,
      timeout: COMMUNITY_REPORT_PHOTO_TIMEOUT_MS,
      maxContentLength: COMMUNITY_REPORT_PHOTO_MAX_BYTES,
      onDownloadProgress: (progress) => {
        if (
          progress.loaded > COMMUNITY_REPORT_PHOTO_MAX_BYTES ||
          (progress.total ?? 0) > COMMUNITY_REPORT_PHOTO_MAX_BYTES
        )
          controller.abort();
      },
    });
    const blob = result.data;
    if (
      !(blob instanceof Blob) ||
      blob.size === 0 ||
      blob.size > COMMUNITY_REPORT_PHOTO_MAX_BYTES ||
      !COMMUNITY_REPORT_PHOTO_TYPES.some((type) => type === blob.type)
    )
      throw new Error('사진 형식을 확인할 수 없습니다.');
    const bytes = new Uint8Array(await blob.slice(0, 12).arrayBuffer());
    if (controller.signal.aborted) throw new Error('사진 확인이 취소되었습니다.');
    const valid =
      blob.type === 'image/png'
        ? bytes.slice(0, 8).join(',') === '137,80,78,71,13,10,26,10'
        : blob.type === 'image/jpeg'
          ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
          : String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
            String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
    if (!valid) throw new Error('사진 형식을 확인할 수 없습니다.');
    return blob;
  } finally {
    signal.removeEventListener('abort', abort);
  }
}
