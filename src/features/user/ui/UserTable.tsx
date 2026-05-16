import React from 'react';
import { Table, Tag, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import type { UserManagement } from '../../../shared/types/api.types';

/** 역할 태그 렌더링 */
const getUserRoleTag = (role: string) => {
  return role === 'adopter' ? <Tag color="blue">입양자</Tag> : <Tag color="green">브리더</Tag>;
};

/** 상태 태그 렌더링 */
const getStatusTag = (status: string) => {
  const statusConfig: Record<string, { color: string; text: string }> = {
    active: { color: 'success', text: '활성' },
    suspended: { color: 'warning', text: '정지' },
    deleted: { color: 'error', text: '탈퇴' },
  };
  const config = statusConfig[status] || { color: 'default', text: status };
  return <Tag color={config.color}>{config.text}</Tag>;
};

interface UserTableProps {
  dataSource: UserManagement[];
  loading: boolean;
  current: number;
  pageSize: number;
  total: number;
  onStatusChange: (user: UserManagement) => void;
  onTableChange: (pagination: { current?: number; pageSize?: number }) => void;
}

export function UserTable({ dataSource, loading, current, pageSize, total, onStatusChange, onTableChange }: UserTableProps) {
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
      width: 120,
      render: (_, record) => (
        <Button
          type="link"
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange(record);
          }}
          style={{ padding: 0 }}
        >
          상태 변경
        </Button>
      ),
    },
  ];

  return (
    <Table
      dataSource={dataSource}
      columns={columns}
      loading={loading}
      rowKey="userId"
      pagination={{
        current,
        pageSize,
        total,
        showSizeChanger: true,
        showTotal: (t) => `총 ${t}명`,
        pageSizeOptions: ['10', '20', '50', '100'],
      }}
      onChange={onTableChange}
      scroll={{ x: 1200 }}
    />
  );
}
