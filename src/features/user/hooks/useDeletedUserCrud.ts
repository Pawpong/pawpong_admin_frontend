import { useState, useCallback, useEffect } from 'react';
import { App } from 'antd';

import { userApi } from '../api/userApi';
import type { DeletedUser, DeletedUserSearchRequest, DeletedUserStats } from '../api/userApi';

/**
 * 탈퇴 사용자 관리 CRUD 비즈니스 로직 훅
 * - 서버 사이드 페이지네이션 + 역할 필터
 * - 통계 조회
 * - 상세보기 / 복구 / 영구 삭제 모달 관리
 */
export function useDeletedUserCrud() {
  const { message, modal } = App.useApp();
  const [dataSource, setDataSource] = useState<DeletedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DeletedUserStats | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState<DeletedUserSearchRequest>({
    page: 1,
    pageSize: 20,
    role: 'all',
  });

  // 모달 상태
  const [selectedUser, setSelectedUser] = useState<DeletedUser | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [hardDeleteModalVisible, setHardDeleteModalVisible] = useState(false);
  const [confirmDeleteInput, setConfirmDeleteInput] = useState('');

  /** 탈퇴 사용자 목록 조회 */
  const fetchDeletedUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await userApi.getDeletedUsers(filters);
      setDataSource(response.items);
      setPagination({
        current: response.pagination.currentPage,
        pageSize: response.pagination.pageSize,
        total: response.pagination.totalItems,
      });
    } catch (error: unknown) {
      console.error('Failed to fetch deleted users:', error);
      setDataSource([]);
      message.error('탈퇴 사용자 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [filters, message]);

  /** 통계 조회 */
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await userApi.getDeletedUserStats();
      setStats(statsData);
    } catch (error: unknown) {
      console.error('Failed to fetch stats:', error);
      message.error('탈퇴 통계를 불러올 수 없습니다.');
    }
  }, [message]);

  useEffect(() => {
    fetchDeletedUsers();
    fetchStats();
  }, [fetchDeletedUsers, fetchStats]);

  /** 역할 필터 변경 */
  const handleRoleFilterChange = useCallback((value: 'all' | 'adopter' | 'breeder') => {
    setFilters((prev) => ({
      ...prev,
      role: value,
      page: 1,
    }));
  }, []);

  /** 테이블 페이지 변경 */
  const handleTableChange = useCallback((newPagination: { current?: number; pageSize?: number }) => {
    setFilters((prev) => ({
      ...prev,
      page: newPagination.current,
      pageSize: newPagination.pageSize,
    }));
  }, []);

  /** 상세보기 모달 열기 */
  const showDetail = useCallback((record: DeletedUser) => {
    setSelectedUser(record);
    setDetailModalVisible(true);
  }, []);

  /** 상세보기 모달 닫기 */
  const closeDetailModal = useCallback(() => {
    setDetailModalVisible(false);
  }, []);

  /** 사용자 복구 */
  const handleRestoreUser = useCallback(
    (record: DeletedUser) => {
      if (!record.userId || !record.userRole) {
        message.error('사용자 정보가 올바르지 않습니다.');
        return;
      }

      modal.confirm({
        title: '사용자 복구',
        content: `${record.nickname}(${record.userRole === 'adopter' ? '입양자' : '브리더'}) 계정을 복구하시겠습니까?`,
        okText: '복구',
        cancelText: '취소',
        okButtonProps: { danger: false, type: 'primary' },
        onOk: () => {
          return userApi
            .restoreDeletedUser(record.userId, record.userRole)
            .then(() => {
              message.success('사용자가 복구되었습니다.');
              fetchDeletedUsers();
              fetchStats();
            })
            .catch((error: unknown) => {
              const err = error as { response?: { data?: { error?: string } }; message?: string };
              const errorMsg = err?.response?.data?.error || err?.message || '사용자 복구에 실패했습니다.';
              message.error(errorMsg);
              throw error;
            });
        },
      });
    },
    [message, modal, fetchDeletedUsers, fetchStats],
  );

  /** 영구 삭제 모달 열기 */
  const openHardDeleteModal = useCallback((user: DeletedUser) => {
    setSelectedUser(user);
    setConfirmDeleteInput('');
    setHardDeleteModalVisible(true);
  }, []);

  /** 영구 삭제 모달 닫기 */
  const closeHardDeleteModal = useCallback(() => {
    setHardDeleteModalVisible(false);
    setConfirmDeleteInput('');
  }, []);

  /** 영구 삭제 확인 */
  const handleHardDeleteConfirm = useCallback(async () => {
    if (!selectedUser) return;

    if (confirmDeleteInput !== selectedUser.nickname) {
      message.error('사용자 이름이 일치하지 않습니다.');
      return;
    }

    try {
      await userApi.hardDeleteUser(selectedUser.userId, selectedUser.userRole);
      message.success('사용자가 영구적으로 삭제되었습니다.');
      setHardDeleteModalVisible(false);
      setConfirmDeleteInput('');
      await fetchDeletedUsers();
      await fetchStats();
    } catch (error: unknown) {
      console.error('Failed to hard delete user:', error);
      message.error('사용자 삭제에 실패했습니다.');
    }
  }, [selectedUser, confirmDeleteInput, message, fetchDeletedUsers, fetchStats]);

  return {
    dataSource,
    loading,
    stats,
    pagination,
    filters,
    selectedUser,
    detailModalVisible,
    hardDeleteModalVisible,
    confirmDeleteInput,
    setConfirmDeleteInput,
    fetchDeletedUsers,
    handleRoleFilterChange,
    handleTableChange,
    showDetail,
    closeDetailModal,
    handleRestoreUser,
    openHardDeleteModal,
    closeHardDeleteModal,
    handleHardDeleteConfirm,
  };
}
