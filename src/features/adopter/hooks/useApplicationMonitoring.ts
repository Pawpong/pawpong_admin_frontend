import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';
import dayjs from 'dayjs';

import { adopterApi } from '../api/adopterApi';
import type { ApplicationData, ApplicationMonitoringRequest, ApplicationDetailData } from '../../../shared/types/api.types';

/**
 * 상담 신청 모니터링 비즈니스 로직 훅
 */
export function useApplicationMonitoring() {
  const [dataSource, setDataSource] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalCount: 0, pendingCount: 0, approvedCount: 0, rejectedCount: 0, completedCount: 0 });
  const [filters, setFilters] = useState<ApplicationMonitoringRequest>({ page: 1, limit: 10 });

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationDetailData | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adopterApi.getApplicationList(filters);
      if (data && Array.isArray(data.applications)) {
        setDataSource(data.applications);
        setStats({ totalCount: data.totalCount || 0, pendingCount: data.pendingCount || 0, approvedCount: data.approvedCount || 0, rejectedCount: data.rejectedCount || 0, completedCount: data.completedCount || 0 });
      } else {
        setDataSource([]);
        message.warning('데이터 형식이 올바르지 않습니다.');
      }
    } catch (error: unknown) {
      console.error('Failed to fetch applications:', error);
      setDataSource([]);
      message.error('입양 신청 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const handleDateRangeChange = useCallback((dates: [unknown, unknown] | null) => {
    if (dates && dates[0] && dates[1]) {
      setFilters((prev) => ({ ...prev, startDate: dayjs(dates[0] as string).format('YYYY-MM-DD'), endDate: dayjs(dates[1] as string).format('YYYY-MM-DD') }));
    } else {
      setFilters((prev) => ({ ...prev, startDate: undefined, endDate: undefined }));
    }
  }, []);

  const handleBreederSearch = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, breederName: value || undefined }));
  }, []);

  const handleStatusChange = useCallback((value: ApplicationMonitoringRequest['status']) => {
    setFilters((prev) => ({ ...prev, status: value }));
  }, []);

  const handleRowClick = useCallback(async (record: ApplicationData) => {
    setIsDetailModalOpen(true);
    setDetailLoading(true);
    setSelectedApplication(null);
    try {
      const detail = await adopterApi.getApplicationDetail(record.applicationId);
      setSelectedApplication(detail);
    } catch (error: unknown) {
      console.error('Failed to fetch application detail:', error);
      message.error('신청 상세 정보를 불러올 수 없습니다.');
      setIsDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handlePageChange = useCallback((page: number, pageSize: number) => {
    setFilters((prev) => ({ ...prev, page, limit: pageSize }));
  }, []);

  return {
    dataSource, loading, stats, filters,
    fetchApplications, handleDateRangeChange, handleBreederSearch, handleStatusChange, handlePageChange,
    detail: { isOpen: isDetailModalOpen, loading: detailLoading, application: selectedApplication, close: () => setIsDetailModalOpen(false) },
    handleRowClick,
  };
}
