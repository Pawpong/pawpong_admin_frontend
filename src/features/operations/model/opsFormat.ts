import type { OpsHealthLevel } from '../api/opsMonitoring.types';

/** 1536 → "1.5 KB". 메모리·디스크는 1024 단위로 읽는 편이 서버 콘솔 값과 맞는다 */
export function formatBytes(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || !Number.isFinite(bytes)) return '—';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value >= 100 || unit === 0 ? Math.round(value) : value.toFixed(1)} ${units[unit]}`;
}

/** 초 → "3일 4시간" / "12분" */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds) || seconds < 0) return '—';
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);
  if (days > 0) return hours ? `${days}일 ${hours}시간` : `${days}일`;
  if (hours > 0) return minutes ? `${hours}시간 ${minutes}분` : `${hours}시간`;
  if (minutes > 0) return `${minutes}분`;
  return `${Math.floor(seconds)}초`;
}

/** 기준 시각 대비 "방금 전 / 5분 전 / 3시간 전 / 2일 전" */
export function formatRelative(iso: string | null | undefined, now: number = Date.now()): string {
  if (!iso) return '—';
  const at = Date.parse(iso);
  if (!Number.isFinite(at)) return '—';
  const seconds = Math.max(0, Math.round((now - at) / 1000));
  if (seconds < 60) return '방금 전';
  if (seconds < 3_600) return `${Math.floor(seconds / 60)}분 전`;
  if (seconds < 86_400) return `${Math.floor(seconds / 3_600)}시간 전`;
  return `${Math.floor(seconds / 86_400)}일 전`;
}

export function formatPercent(value: number | null | undefined): string {
  return value === null || value === undefined || !Number.isFinite(value) ? '—' : `${value.toFixed(1)}%`;
}

export function formatMs(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  return value >= 1000 ? `${(value / 1000).toFixed(2)}초` : `${Math.round(value)}ms`;
}

/** 12,345 → "12,345", 1,284,000 → "128만" 처럼 큰 수는 한국어 단위로 줄인다 */
export function formatCount(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  if (Math.abs(value) >= 100_000_000) return `${(value / 100_000_000).toFixed(1)}억`;
  if (Math.abs(value) >= 100_000) return `${Math.round(value / 10_000).toLocaleString('ko-KR')}만`;
  return Math.round(value).toLocaleString('ko-KR');
}

/** 자원 사용률 등급 — 백엔드 OpsStatusPolicyService 임계값과 같은 기준 */
export const USAGE_THRESHOLDS = {
  cpu: { warning: 80, critical: 95 },
  memory: { warning: 85, critical: 95 },
  disk: { warning: 80, critical: 90 },
} as const;

export function usageLevel(
  value: number | null | undefined,
  threshold: { warning: number; critical: number },
): OpsHealthLevel {
  if (value === null || value === undefined || !Number.isFinite(value)) return 'unknown';
  if (value >= threshold.critical) return 'critical';
  if (value >= threshold.warning) return 'warning';
  return 'ok';
}

export const HEALTH_LABEL: Record<OpsHealthLevel, string> = {
  ok: '정상',
  warning: '주의',
  critical: '장애',
  unknown: '확인 불가',
};

/** 프로세스가 정상인지 — pm2 는 online, 도커는 running 이고 헬스체크가 실패가 아니어야 한다 */
export function processLevel(process: { kind: string; state: string; health: string | null }): OpsHealthLevel {
  const running = process.kind === 'pm2' ? process.state === 'online' : process.state === 'running';
  if (!running || process.health === 'unhealthy') return 'critical';
  if (process.health === 'starting') return 'warning';
  return 'ok';
}

/** 차트 축 라벨: 기간이 하루를 넘으면 날짜를 붙인다 */
export function formatAxisTime(iso: string, spanHours: number): string {
  const date = new Date(iso);
  const time = date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
  return spanHours > 24 ? `${date.getMonth() + 1}/${date.getDate()} ${time}` : time;
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  return Number.isFinite(date.getTime())
    ? date.toLocaleString('ko-KR', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    : '—';
}
