import { useState, useCallback, useEffect } from 'react';
import { Form, message } from 'antd';

import { breederApi } from '../api/breederApi';
import type { BreederVerification } from '../../../shared/types/api.types';

/**
 * 브리더 관리(승인된 브리더) 비즈니스 로직 훅
 */
export function useBreederManagement() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<BreederVerification[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedBreeders, setSelectedBreeders] = useState<string[]>([]);
  const [selectedBreeder, setSelectedBreeder] = useState<BreederVerification | null>(null);
  const [stats, setStats] = useState({ totalApproved: 0, eliteCount: 0, newCount: 0 });

  /* 모달 상태 */
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLevelChangeModalOpen, setIsLevelChangeModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isUnsuspendModalOpen, setIsUnsuspendModalOpen] = useState(false);
  const [isProfileRemindModalOpen, setIsProfileRemindModalOpen] = useState(false);
  const [levelChangeForm] = Form.useForm();
  const [suspendForm] = Form.useForm();

  const fetchBreeders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await breederApi.getBreeders('approved', currentPage, pageSize);
      setDataSource(response.items);
      setTotal(response.pagination.totalItems);
    } catch (error: unknown) {
      console.error('Failed to fetch breeders:', error);
      message.error('브리더 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  const fetchStats = useCallback(async () => {
    try { setStats(await breederApi.getBreederStats()); } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchBreeders(); fetchStats(); }, [fetchBreeders, fetchStats]);

  const handleViewDetails = useCallback((r: BreederVerification) => { setSelectedBreeder(r); setIsDetailModalOpen(true); }, []);
  const handleChangeLevelClick = useCallback((r: BreederVerification) => { setSelectedBreeder(r); levelChangeForm.resetFields(); setIsLevelChangeModalOpen(true); }, [levelChangeForm]);

  const handleChangeLevelSubmit = useCallback(async () => {
    if (!selectedBreeder) return;
    try {
      const values = await levelChangeForm.validateFields();
      await breederApi.changeLevel(selectedBreeder.breederId, values.level);
      message.success('브리더 레벨이 변경되었습니다.');
      setIsLevelChangeModalOpen(false);
      fetchBreeders(); fetchStats();
    } catch (error: unknown) { console.error('Level change failed:', error); message.error('레벨 변경에 실패했습니다.'); }
  }, [selectedBreeder, levelChangeForm, fetchBreeders, fetchStats]);

  const handleSuspendClick = useCallback((r: BreederVerification) => { setSelectedBreeder(r); suspendForm.resetFields(); setIsSuspendModalOpen(true); }, [suspendForm]);

  const handleSuspendSubmit = useCallback(async () => {
    if (!selectedBreeder) return;
    try {
      const values = await suspendForm.validateFields();
      await breederApi.suspendBreeder(selectedBreeder.breederId, values.reason);
      message.success('브리더 계정이 정지되었습니다.');
      setIsSuspendModalOpen(false); fetchBreeders(); fetchStats();
    } catch (error: unknown) { console.error('Suspend failed:', error); message.error('계정 정지에 실패했습니다.'); }
  }, [selectedBreeder, suspendForm, fetchBreeders, fetchStats]);

  const handleUnsuspendClick = useCallback((r: BreederVerification) => { setSelectedBreeder(r); setIsUnsuspendModalOpen(true); }, []);

  const handleUnsuspendSubmit = useCallback(async () => {
    if (!selectedBreeder) return;
    try {
      await breederApi.unsuspendBreeder(selectedBreeder.breederId);
      message.success('브리더 계정 정지가 해제되었습니다.');
      setIsUnsuspendModalOpen(false); fetchBreeders(); fetchStats();
    } catch (error: unknown) { console.error('Unsuspend failed:', error); message.error('계정 정지 해제에 실패했습니다.'); }
  }, [selectedBreeder, fetchBreeders, fetchStats]);

  const handleTestAccountToggle = useCallback(async (record: BreederVerification, checked: boolean) => {
    try {
      await breederApi.setTestAccount(record.breederId, checked);
      message.success(checked ? `${record.breederName}님이 테스트 계정으로 설정되었습니다.` : `${record.breederName}님의 테스트 계정이 해제되었습니다.`);
      fetchBreeders();
    } catch (error: unknown) { console.error('Test account toggle failed:', error); message.error('테스트 계정 설정에 실패했습니다.'); }
  }, [fetchBreeders]);

  const handleProfileRemindClick = useCallback(() => {
    if (selectedBreeders.length === 0) { message.warning('프로필 완성 독려 알림을 보낼 브리더를 선택해주세요.'); return; }
    setIsProfileRemindModalOpen(true);
  }, [selectedBreeders.length]);

  const handleProfileRemindSubmit = useCallback(async () => {
    try {
      await breederApi.sendReminder(selectedBreeders, 'profile_completion_reminder');
      message.success(`${selectedBreeders.length}명의 브리더에게 프로필 완성 독려 알림이 발송되었습니다.`);
      setIsProfileRemindModalOpen(false); setSelectedBreeders([]);
    } catch (error: unknown) { console.error('Profile remind failed:', error); message.error('프로필 완성 독려 알림 발송에 실패했습니다.'); }
  }, [selectedBreeders]);

  const onPageChange = useCallback((page: number, size: number) => {
    setCurrentPage(page); if (size !== pageSize) { setPageSize(size); setCurrentPage(1); }
  }, [pageSize]);

  return {
    dataSource, loading, total, currentPage, pageSize, stats,
    selectedBreeders, setSelectedBreeders, selectedBreeder, onPageChange,
    handleViewDetails, handleChangeLevelClick, handleSuspendClick, handleUnsuspendClick, handleTestAccountToggle,
    detail: { isDetailModalOpen, close: () => setIsDetailModalOpen(false) },
    levelChange: { isOpen: isLevelChangeModalOpen, form: levelChangeForm, submit: handleChangeLevelSubmit, close: () => setIsLevelChangeModalOpen(false) },
    suspend: { isOpen: isSuspendModalOpen, form: suspendForm, submit: handleSuspendSubmit, close: () => setIsSuspendModalOpen(false) },
    unsuspend: { isOpen: isUnsuspendModalOpen, submit: handleUnsuspendSubmit, close: () => setIsUnsuspendModalOpen(false) },
    remind: { isOpen: isProfileRemindModalOpen, click: handleProfileRemindClick, submit: handleProfileRemindSubmit, close: () => setIsProfileRemindModalOpen(false) },
  };
}
