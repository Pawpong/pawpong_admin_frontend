import type { CommunityReportPlace } from './community-report.types';

export interface CommunityReportPlaceRow {
  key: string;
  label: string;
  name: string;
  coordinates: string;
  mapUrl: string | null;
  photoLabel: string | null;
}

const valid = (value: unknown, limit: number): value is number =>
  typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= limit;

/** 신고 검토 화면에 보여줄 장소 행. 좌표가 깨진 장소는 지도 링크 없이 그대로 알린다. */
export function communityReportPlaceRows(
  places: readonly CommunityReportPlace[] | undefined,
): CommunityReportPlaceRow[] {
  return (places ?? []).map((place, index) => {
    const located = valid(place.latitude, 90) && valid(place.longitude, 180);
    return {
      key: `${place.order}:${index}`,
      label: `${place.order}번째 장소`,
      name: place.name || '이름 없는 장소',
      coordinates: located ? `${place.latitude.toFixed(5)}, ${place.longitude.toFixed(5)}` : '좌표 확인 불가',
      mapUrl: located
        ? `https://map.kakao.com/link/map/${encodeURIComponent(place.name || '신고 장소')},${place.latitude},${place.longitude}`
        : null,
      photoLabel: Number.isInteger(place.photoIndex) ? `첨부 사진 ${(place.photoIndex as number) + 1}과 연결` : null,
    };
  });
}

/** 서버가 알려주는 AI 공개 심사 상태. 심사 없이 올라간 기존 글은 legacy로 온다. */
export function communityReviewStateLabel(state: string | undefined): string {
  if (state === 'approved') return 'AI 심사 공개 승인';
  if (state === 'held') return 'AI 심사 공개 보류';
  if (state === 'legacy') return 'AI 심사 전 글';
  return 'AI 심사 상태 확인 불가';
}
