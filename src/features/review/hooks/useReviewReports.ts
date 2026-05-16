import { useState, useCallback } from 'react';
import { message } from 'antd';

import { reviewReportApi } from '../api/reviewReportApi';
import type { ReviewReportItem } from '../../../shared/types/api.types';

/**
 * 후기 신고 관리 비즈니스 로직 훅
 * 서버 페이지네이션 + 상세 모달 + 삭제 지원
 */
export function useReviewReports() {
  const [reports, setReports] = useState<ReviewReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  /* 상세 보기 모달 */
  const [selectedReport, setSelectedReport] = useState<ReviewReportItem | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reviewReportApi.getReviewReports(pagination.current, pagination.pageSize);
      if (data && Array.isArray(data.items)) {
        setReports(data.items);
        setPagination({
          current: data.pagination.currentPage,
          pageSize: data.pagination.pageSize,
          total: data.pagination.totalItems,
        });
      } else {
        console.error('Received non-array data:', data);
        setReports([]);
        message.warning('후기 신고 데이터 형식이 올바르지 않습니다.');
      }
    } catch (error: unknown) {
      console.error('Failed to fetch review reports:', error);
      setReports([]);
      message.error('후기 신고 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize]);

  const openDetail = useCallback((report: ReviewReportItem) => {
    setSelectedReport(report);
    setDetailVisible(true);
  }, []);

  const closeDetail = useCallback(() => {
    setDetailVisible(false);
  }, []);

  const handleDelete = useCallback(async (breederId: string, reviewId: string) => {
    try {
      await reviewReportApi.deleteReview(breederId, reviewId);
      message.success('부적절한 후기가 삭제되었습니다.');
      fetchReports();
    } catch (error: unknown) {
      console.error('Failed to delete review:', error);
      message.error('후기 삭제에 실패했습니다.');
    }
  }, [fetchReports]);

  const onPageChange = useCallback((page: number, pageSize: number) => {
    setPagination((prev) => ({ ...prev, current: page, pageSize }));
  }, []);

  return {
    reports,
    loading,
    pagination,
    onPageChange,
    fetchReports,
    handleDelete,
    detail: {
      selectedReport,
      detailVisible,
      openDetail,
      closeDetail,
    },
  };
}
