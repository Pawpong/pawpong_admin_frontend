import { useAuthStore } from '../store/authStore';
import type { AuthResponse } from '../../../shared/types/api.types';

export type AdminPermission = keyof AuthResponse['permissions'];

/**
 * 경로별로 필요한 관리자 권한.
 *
 * 백엔드가 실제로 막는 것은 platform-admin 계열뿐이다(통계·시스템 상태는
 * canViewStatistics, 운영 DB 백업은 canManageAdmins). 나머지 도메인은 role=admin 만
 * 확인하지만, admins 스키마가 권한을 나눠 두었으므로 화면에서도 같은 기준으로 가린다.
 * 여기에 없는 경로는 모든 관리자가 쓸 수 있다.
 */
const ROUTE_PERMISSION: Array<{ prefix: string; permission: AdminPermission }> = [
  { prefix: '/settings/backups', permission: 'canManageAdmins' },
  { prefix: '/settings/health', permission: 'canViewStatistics' },
  { prefix: '/dashboard', permission: 'canViewStatistics' },
  { prefix: '/statistics', permission: 'canViewStatistics' },
  { prefix: '/users', permission: 'canManageUsers' },
  { prefix: '/breeders', permission: 'canManageBreeders' },
  { prefix: '/reports', permission: 'canManageReports' },
  { prefix: '/support', permission: 'canManageReports' },
  { prefix: '/contests', permission: 'canManageReports' },
];

export function requiredPermission(path: string): AdminPermission | null {
  return ROUTE_PERMISSION.find((rule) => path === rule.prefix || path.startsWith(`${rule.prefix}/`))?.permission ?? null;
}

/**
 * 권한 판정. 로그인 응답에 permissions 가 없는 예전 세션은 잠기지 않도록 모두 허용한다.
 * 최종 차단은 서버가 하며, 이 함수는 쓸 수 없는 메뉴를 감추는 용도다.
 */
export function useHasPermission(): (permission: AdminPermission | null) => boolean {
  const permissions = useAuthStore((state) => state.user?.permissions);
  return (permission) => !permission || !permissions || permissions[permission] === true;
}

/** 관리자가 볼 수 있는 첫 화면. 통계 권한이 없으면 대시보드로 보내지 않는다. */
export function useLandingPath(): string {
  const allowed = useHasPermission();
  if (allowed('canViewStatistics')) return '/dashboard';
  if (allowed('canManageBreeders')) return '/breeders/verification';
  if (allowed('canManageUsers')) return '/users';
  if (allowed('canManageReports')) return '/support';
  return '/content/banners';
}
