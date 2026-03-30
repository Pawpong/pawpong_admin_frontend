import { useState, useCallback, useEffect } from 'react';
import { Form, message } from 'antd';

import { breederApi } from '../api/breederApi';
import type { BreederVerification } from '../../../shared/types/api.types';

/**
 * 레벨 변경 신청 관리 비즈니스 로직 훅
 */
export function useLevelChangeRequests() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<BreederVerification[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedBreeder, setSelectedBreeder] = useState<BreederVerification | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await breederApi.getLevelChangeRequests(currentPage, pageSize);
      setDataSource(response.items);
      setTotalCount(response.pagination.totalItems);
    } catch (error: unknown) {
      console.error('Failed to fetch level change requests:', error);
      message.error('레벨 변경 신청 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleViewDetails = useCallback(async (record: BreederVerification) => {
    try {
      setLoading(true);
      const detailData = await breederApi.getBreederDetail(record.breederId);
      setSelectedBreeder({ ...record, verificationInfo: { ...record.verificationInfo, documents: detailData.verificationInfo.documents || [] } });
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch breeder detail:', error);
      message.error('브리더 상세 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleApprove = useCallback(async (breederId: string, level: string) => {
    try {
      await breederApi.updateVerification(breederId, { verificationStatus: 'approved' });
      message.success(`${level === 'elite' ? '엘리트' : '뉴'} 레벨 변경이 승인되었습니다.`);
      setIsDetailModalOpen(false);
      fetchRequests();
    } catch (error) {
      console.error('Failed to approve:', error);
      message.error('승인에 실패했습니다.');
    }
  }, [fetchRequests]);

  const handleRejectClick = useCallback((record: BreederVerification) => {
    setSelectedBreeder(record);
    setIsRejectModalOpen(true);
    form.resetFields();
  }, [form]);

  const handleRejectSubmit = useCallback(async () => {
    if (!selectedBreeder) return;
    try {
      const values = await form.validateFields();
      await breederApi.updateVerification(selectedBreeder.breederId, { verificationStatus: 'rejected', rejectionReason: values.rejectionReason });
      message.success('레벨 변경 신청이 거절되었습니다.');
      setIsRejectModalOpen(false);
      form.resetFields();
      fetchRequests();
    } catch (error) {
      console.error('Failed to reject:', error);
      message.error('거절에 실패했습니다.');
    }
  }, [selectedBreeder, form, fetchRequests]);

  const onPageChange = useCallback((page: number, size: number) => { setCurrentPage(page); setPageSize(size || 10); }, []);

  return {
    dataSource, loading, totalCount, currentPage, pageSize, selectedBreeder, onPageChange,
    handleViewDetails, handleApprove, handleRejectClick,
    detail: { isOpen: isDetailModalOpen, close: () => setIsDetailModalOpen(false) },
    reject: { isOpen: isRejectModalOpen, form, submit: handleRejectSubmit, close: () => { setIsRejectModalOpen(false); form.resetFields(); } },
  };
}
