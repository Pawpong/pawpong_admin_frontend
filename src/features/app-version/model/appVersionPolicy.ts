/** 백엔드 앱 버전 정책과 같은 숫자.숫자.숫자[.숫자] 형식. */
export const APP_VERSION_PATTERN = /^\d+\.\d+\.\d+(?:\.\d+)?$/;

export function compareAppVersions(a: string, b: string): number {
  const left = a.split('.').map(Number);
  const right = b.split('.').map(Number);
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    if ((left[index] ?? 0) < (right[index] ?? 0)) return -1;
    if ((left[index] ?? 0) > (right[index] ?? 0)) return 1;
  }
  return 0;
}

export function isStoreUrl(value: string, platform: 'ios' | 'android'): boolean {
  try {
    const url = new URL(value);
    if (
      !(
        url.protocol === 'https:' &&
        !url.username &&
        !url.password &&
        !url.port &&
        url.hostname === (platform === 'ios' ? 'apps.apple.com' : 'play.google.com')
      )
    )
      return false;
    return platform === 'ios'
      ? /\/id\d+(?:\/|$)/.test(url.pathname)
      : url.pathname === '/store/apps/details' && url.searchParams.get('id') === 'kr.pawpong.app';
  } catch {
    return false;
  }
}
