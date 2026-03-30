import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';

import { platformApi } from '../api/platformApi';
import type { MvpStats } from '../../../shared/types/api.types';

/**
 * MVP 통계 데이터 훅
 */
export function useMvpStats() {
  const [stats, setStats] = useState<MvpStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      setStats(await platformApi.getMvpStats());
    } catch (error: unknown) {
      console.error('Failed to fetch MVP stats:', error);
      message.error('MVP 통계 데이터를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return { stats, loading };
}
