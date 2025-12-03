import React, { useEffect, useState } from 'react';
import { Table, Card, Tag, Space, Button, message, Modal, Select, Input, Form } from 'antd';
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
  const [selectedUser, setSelectedUser] = useState<UserManagement | null>(null);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState<UserSearchRequest>({});

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userApi.getUsers(filters);
      setDataSource(data);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      setDataSource([]);
      message.error('사용자 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getUserRoleTag = (role: string) => {
    return role === 'adopter' ? <Tag color="blue">입양자</Tag> : <Tag color="green">브리더</Tag>;
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      active: { color: 'success', text: '활성' },
      suspended: { color: 'warning', text: '정지' },
      deactivated: { color: 'error', text: '비활성' },
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
        reason: values.reason,
      });
      message.success('사용자 상태가 변경되었습니다.');
      setModalVisible(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Failed to update user status:', error);
      if (error.errorFields) {
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
      accountStatus: value as any,
    }));
  };

  const handleSearch = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      searchKeyword: value || undefined,
    }));
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
    },
    {
      title: '이메일',
      dataIndex: 'emailAddress',
      key: 'emailAddress',
      width: 200,
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
      render: (status: string) => getStatusTag(status),
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
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '작업',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Button type="link" onClick={() => handleStatusChange(record)} style={{ padding: 0 }}>
          상태 변경
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px' }}>사용자 관리</h1>

      {/* 필터 */}
      <Card style={{ marginBottom: '24px' }}>
        <Space size="middle">
          <Select placeholder="역할 선택" onChange={handleRoleFilterChange} allowClear style={{ width: 150 }}>
            <Option value="adopter">입양자</Option>
            <Option value="breeder">브리더</Option>
          </Select>
          <Select placeholder="상태 선택" onChange={handleStatusFilterChange} allowClear style={{ width: 150 }}>
            <Option value="active">활성</Option>
            <Option value="suspended">정지</Option>
            <Option value="deactivated">비활성</Option>
          </Select>
          <Search placeholder="이름 또는 이메일 검색" onSearch={handleSearch} allowClear style={{ width: 280 }} />
          <Button onClick={fetchUsers}>새로고침</Button>
        </Space>
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
              <Option value="deactivated">비활성</Option>
            </Select>
          </Form.Item>
          <Form.Item name="reason" label="변경 사유" rules={[{ required: true, message: '변경 사유를 입력해주세요' }]}>
            <Input.TextArea rows={4} placeholder="변경 사유를 입력해주세요" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;
