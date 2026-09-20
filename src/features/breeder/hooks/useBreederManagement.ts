import { useRemoteData } from '../../../shared/hooks/useRemoteData';
import { useBreederFilters } from './useBreederFilters';
import { useState, useCallback, useMemo } from 'react';
import { App, Form } from 'antd';

import { breederApi, type BreederAccountType } from '../api/breederApi';
import type { BreederVerification } from '../../../shared/types/api.types';

/**
 * 브리더 관리(승인된 브리더) 비즈니스 로직 훅
 */
export function useBreederManagement() {
  // 정적 message 는 어드민 테마 컨텍스트를 못 읽는다(antd 경고). App 컨텍스트에서 받는다.
  const { message } = App.useApp();
  const { accountType, currentPage, pageSize, statusFilter, searchKeyword, cityName, update } = useBreederFilters();
  const filterKey = JSON.stringify([accountType, currentPage, pageSize, statusFilter, searchKeyword, cityName]);
  const [selection, setSelection] = useState<{ key: string; ids: string[] }>({ key: '', ids: [] });
  const selectedBreeders = useMemo(() => (selection.key === filterKey ? selection.ids : []), [selection, filterKey]);
  const setSelectedBreeders = useCallback((ids: string[]) => setSelection({ key: filterKey, ids }), [filterKey]);
  const [loading, setLoading] = useState(false);
  /** 정지·해제·독려·테스트 전환은 외부로 메일과 알림이 나간다. 응답 전 재클릭을 막는다. */
  const [busy, setBusy] = useState<string | null>(null);
  const [selectedBreeder, setSelectedBreeder] = useState<BreederVerification | null>(null);

  /* 모달 상태 */
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isUnsuspendModalOpen, setIsUnsuspendModalOpen] = useState(false);
  const [isProfileRemindModalOpen, setIsProfileRemindModalOpen] = useState(false);
  const [suspendForm] = Form.useForm();

  const list = useRemoteData(
    useCallback(
      () => breederApi.getBreeders('approved', currentPage, pageSize, accountType, { searchKeyword, cityName }),
      [currentPage, pageSize, accountType, searchKeyword, cityName],
    ),
  );
  const statsQuery = useRemoteData(useCallback(() => breederApi.getBreederStats(), []));
  const fetchBreeders = list.reload;
  const fetchStats = statsQuery.reload;
  const dataSource = list.data?.items || [];
  const total = list.data?.pagination.totalItems || 0;
  const stats = statsQuery.data;

  const handleViewDetails = useCallback(async (r: BreederVerification) => {
    setLoading(true);
    try {
      const detail = await breederApi.getBreederDetail(r.breederId);
      setSelectedBreeder({ ...r, ...detail });
      setIsDetailModalOpen(true);
    } catch {
      message.error('브리더 상세 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [message]);
  const handleSuspendClick = useCallback(
    (r: BreederVerification) => {
      setSelectedBreeder(r);
      suspendForm.resetFields();
      setIsSuspendModalOpen(true);
    },
    [suspendForm],
  );

  const handleSuspendSubmit = useCallback(async () => {
    if (!selectedBreeder || busy) return;
    let values: { reason: string };
    try {
      values = await suspendForm.validateFields();
    } catch {
      return; // 입력 검증 실패는 폼이 직접 안내한다.
    }
    setBusy('suspend');
    try {
      await breederApi.suspendBreeder(selectedBreeder.breederId, values.reason);
      message.success('브리더 계정이 정지되었습니다.');
      setIsSuspendModalOpen(false);
      fetchBreeders();
      fetchStats();
    } catch (error: unknown) {
      console.error('Suspend failed:', error);
      message.error('계정 정지에 실패했습니다.');
    } finally {
      setBusy(null);
    }
  }, [selectedBreeder, busy, suspendForm, fetchBreeders, fetchStats, message]);

  const handleUnsuspendClick = useCallback((r: BreederVerification) => {
    setSelectedBreeder(r);
    setIsUnsuspendModalOpen(true);
  }, []);

  const handleUnsuspendSubmit = useCallback(async () => {
    if (!selectedBreeder || busy) return;
    setBusy('unsuspend');
    try {
      await breederApi.unsuspendBreeder(selectedBreeder.breederId);
      message.success('브리더 계정 정지가 해제되었습니다.');
      setIsUnsuspendModalOpen(false);
      fetchBreeders();
      fetchStats();
    } catch (error: unknown) {
      console.error('Unsuspend failed:', error);
      message.error('계정 정지 해제에 실패했습니다.');
    } finally {
      setBusy(null);
    }
  }, [selectedBreeder, busy, fetchBreeders, fetchStats, message]);

  const handleTestAccountToggle = useCallback(
    async (record: BreederVerification, checked: boolean) => {
      if (busy) return;
      setBusy(`test:${record.breederId}`);
      try {
        await breederApi.setTestAccount(record.breederId, checked);
        message.success(
          checked
            ? `${record.breederName}님이 테스트 계정으로 설정되었습니다.`
            : `${record.breederName}님의 테스트 계정이 해제되었습니다.`,
        );
        fetchBreeders();
      } catch (error: unknown) {
        console.error('Test account toggle failed:', error);
        message.error('테스트 계정 설정에 실패했습니다.');
      } finally {
        setBusy(null);
      }
    },
    [busy, fetchBreeders, message],
  );

  const handleProfileRemindClick = useCallback(() => {
    if (selectedBreeders.length === 0) {
      message.warning('프로필 완성 독려 알림을 보낼 브리더를 선택해주세요.');
      return;
    }
    setIsProfileRemindModalOpen(true);
  }, [selectedBreeders.length, message]);

  const handleProfileRemindSubmit = useCallback(async () => {
    if (busy) return;
    setBusy('remind');
    try {
      await breederApi.sendReminder(selectedBreeders, 'profile_completion_reminder');
      message.success(`${selectedBreeders.length}명의 브리더에게 프로필 완성 독려 알림이 발송되었습니다.`);
      setIsProfileRemindModalOpen(false);
      setSelectedBreeders([]);
    } catch (error: unknown) {
      console.error('Profile remind failed:', error);
      message.error('프로필 완성 독려 알림 발송에 실패했습니다.');
    } finally {
      setBusy(null);
    }
  }, [busy, selectedBreeders, setSelectedBreeders, message]);

  const onPageChange = (page: number, size: number) => update({ page: size === pageSize ? page : 1, pageSize: size });
  const onAccountTypeChange = (value: BreederAccountType) => update({ accountType: value, page: 1 });
  const onSearch = (values: { searchKeyword: string; cityName: string }) =>
    update({ q: values.searchKeyword?.trim(), city: values.cityName?.trim(), page: 1 });
  const onReset = () => update({ q: undefined, city: undefined, accountType: undefined, status: undefined, page: 1 });

  return {
    searchKeyword,
    cityName,
    onSearch,
    onReset,
    error: list.error,
    refetch: list.reload,
    accountType,
    onAccountTypeChange,
    dataSource,
    loading: loading || list.loading,
    total,
    currentPage,
    pageSize,
    stats,
    selectedBreeders,
    setSelectedBreeders,
    selectedBreeder,
    onPageChange,
    handleViewDetails,
    busy,
    handleSuspendClick,
    handleUnsuspendClick,
    handleTestAccountToggle,
    detail: { isDetailModalOpen, close: () => setIsDetailModalOpen(false) },
    suspend: {
      isOpen: isSuspendModalOpen,
      form: suspendForm,
      submit: handleSuspendSubmit,
      submitting: busy === 'suspend',
      close: () => setIsSuspendModalOpen(false),
    },
    unsuspend: {
      isOpen: isUnsuspendModalOpen,
      submit: handleUnsuspendSubmit,
      submitting: busy === 'unsuspend',
      close: () => setIsUnsuspendModalOpen(false),
    },
    remind: {
      isOpen: isProfileRemindModalOpen,
      click: handleProfileRemindClick,
      submit: handleProfileRemindSubmit,
      submitting: busy === 'remind',
      close: () => setIsProfileRemindModalOpen(false),
    },
  };
}
