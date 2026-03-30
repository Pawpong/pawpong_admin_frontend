import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';

import { platformApi } from '../api/platformApi';
import type { PlatformStats } from '../../../shared/types/api.types';

/**
 * 대시보드 통계 데이터 훅
 */
export function useDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      setStats(await platformApi.getStats());
    } catch (error: unknown) {
      console.error('Failed to fetch stats:', error);
      message.error('통계 데이터를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return { stats, loading };
}
