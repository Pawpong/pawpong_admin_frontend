import { Table, Tag, Space, Button, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import type { Breed } from '../../../shared/types/api.types';

interface BreedTableProps {
  breeds: Breed[];
  loading: boolean;
  onEdit: (breed: Breed) => void;
  onDelete: (id: string) => void;
}

/**
 * 품종 테이블 컴포넌트
 */
export function BreedTable({ breeds, loading, onEdit, onDelete }: BreedTableProps) {
  const columns: ColumnsType<Breed> = [
    {
      title: '동물 타입',
      dataIndex: 'petType',
      key: 'petType',
      width: 120,
      render: (petType: string) =>
        petType === 'dog' ? <Tag color="blue">강아지</Tag> : <Tag color="purple">고양이</Tag>,
      filters: [
        { text: '강아지', value: 'dog' },
        { text: '고양이', value: 'cat' },
      ],
      onFilter: (value, record) => record.petType === value,
    },
    {
      title: '카테고리',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (category: string) => <span style={{ fontWeight: 500 }}>{category}</span>,
    },
    {
      title: '카테고리 설명',
      dataIndex: 'categoryDescription',
      key: 'categoryDescription',
      width: 200,
    },
    {
      title: '품종 목록',
      dataIndex: 'breeds',
      key: 'breeds',
      render: (breeds: string[]) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {breeds.map((breed, index) => (
            <Tag key={index}>{breed}</Tag>
          ))}
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
          <Button type="link" icon={<EditOutlined />} onClick={() => onEdit(record)}>
            수정
          </Button>
          <Popconfirm
            title="품종 삭제"
            description="이 품종을 삭제하시겠습니까?"
            onConfirm={() => onDelete(record.id)}
            okText="삭제"
            cancelText="취소"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()}>
              삭제
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={breeds}
      rowKey="id"
      loading={loading}
      pagination={{
        pageSize: 10,
        showTotal: (total) => `총 ${total}개`,
        showSizeChanger: true,
      }}
    />
  );
}
