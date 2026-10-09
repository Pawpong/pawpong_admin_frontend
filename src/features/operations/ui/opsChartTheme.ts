/**
 * 서버 모니터링 차트 색.
 * dataviz validate_palette.js 로 흰 배경 기준 색약 구분(ΔE ≥ 10)·명도 대역·3:1 대비를 모두 통과한 조합이다.
 * 정상 요청은 계열색(파랑), 4xx·5xx·경고·에러는 의미가 있는 상태색으로 고정한다.
 */
export const OPS_CHART = {
  primary: '#2a78d6',
  secondary: '#eb6834',
  warning: '#c98500',
  critical: '#d03b3b',
  good: '#0ca30c',
  track: '#cde2fb',
  grid: '#ededed',
  axis: '#999999',
  text: '#3e3e3e',
  textMuted: '#717171',
  surface: '#ffffff',
} as const;

export const LEVEL_COLOR = {
  ok: OPS_CHART.primary,
  warning: OPS_CHART.warning,
  critical: OPS_CHART.critical,
  unknown: OPS_CHART.axis,
} as const;
