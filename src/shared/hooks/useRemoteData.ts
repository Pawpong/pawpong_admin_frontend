import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../../features/auth/store/authStore';

/** 필터나 로그인 세션이 바뀌면 이전 결과를 즉시 가리고 늦은 응답을 버린다. */
export function useRemoteData<T>(fetcher: () => Promise<T>) {
  const sessionRevision = useAuthStore((state) => state.sessionRevision);
  const [revision, setRevision] = useState(0);
  const key = useMemo(() => ({ fetcher, revision, sessionRevision }), [fetcher, revision, sessionRevision]);
  const [result, setResult] = useState<{ key: typeof key; data?: T; error?: string }>();
  useEffect(() => {
    let active = true;
    fetcher().then(
      (data) => {
        if (active) setResult({ key, data });
      },
      (error: unknown) => {
        if (active) setResult({ key, error: error instanceof Error ? error.message : '데이터를 불러오지 못했습니다.' });
      },
    );
    return () => {
      active = false;
    };
  }, [fetcher, key]);
  const reload = useCallback(() => setRevision((value) => value + 1), []);
  return {
    data: result?.key === key ? result.data : undefined,
    error: result?.key === key ? result.error : undefined,
    loading: result?.key !== key,
    reload,
  };
}
