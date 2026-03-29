import { useState, useCallback, useEffect } from 'react';
import { Form, message } from 'antd';

import { userApi } from '../api/userApi';
import type { UserManagement, UserSearchRequest } from '../../../shared/types/api.types';

/**
 * 사용자 관리 CRUD 비즈니스 로직 훅
 * - 서버 사이드 페이지네이션 + 필터 검색
 * - 상태 변경 모달 관리
 */
export function useUserCrud() {
  const [dataSource, setDataSource] = useState<UserManagement[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserManagement | null>(null);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState<UserSearchRequest>({});

  // 페이지네이션 상태
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await userApi.getUsers({
        ...filters,
        page: current,
        limit: pageSize,
      });
      setDataSource(response.items);
      setTotal(response.pagination.totalItems);
    } catch (error: unknown) {
      console.error('Failed to fetch users:', error);
      setDataSource([]);
      setTotal(0);
      message.error('사용자 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [filters, current, pageSize]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /** 상태 변경 모달 열기 */
  const openStatusModal = useCallback(
    (user: UserManagement) => {
      setSelectedUser(user);
      form.setFieldsValue({
        accountStatus: user.accountStatus,
        reason: '',
      });
      setModalVisible(true);
    },
    [form],
  );

  /** 상태 변경 모달 제출 */
  const handleModalOk = useCallback(async () => {
    if (!selectedUser) return;

    try {
      const values = await form.validateFields();
      await userApi.updateUserStatus(selectedUser.userId, selectedUser.userRole as 'adopter' | 'breeder', {
        accountStatus: values.accountStatus,
        actionReason: values.reason,
      });
      message.success('사용자 상태가 변경되었습니다.');
      setModalVisible(false);
      fetchUsers();
    } catch (error: unknown) {
      console.error('Failed to update user status:', error);
      if (error && typeof error === 'object' && 'errorFields' in error) {
        message.error('모든 필드를 올바르게 입력해주세요.');
      } else {
        message.error('상태 변경에 실패했습니다.');
      }
    }
  }, [selectedUser, form, fetchUsers]);

  /** 모달 닫기 */
  const closeModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  /** 역할 필터 변경 */
  const handleRoleFilterChange = useCallback((value: string) => {
    setCurrent(1);
    setFilters((prev) => ({
      ...prev,
      userRole: (value as 'adopter' | 'breeder') || undefined,
    }));
  }, []);

  /** 상태 필터 변경 */
  const handleStatusFilterChange = useCallback((value: string) => {
    setCurrent(1);
    setFilters((prev) => ({
      ...prev,
      accountStatus: value as 'active' | 'suspended' | 'deleted' | undefined,
    }));
  }, []);

  /** 키워드 검색 */
  const handleSearch = useCallback((value: string) => {
    setCurrent(1);
    setFilters((prev) => ({
      ...prev,
      searchKeyword: value || undefined,
    }));
  }, []);

  /** 테이블 페이지 변경 */
  const handleTableChange = useCallback((pagination: { current?: number; pageSize?: number }) => {
    if (pagination.current) setCurrent(pagination.current);
    if (pagination.pageSize) setPageSize(pagination.pageSize);
  }, []);

  return {
    dataSource,
    loading,
    current,
    pageSize,
    total,
    modalVisible,
    selectedUser,
    form,
    fetchUsers,
    openStatusModal,
    handleModalOk,
    closeModal,
    handleRoleFilterChange,
    handleStatusFilterChange,
    handleSearch,
    handleTableChange,
  };
}
