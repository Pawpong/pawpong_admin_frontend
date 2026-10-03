export type HighlightPlacement = 'home' | 'explore' | 'playground';
export type HighlightIcon = 'map' | 'spark' | 'heart';

export interface FeatureHighlight {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: HighlightIcon;
  enabled: boolean;
  placements: HighlightPlacement[];
  actions: { label: string; href: string }[];
}

export interface FeatureHighlightConfig {
  revision: number;
  cards: FeatureHighlight[];
}

// 백엔드 feature-highlights 계약의 출시된 조회 화면만 허용한다.
export const HIGHLIGHT_DESTINATIONS = [
  '/care-map',
  '/care-map?kind=hospital',
  '/care-map?kind=shelter',
  '/ai-filter',
  '/community',
  '/explore',
  '/explore?type=breeder',
  '/explore?type=adoption',
] as const;

const placements = ['home', 'explore', 'playground'];
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (value: unknown, max: number, required = false): value is string =>
  typeof value === 'string' && value.length <= max && (!required || value.trim().length > 0);

export function isHighlightDestination(href: unknown): href is string {
  return typeof href === 'string' && HIGHLIGHT_DESTINATIONS.some((value) => value === href);
}

function isCard(card: unknown): card is FeatureHighlight {
  if (!isRecord(card)) return false;
  return (
    typeof card.id === 'string' &&
    /^[a-z0-9][a-z0-9-]{0,49}$/.test(card.id) &&
    text(card.eyebrow, 20) &&
    text(card.title, 50, true) &&
    text(card.description, 140) &&
    typeof card.icon === 'string' &&
    ['map', 'spark', 'heart'].includes(card.icon) &&
    typeof card.enabled === 'boolean' &&
    Array.isArray(card.placements) &&
    card.placements.length >= 1 &&
    card.placements.length <= 3 &&
    new Set(card.placements).size === card.placements.length &&
    card.placements.every((value) => typeof value === 'string' && placements.includes(value)) &&
    Array.isArray(card.actions) &&
    card.actions.length >= 1 &&
    card.actions.length <= 2 &&
    card.actions.every(
      (action) => isRecord(action) && text(action.label, 20, true) && isHighlightDestination(action.href),
    )
  );
}

/** 빈 설정과 잘못된 응답을 구분하고, 응답의 임의 URL/추가 필드는 렌더링하지 않는다. */
export function parseFeatureHighlightConfig(value: unknown): FeatureHighlightConfig {
  if (
    !isRecord(value) ||
    typeof value.revision !== 'number' ||
    !Number.isSafeInteger(value.revision) ||
    value.revision < 0 ||
    value.revision >= Number.MAX_SAFE_INTEGER ||
    !Array.isArray(value.cards) ||
    value.cards.length > 12 ||
    !value.cards.every(isCard) ||
    new Set(value.cards.map((card) => card.id)).size !== value.cards.length
  ) {
    throw new Error('신기능 소개 설정을 확인할 수 없습니다.');
  }
  return {
    revision: value.revision,
    cards: value.cards.map((card) => ({
      id: card.id,
      eyebrow: card.eyebrow,
      title: card.title,
      description: card.description,
      icon: card.icon,
      enabled: card.enabled,
      placements: [...card.placements],
      actions: card.actions.map(({ label, href }) => ({ label, href })),
    })),
  };
}

export const HIGHLIGHT_LINK_OPTIONS = [
  { label: '동물병원 지도', value: '/care-map' },
  { label: '동물병원 지도 (병원 탭)', value: '/care-map?kind=hospital' },
  { label: '보호시설 지도', value: '/care-map?kind=shelter' },
  { label: 'AI 사진 만들기', value: '/ai-filter' },
  { label: '커뮤니티', value: '/community' },
  { label: '탐색', value: '/explore' },
  { label: '브리더 탐색', value: '/explore?type=breeder' },
  { label: '입양 탐색', value: '/explore?type=adoption' },
];
export const HIGHLIGHT_PLACEMENT_OPTIONS = [
  { label: '홈', value: 'home' },
  { label: '탐색', value: 'explore' },
  { label: '놀이터', value: 'playground' },
];
export const HIGHLIGHT_ICON_OPTIONS = [
  { label: '돌봄 지도', value: 'map' },
  { label: '새로운 기능', value: 'spark' },
  { label: '함께하는 마음', value: 'heart' },
];

export function isCareMapHighlight(card: FeatureHighlight) {
  return (
    card.id === 'care-map' ||
    card.icon === 'map' ||
    card.actions.some(({ href }) => href === '/care-map' || href.startsWith('/care-map?'))
  );
}

export const MAP_PLACEMENT_ERROR = '돌봄 지도는 홈 또는 놀이터에 표시할 수 있어요. 탐색 선택을 해제해 주세요.';

export function validateHighlightSave(value: unknown): FeatureHighlightConfig {
  const config = parseFeatureHighlightConfig(value);
  if (config.cards.some((card) => isCareMapHighlight(card) && card.placements.includes('explore'))) {
    throw new Error(MAP_PLACEMENT_ERROR);
  }
  return config;
}
