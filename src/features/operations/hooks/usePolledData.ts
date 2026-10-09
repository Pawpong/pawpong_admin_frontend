import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../../auth/store/authStore';

/**
 * 모니터링 화면용 조회 훅.
 *
 * useRemoteData 와 달리 새로고침·필터 변경 중에도 직전 값을 계속 보여 준다(차트가 깜빡이지 않게).
 * 단, 관리자 세션이 바뀌면 이전 계정의 결과는 즉시 가린다.
 * 탭이 백그라운드면 자동 갱신을 건너뛴다.
 */
export function usePolledData<T>(fetcher: () => Promise<T>, intervalMs: number | null) {
  const sessionRevision = useAuthStore((state) => state.sessionRevision);
  const [tick, setTick] = useState(0);
  const key = useMemo(() => ({ fetcher, tick, sessionRevision }), [fetcher, tick, sessionRevision]);
  const [result, setResult] = useState<{ key: typeof key; data?: T; error?: string; updatedAt?: number }>();

  useEffect(() => {
    let active = true;
    fetcher().then(
      (data) => {
        if (active) setResult({ key, data, updatedAt: Date.now() });
      },
      (error: unknown) => {
        if (!active) return;
        const message = error instanceof Error ? error.message : '데이터를 불러오지 못했습니다.';
        setResult((previous) =>
          previous?.key.sessionRevision === key.sessionRevision
            ? { key, data: previous.data, error: message, updatedAt: previous.updatedAt }
            : { key, error: message },
        );
      },
    );
    return () => {
      active = false;
    };
  }, [fetcher, key]);

  useEffect(() => {
    if (!intervalMs) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') setTick((value) => value + 1);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);

  const reload = useCallback(() => setTick((value) => value + 1), []);
  const sameSession = result?.key.sessionRevision === sessionRevision;
  return {
    data: sameSession ? result?.data : undefined,
    error: result?.key === key ? result.error : undefined,
    loading: result?.key !== key,
    updatedAt: sameSession ? result?.updatedAt : undefined,
    reload,
  };
}
