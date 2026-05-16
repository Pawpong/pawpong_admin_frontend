import { Table, Tag, Space, Button, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import type { District } from '../../../shared/types/api.types';

interface DistrictTableProps {
  districts: District[];
  loading: boolean;
  onEdit: (district: District) => void;
  onDelete: (id: string) => void;
}

export function DistrictTable({ districts, loading, onEdit, onDelete }: DistrictTableProps) {
  const columns: ColumnsType<District> = [
    {
      title: '시/도',
      dataIndex: 'city',
      key: 'city',
      width: 200,
      render: (city: string) => <span style={{ fontWeight: 500 }}>{city}</span>,
    },
    {
      title: '시/군/구 목록',
      dataIndex: 'districts',
      key: 'districts',
      render: (districts: string[]) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {districts.map((d, i) => <Tag key={i}>{d}</Tag>)}
        </div>
      ),
    },
    {
      title: '생성일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: '작업',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small" onClick={(e) => e.stopPropagation()}>
          <Button type="link" icon={<EditOutlined />} onClick={() => onEdit(record)}>수정</Button>
          <Popconfirm
            title="지역 삭제"
            description="이 지역을 삭제하시겠습니까?"
            onConfirm={() => onDelete(record.id)}
            okText="삭제"
            cancelText="취소"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()}>삭제</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table columns={columns} dataSource={districts} rowKey="id" loading={loading}
      pagination={{ pageSize: 10, showTotal: (total) => `총 ${total}개`, showSizeChanger: true }} />
  );
}
