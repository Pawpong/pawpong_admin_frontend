import { useState, useEffect, useCallback } from 'react';
import { App } from 'antd';
import { useRemoteData } from './useRemoteData';

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}
interface PaginatedResponse<T> {
  success: boolean;
  data: { items: T[]; pagination: PaginationState };
}

/** 페이지·검색 조건 변경 시 이전 응답을 버려 현재 목록에 오래된 데이터가 섞이지 않게 한다. */
export function usePaginatedData<T>(
  fetchFn: (page: number, pageSize: number) => Promise<PaginatedResponse<T>>,
  entityName: string,
  defaultPageSize = 10,
) {
  const { message } = App.useApp();
  const [page, setPage] = useState({ currentPage: 1, pageSize: defaultPageSize });
  const request = useRemoteData(
    useCallback(() => fetchFn(page.currentPage, page.pageSize), [fetchFn, page.currentPage, page.pageSize]),
  );
  useEffect(() => {
    if (request.error) void message.error(`${entityName} 목록을 불러올 수 없습니다.`);
  }, [request.error, entityName, message]);
  const onPageChange = useCallback((currentPage: number, pageSize: number) => setPage({ currentPage, pageSize }), []);
  return {
    data: request.data?.data.items || [],
    loading: request.loading,
    error: request.error,
    pagination: { ...page, totalItems: request.data?.data.pagination.totalItems || 0 },
    onPageChange,
    refetch: request.reload,
  };
}

/** 전체 조회도 동일한 요청 수명 관리와 오류 처리를 사용한다. */
export function useListData<T>(fetchFn: () => Promise<T[]>, entityName: string) {
  const { message } = App.useApp();
  const request = useRemoteData(
    useCallback(async () => {
      const data = await fetchFn();
      if (!Array.isArray(data)) throw new Error('목록 응답 형식이 올바르지 않습니다.');
      return data;
    }, [fetchFn]),
  );
  useEffect(() => {
    if (request.error) void message.error(`${entityName} 목록을 불러올 수 없습니다.`);
  }, [request.error, entityName, message]);
  return { data: request.data || [], loading: request.loading, error: request.error, refetch: request.reload };
}
