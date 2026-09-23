/** 서비스 웹과 API가 같은 환경의 데이터를 사용하도록 배포 환경에서 지정할 수 있다. */
export const DEEP_LINK_ORIGIN = resolvePublicWebOrigin(import.meta.env.VITE_PUBLIC_WEB_URL);
export const DEEP_LINK_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// 백엔드 deep-link-policy의 허용 경로와 동일하게 유지한다.
const APP_PATH_PATTERN =
  /^(?:\/|\/(?:about|activity|adoption|bookmarks|chat|community|explore|faq|grade-policy|hall-of-fame|home|notices|notifications|profile|settings|terms-of-privacy|terms-of-service)(?:\/[A-Za-z0-9_-]+)*)$/;
const hasControlCharacters = (value: string) =>
  [...value].some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127);

export function resolvePublicWebOrigin(value?: string): string {
  try {
    const url = new URL(value || 'https://pawpong.kr');
    if (
      url.protocol === 'https:' &&
      ['pawpong.kr', 'www.pawpong.kr', 'dev.pawpong.kr'].includes(url.hostname) &&
      !url.username &&
      !url.password &&
      !url.port
    )
      return url.origin;
  } catch {
    /* 잘못된 설정은 운영 링크 기본값을 사용한다. */
  }
  return 'https://pawpong.kr';
}

export function deepLinkUrl(slug: string): string {
  return `${DEEP_LINK_ORIGIN}/l/${encodeURIComponent(slug)}`;
}

export function isInternalAppPath(value: string): boolean {
  if (value.length > 500 || !value.startsWith('/') || value.startsWith('//')) return false;
  try {
    let decoded = value;
    for (let depth = 0; depth < 4 && decoded.includes('%'); depth += 1) decoded = decodeURIComponent(decoded);
    return (
      !decoded.includes('%') &&
      !decoded.includes('//') &&
      !hasControlCharacters(decoded) &&
      !/[\s\\<>"'`:]/.test(decoded) &&
      APP_PATH_PATTERN.test(decoded.split(/[?#]/)[0])
    );
  } catch {
    return false;
  }
}

export function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !/[\s<>"'`\\]/.test(value);
  } catch {
    return false;
  }
}

/** 푸시에서는 앱의 내부 경로 또는 포퐁 서비스의 HTTPS 링크를 사용한다. */
export function isAppDestination(value: string): boolean {
  if (isInternalAppPath(value) || /^\/l\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) return true;
  if (!isHttpsUrl(value)) return false;
  const url = new URL(value);
  return (
    ['pawpong.kr', 'www.pawpong.kr', 'dev.pawpong.kr'].includes(url.hostname) &&
    !url.port &&
    (isInternalAppPath(url.pathname + url.search + url.hash) || /^\/l\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(url.pathname))
  );
}

export function isPlainLinkText(value: string): boolean {
  return !/[<>]/.test(value) && !hasControlCharacters(value);
}
