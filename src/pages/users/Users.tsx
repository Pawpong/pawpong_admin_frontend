import React, { useEffect, useState, useCallback } from 'react';
import { Table, Card, Tag, Button, message, Modal, Select, Input, Form } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import { userApi } from '../../features/user/api/userApi';
import type { UserManagement, UserSearchRequest } from '../../shared/types/api.types';

const { Search } = Input;
const { Option } = Select;

/**
 * 사용자 관리 페이지
 * 입양자와 브리더 계정을 관리합니다.
 */
const Users: React.FC = () => {
  const [dataSource, setDataSource] = useState<UserManagement[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [hardDeleteModalVisible, setHardDeleteModalVisible] = useState(false);
  const [confirmDeleteInput, setConfirmDeleteInput] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserManagement | null>(null);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState<UserSearchRequest>({});

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userApi.getUsers(filters);
      setDataSource(data);
    } catch (error: unknown) {
      console.error('Failed to fetch users:', error);
      setDataSource([]);
      message.error('사용자 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const getUserRoleTag = (role: string) => {
    return role === 'adopter' ? <Tag color="blue">입양자</Tag> : <Tag color="green">브리더</Tag>;
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      active: { color: 'success', text: '활성' },
      suspended: { color: 'warning', text: '정지' },
      deleted: { color: 'error', text: '탈퇴' },
    };
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const handleStatusChange = (user: UserManagement) => {
    setSelectedUser(user);
    form.setFieldsValue({
      accountStatus: user.accountStatus,
      reason: '',
    });
    setModalVisible(true);
  };

  const handleModalOk = async () => {
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
  };

  const handleRoleFilterChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      userRole: (value as 'adopter' | 'breeder') || undefined,
    }));
  };

  const handleStatusFilterChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      accountStatus: value as 'active' | 'suspended' | 'deleted' | undefined,
    }));
  };

  const handleSearch = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      searchKeyword: value || undefined,
    }));
  };

  const handleHardDelete = (user: UserManagement) => {
    setSelectedUser(user);
    setConfirmDeleteInput('');
    setHardDeleteModalVisible(true);
  };

  const handleHardDeleteConfirm = async () => {
    if (!selectedUser) return;

    if (confirmDeleteInput !== selectedUser.userName) {
      message.error('사용자 이름이 일치하지 않습니다.');
      return;
    }

    try {
      await userApi.hardDeleteUser(selectedUser.userId, selectedUser.userRole as 'adopter' | 'breeder');
      message.success('사용자가 영구적으로 삭제되었습니다.');
      setHardDeleteModalVisible(false);
      setConfirmDeleteInput('');
      fetchUsers();
    } catch (error: unknown) {
      console.error('Failed to hard delete user:', error);
      message.error('사용자 삭제에 실패했습니다.');
    }
  };

  const columns: ColumnsType<UserManagement> = [
    {
      title: '사용자 ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 120,
      ellipsis: true,
    },
    {
      title: '이름',
      dataIndex: 'userName',
      key: 'userName',
      width: 120,
      render: (name: string) => name || '-',
    },
    {
      title: '이메일',
      dataIndex: 'emailAddress',
      key: 'emailAddress',
      width: 200,
      render: (email: string) => email || '-',
    },
    {
      title: '역할',
      dataIndex: 'userRole',
      key: 'userRole',
      width: 100,
      render: (role: string) => getUserRoleTag(role),
    },
    {
      title: '상태',
      dataIndex: 'accountStatus',
      key: 'accountStatus',
      width: 100,
      render: (status: string) => (status ? getStatusTag(status) : <Tag color="default">-</Tag>),
    },
    {
      title: '최근 로그인',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      width: 150,
      render: (date: string) => (date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '가입일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => (date ? dayjs(date).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '작업',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            type="link"
            onClick={(e) => {
              e.stopPropagation();
              handleStatusChange(record);
            }}
            style={{ padding: 0 }}
          >
            상태 변경
          </Button>
          {record.accountStatus === 'deleted' && (
            <Button
              danger
              type="link"
              onClick={(e) => {
                e.stopPropagation();
                handleHardDelete(record);
              }}
              style={{ padding: 0 }}
            >
              완전 삭제
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">사용자 관리</h1>

      {/* 필터 */}
      <Card className="mb-4 sm:mb-6" style={{ borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Select
            placeholder="역할 선택"
            onChange={handleRoleFilterChange}
            allowClear
            className="w-full"
          >
            <Option value="adopter">입양자</Option>
            <Option value="breeder">브리더</Option>
          </Select>
          <Select
            placeholder="상태 선택"
            onChange={handleStatusFilterChange}
            allowClear
            className="w-full"
          >
            <Option value="active">활성</Option>
            <Option value="suspended">정지</Option>
            <Option value="deleted">탈퇴</Option>
          </Select>
          <Search
            placeholder="이름 또는 이메일 검색"
            onSearch={handleSearch}
            allowClear
            className="w-full lg:col-span-1"
          />
          <Button onClick={fetchUsers} className="w-full">
            새로고침
          </Button>
        </div>
      </Card>

      {/* 사용자 목록 테이블 */}
      <Card>
        <Table
          dataSource={dataSource}
          columns={columns}
          loading={loading}
          rowKey="userId"
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `총 ${total}명`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 상태 변경 모달 */}
      <Modal
        title="사용자 상태 변경"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        okText="변경"
        cancelText="취소"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="accountStatus"
            label="계정 상태"
            rules={[{ required: true, message: '상태를 선택해주세요' }]}
          >
            <Select>
              <Option value="active">활성</Option>
              <Option value="suspended">정지</Option>
              <Option value="deleted">탈퇴</Option>
            </Select>
          </Form.Item>
          <Form.Item name="reason" label="변경 사유" rules={[{ required: true, message: '변경 사유를 입력해주세요' }]}>
            <Input.TextArea rows={4} placeholder="변경 사유를 입력해주세요" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 완전 삭제 확인 모달 */}
      <Modal
        title="⚠️ 사용자 영구 삭제"
        open={hardDeleteModalVisible}
        onOk={handleHardDeleteConfirm}
        onCancel={() => {
          setHardDeleteModalVisible(false);
          setConfirmDeleteInput('');
        }}
        okText="영구 삭제"
        cancelText="취소"
        okButtonProps={{ danger: true, disabled: confirmDeleteInput !== selectedUser?.userName }}
      >
        {selectedUser && (
          <div>
            <div
              className="p-4 mb-4"
              style={{
                backgroundColor: '#fff1f0',
                border: '1px solid #ffa39e',
                borderRadius: '8px',
              }}
            >
              <p className="text-sm mb-2" style={{ color: '#cf1322', fontWeight: 'bold' }}>
                ⚠️ 경고: 이 작업은 되돌릴 수 없습니다
              </p>
              <p className="text-sm" style={{ color: '#cf1322' }}>
                사용자의 모든 데이터가 데이터베이스에서 영구적으로 삭제됩니다.
              </p>
            </div>

            <div className="mb-4">
              <p className="mb-2">
                <strong>사용자 정보:</strong>
              </p>
              <p className="text-sm">이름: {selectedUser.userName}</p>
              <p className="text-sm">이메일: {selectedUser.emailAddress}</p>
              <p className="text-sm">역할: {selectedUser.userRole === 'adopter' ? '입양자' : '브리더'}</p>
            </div>

            <div>
              <p className="mb-2" style={{ fontWeight: 'bold' }}>
                계속하려면 사용자 이름을 입력하세요:
              </p>
              <Input
                placeholder={selectedUser.userName}
                value={confirmDeleteInput}
                onChange={(e) => setConfirmDeleteInput(e.target.value)}
                status={confirmDeleteInput && confirmDeleteInput !== selectedUser.userName ? 'error' : ''}
              />
              {confirmDeleteInput && confirmDeleteInput !== selectedUser.userName && (
                <p className="text-sm mt-1" style={{ color: '#cf1322' }}>
                  이름이 일치하지 않습니다
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Users;
