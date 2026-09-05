import { useEffect, useMemo, useState } from 'react';

/** Ignore late responses after changing filters or leaving a page. */
export function useRemoteData<T>(fetcher: () => Promise<T>) {
  const [revision, setRevision] = useState(0);
  const key = useMemo(() => ({ fetcher, revision }), [fetcher, revision]);
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
  return {
    data: result?.key === key ? result.data : undefined,
    error: result?.key === key ? result.error : undefined,
    loading: result?.key !== key,
    reload: () => setRevision((value) => value + 1),
  };
}
