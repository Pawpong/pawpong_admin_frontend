import { useCallback, useEffect, useState } from 'react';

import { aiImageApi, type AiImageAgentHealth } from '../api/aiImageApi';

/** 상태 표시 자동 갱신 주기 (ms) */
const REFRESH_INTERVAL_MS = 30_000;

/**
 * AI Agent 가동 상태 훅.
 *
 * 미리보기는 최대 120초가 걸리므로, 에이전트가 죽은 줄 모르고 눌러 기다리는 일이 없도록
 * 화면에 상태를 항상 띄워둔다. 백엔드가 연결 실패도 200 + UNREACHABLE 로 주므로
 * 여기서는 예외 처리보다 상태 표시가 중심이다.
 */
export function useAiImageAgentHealth() {
  const [health, setHealth] = useState<AiImageAgentHealth | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      setHealth(await aiImageApi.getAgentHealth());
    } catch (error) {
      // 백엔드까지 닿지 못한 경우다. 화면에는 에이전트 불가와 동일하게 보여준다
      console.error('Failed to fetch AI agent health:', error);
      setHealth({
        status: 'UNREACHABLE',
        isReachable: false,
        version: null,
        inFlightJobs: 0,
        kafkaConnected: false,
        openaiConfigured: false,
        errorMessage: '상태를 조회하지 못했습니다.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 마운트 시 1회 조회 + 주기 갱신. 외부 시스템(AI Agent) 상태를 끌어오는 구독이라
    // 이펙트 안에서 상태를 채우는 것이 의도된 동작이다 (레포 전반의 데이터 조회 훅과 동일 패턴).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchHealth();
    const interval = setInterval(fetchHealth, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  return { health, loading, refetch: fetchHealth };
}
