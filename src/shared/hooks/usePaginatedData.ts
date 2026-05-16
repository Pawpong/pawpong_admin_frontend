import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';

/**
 * 페이지네이션 상태
 */
export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

/**
 * 페이지네이션 API 응답 표준 구조
 */
interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      currentPage: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

/**
 * 서버 사이드 페이지네이션 데이터 관리 훅
 *
 * @example
 * const { data, loading, pagination, onPageChange, refetch } = usePaginatedData(
 *   (page, pageSize) => noticeApi.getNotices(page, pageSize),
 *   '공지사항',
 * );
 */
export function usePaginatedData<T>(
  fetchFn: (page: number, pageSize: number) => Promise<PaginatedResponse<T>>,
  entityName: string,
  defaultPageSize: number = 10,
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: defaultPageSize,
    totalItems: 0,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchFn(pagination.currentPage, pagination.pageSize);
      setData(response.data.items);
      setPagination((prev) => ({
        ...prev,
        totalItems: response.data.pagination.totalItems,
      }));
    } catch (error: unknown) {
      console.error(`Failed to fetch ${entityName}:`, error);
      setData([]);
      message.error(`${entityName} 목록을 불러올 수 없습니다.`);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, pagination.currentPage, pagination.pageSize, entityName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onPageChange = useCallback((page: number, pageSize: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page, pageSize }));
  }, []);

  return {
    data,
    loading,
    pagination,
    onPageChange,
    refetch: fetchData,
  };
}

/**
 * 클라이언트 사이드 데이터 (전체 조회) 관리 훅
 *
 * @example
 * const { data, loading, refetch } = useListData(
 *   () => breedApi.getAllBreeds(),
 *   '품종',
 * );
 */
export function useListData<T>(
  fetchFn: () => Promise<T[]>,
  entityName: string,
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchFn();
      if (Array.isArray(result)) {
        setData(result);
      } else {
        setData([]);
        message.warning(`${entityName} 데이터 형식이 올바르지 않습니다.`);
      }
    } catch (error: unknown) {
      console.error(`Failed to fetch ${entityName}:`, error);
      setData([]);
      message.error(`${entityName} 목록을 불러올 수 없습니다.`);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, entityName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, refetch: fetchData };
}
