import { useCallback, useState } from 'react';

import { aiImageApi, type AiImageJob, type AiImageJobStatus } from '../api/aiImageApi';
import { usePaginatedData } from '../../../shared/hooks';

/**
 * AI 생성 작업 모니터링 훅.
 *
 * 결과 컨슈머는 오프셋 커밋이 막히는 것을 피하려 처리 실패 시 예외를 삼킨다.
 * 그래서 실패한 작업을 눈으로 확인할 수 있는 경로가 이 목록뿐이다.
 */
export function useAiImageJobs() {
  const [statusFilter, setStatusFilter] = useState<AiImageJobStatus | undefined>(undefined);
  const [filterIdFilter, setFilterIdFilter] = useState<string | undefined>(undefined);

  const fetchJobs = useCallback(
    (page: number, pageSize: number) =>
      aiImageApi.getJobs(page, pageSize, { status: statusFilter, filterId: filterIdFilter }),
    [statusFilter, filterIdFilter],
  );

  const { data, loading, pagination, onPageChange, refetch } = usePaginatedData<AiImageJob>(
    fetchJobs,
    'AI 생성 작업',
    20,
  );

  // 조건이 바뀌면 1페이지부터 다시 본다 — 3페이지에서 필터를 걸어 빈 화면이 뜨는 것을 막는다
  const handleStatusChange = useCallback(
    (status?: AiImageJobStatus) => {
      setStatusFilter(status);
      onPageChange(1, pagination.pageSize);
    },
    [onPageChange, pagination.pageSize],
  );

  const handleFilterIdChange = useCallback(
    (filterId?: string) => {
      setFilterIdFilter(filterId);
      onPageChange(1, pagination.pageSize);
    },
    [onPageChange, pagination.pageSize],
  );

  return {
    jobs: data,
    loading,
    pagination,
    statusFilter,
    filterIdFilter,
    onPageChange,
    handleStatusChange,
    handleFilterIdChange,
    refetch,
  };
}
