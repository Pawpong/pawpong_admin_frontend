import { useState, useCallback } from 'react';
import { message } from 'antd';

import { breederApi } from '../api/breederApi';
import type { BreederReport } from '../../../shared/types/api.types';

/**
 * 브리더 신고 관리 비즈니스 로직 훅
 * 서버 페이지네이션 + 상세/처리 모달 지원
 */
export function useBreederReports() {
  const [reports, setReports] = useState<BreederReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  /* 상세 보기 모달 */
  const [selectedReport, setSelectedReport] = useState<BreederReport | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  /* 처리 모달 */
  const [actionVisible, setActionVisible] = useState(false);
  const [actionType, setActionType] = useState<'resolve' | 'reject'>('resolve');
  const [adminNotes, setAdminNotes] = useState('');

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const response = await breederApi.getReports(pagination.page, pagination.limit);
      setReports(response.items);
      setPagination((prev) => ({ ...prev, total: response.pagination.totalItems }));
    } catch (error: unknown) {
      console.error('Failed to fetch reports:', error);
      message.error('신고 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  const openDetail = useCallback((report: BreederReport) => {
    setSelectedReport(report);
    setDetailVisible(true);
  }, []);

  const closeDetail = useCallback(() => {
    setDetailVisible(false);
  }, []);

  const openAction = useCallback((report: BreederReport, type: 'resolve' | 'reject') => {
    setSelectedReport(report);
    setActionType(type);
    setAdminNotes('');
    setActionVisible(true);
  }, []);

  const closeAction = useCallback(() => {
    setActionVisible(false);
  }, []);

  const handleActionSubmit = useCallback(async () => {
    if (!selectedReport) return;

    try {
      await breederApi.handleReport(selectedReport.reportId, {
        action: actionType,
        adminNotes,
      });

      message.success(
        actionType === 'resolve' ? '신고가 승인되었습니다. 브리더가 제재됩니다.' : '신고가 반려되었습니다.',
      );

      setActionVisible(false);
      fetchReports();
    } catch (error: unknown) {
      console.error('Action failed:', error);
      message.error('처리에 실패했습니다.');
    }
  }, [selectedReport, actionType, adminNotes, fetchReports]);

  const onPageChange = useCallback((page: number, pageSize: number) => {
    setPagination((prev) => ({ ...prev, page, limit: pageSize }));
  }, []);

  /** 현재 페이지 내 대기 중 건수 */
  const pendingCount = reports.filter((r) => r.status === 'pending').length;

  return {
    reports,
    loading,
    pagination,
    pendingCount,
    onPageChange,
    fetchReports,
    detail: {
      selectedReport,
      detailVisible,
      openDetail,
      closeDetail,
    },
    action: {
      selectedReport,
      actionVisible,
      actionType,
      adminNotes,
      setAdminNotes,
      openAction,
      closeAction,
      handleActionSubmit,
    },
  };
}
