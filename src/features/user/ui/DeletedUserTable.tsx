import React from 'react';
import { Table, Tag, Button, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import type { DeletedUser } from '../api/userApi';
import { getDeleteReasonLabel, getUserRoleTag } from './deletedUserHelpers';

interface DeletedUserTableProps {
  dataSource: DeletedUser[];
  loading: boolean;
  pagination: { current: number; pageSize: number; total: number };
  onTableChange: (pagination: { current?: number; pageSize?: number }) => void;
  onShowDetail: (record: DeletedUser) => void;
  onRestore: (record: DeletedUser) => void;
  onHardDelete: (record: DeletedUser) => void;
}

export function DeletedUserTable({
  dataSource,
  loading,
  pagination,
  onTableChange,
  onShowDetail,
  onRestore,
  onHardDelete,
}: DeletedUserTableProps) {
  const columns: ColumnsType<DeletedUser> = [
    {
      title: '사용자 ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 120,
      ellipsis: true,
    },
    {
      title: '닉네임',
      dataIndex: 'nickname',
      key: 'nickname',
      width: 120,
      render: (name: string) => name || '-',
    },
    {
      title: '이메일',
      dataIndex: 'email',
      key: 'email',
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
      title: '탈퇴 사유',
      dataIndex: 'deleteReason',
      key: 'deleteReason',
      width: 250,
      render: (reason: string, record) => (
        <span style={{ color: '#888' }}>{getDeleteReasonLabel(reason, record.userRole)}</span>
      ),
    },
    {
      title: '가입일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => (date ? dayjs(date).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '탈퇴일',
      dataIndex: 'deletedAt',
      key: 'deletedAt',
      width: 150,
      render: (date: string) => (date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '작업',
      key: 'actions',
      width: 240,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onShowDetail(record);
            }}
            style={{ color: '#4f3b2e', padding: 0 }}
          >
            상세보기
          </Button>
          <Button
            type="primary"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onRestore(record);
            }}
          >
            복구
          </Button>
          <Button
            danger
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onHardDelete(record);
            }}
          >
            완전 삭제
          </Button>
        </Space>
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
        ...pagination,
        showSizeChanger: true,
        showTotal: (total) => `총 ${total}명`,
      }}
      onChange={onTableChange}
      scroll={{ x: 1200 }}
    />
  );
}
