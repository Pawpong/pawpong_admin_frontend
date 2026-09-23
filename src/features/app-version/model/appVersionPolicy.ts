/** 백엔드 앱 버전 정책과 같은 숫자.숫자.숫자[.숫자] 형식. */
export const APP_VERSION_PATTERN = /^\d+\.\d+\.\d+(?:\.\d+)?$/;

export const APP_STORE_URLS = {
  ios: 'https://apps.apple.com/kr/app/id6814126823',
  android: 'https://play.google.com/store/apps/details?id=kr.pawpong.app',
} as const;

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
  if (typeof value !== 'string' || !value || /[\s<>"'`\\]/.test(value)) return false;
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
      ? /^\/(?:[a-z]{2}\/)?app\/(?:[^/]+\/)?id6814126823\/?$/.test(url.pathname)
      : url.pathname === '/store/apps/details' &&
          url.searchParams.getAll('id').length === 1 &&
          url.searchParams.get('id') === 'kr.pawpong.app';
  } catch {
    return false;
  }
}
