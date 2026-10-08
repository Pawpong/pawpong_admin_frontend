import { useAuthStore } from '../../features/auth/store/authStore';

export interface AdminRequestSession {
  revision: number;
  key: number;
}

let sequence = 0;
let current: { session: AdminRequestSession; refreshToken: string | null } | undefined;

export class SessionChangedError extends Error {
  constructor() {
    super('로그인 상태가 변경되어 이전 요청을 취소했습니다.');
    this.name = 'SessionChangedError';
  }
}

export function captureAdminRequestSession(): AdminRequestSession {
  const revision = useAuthStore.getState().sessionRevision;
  const refreshToken = localStorage.getItem('refreshToken');
  if (!current || current.session.revision !== revision || current.refreshToken !== refreshToken) {
    current = { session: { revision, key: ++sequence }, refreshToken };
  }
  // Axios 오류에 포함되는 요청 설정에는 갱신 토큰 대신 비밀값이 아닌 식별자만 넣는다.
  return current.session;
}

export function sameAdminRequestSession(left: AdminRequestSession, right: AdminRequestSession): boolean {
  return left.revision === right.revision && left.key === right.key;
}

export function isCurrentAdminRequestSession(session: AdminRequestSession): boolean {
  return sameAdminRequestSession(session, captureAdminRequestSession());
}

export function assertAdminRequestSession(session: AdminRequestSession): void {
  if (!isCurrentAdminRequestSession(session)) throw new SessionChangedError();
}

export function getAdminSessionRefreshToken(session: AdminRequestSession): string | null {
  assertAdminRequestSession(session);
  return localStorage.getItem('refreshToken');
}
