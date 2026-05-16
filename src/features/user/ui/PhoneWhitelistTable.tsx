import { Table, Space, Button, Switch, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, PhoneOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import type { PhoneWhitelist } from '../../../shared/types/api.types';
import { formatPhoneNumber } from '../hooks/usePhoneWhitelistCrud';

interface PhoneWhitelistTableProps {
  whitelist: PhoneWhitelist[];
  loading: boolean;
  onEdit: (item: PhoneWhitelist) => void;
  onDelete: (id: string) => void;
  onToggleActive: (item: PhoneWhitelist) => void;
}

export function PhoneWhitelistTable({ whitelist, loading, onEdit, onDelete, onToggleActive }: PhoneWhitelistTableProps) {
  const columns: ColumnsType<PhoneWhitelist> = [
    {
      title: '전화번호', dataIndex: 'phoneNumber', key: 'phoneNumber', width: 150,
      render: (phone: string) => (
        <Space>
          <PhoneOutlined />
          <span style={{ fontWeight: 500, fontFamily: 'monospace' }}>{formatPhoneNumber(phone)}</span>
        </Space>
      ),
    },
    { title: '설명', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: '상태', dataIndex: 'isActive', key: 'isActive', width: 100,
      render: (isActive: boolean, record) => (
        <Switch checked={isActive} onChange={() => onToggleActive(record)} checkedChildren="활성" unCheckedChildren="비활성" />
      ),
    },
    {
      title: '등록일', dataIndex: 'createdAt', key: 'createdAt', width: 150,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: '작업', key: 'action', width: 150,
      render: (_, record) => (
        <Space size="small" onClick={(e) => e.stopPropagation()}>
          <Button type="link" icon={<EditOutlined />} onClick={() => onEdit(record)}>수정</Button>
          <Popconfirm title="화이트리스트 삭제" description="이 전화번호를 삭제하시겠습니까?" onConfirm={() => onDelete(record.id)} okText="삭제" cancelText="취소" okButtonProps={{ danger: true }}>
            <Button type="link" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()}>삭제</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return <Table columns={columns} dataSource={whitelist} rowKey="id" loading={loading} scroll={{ x: 600 }} pagination={{ pageSize: 10, showTotal: (total) => `총 ${total}개`, showSizeChanger: true, responsive: true }} />;
}
