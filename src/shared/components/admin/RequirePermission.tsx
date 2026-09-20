import type { ReactNode } from 'react';
import { Button, Result } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';

import { requiredPermission, useHasPermission, useLandingPath } from '../../../features/auth/model/permissions';

/**
 * 권한이 없는 경로는 화면을 그리지 않고 안내로 대체한다.
 * 주소를 직접 입력해 들어온 경우에도 빈 목록이나 raw 403 대신 이유가 보이게 한다.
 */
export function RequirePermission({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const allowed = useHasPermission();
  const landing = useLandingPath();

  if (allowed(requiredPermission(pathname))) return <>{children}</>;

  return (
    <Result
      status="403"
      title="이 화면을 볼 권한이 없어요"
      subTitle="담당 권한이 있는 관리자에게 요청하거나, 권한 변경 후 다시 로그인해주세요."
      extra={
        <Button type="primary" onClick={() => navigate(landing, { replace: true })}>
          내 화면으로 이동
        </Button>
      }
    />
  );
}
