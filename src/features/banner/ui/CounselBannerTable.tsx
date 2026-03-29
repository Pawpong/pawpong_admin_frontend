import { Table, Image, Space, Button, Switch, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import type { CounselBanner } from '../../user/api/userApi';

const IMAGE_FALLBACK =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

interface CounselBannerTableProps {
  banners: CounselBanner[];
  loading: boolean;
  onEdit: (banner: CounselBanner) => void;
  onDelete: (bannerId: string) => void;
  onToggleActive: (bannerId: string, currentStatus: boolean) => void;
}

/**
 * 상담 배너 테이블 컴포넌트
 */
export function CounselBannerTable({ banners, loading, onEdit, onDelete, onToggleActive }: CounselBannerTableProps) {
  const columns: ColumnsType<CounselBanner> = [
    {
      title: '순서',
      dataIndex: 'order',
      key: 'order',
      width: 80,
      sorter: (a, b) => a.order - b.order,
    },
    {
      title: '미리보기',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 200,
      render: (imageUrl: string) => (
        <Image
          src={imageUrl}
          alt="상담 배너"
          width={150}
          height={75}
          style={{ objectFit: 'cover', borderRadius: '8px' }}
          preview
          fallback={IMAGE_FALLBACK}
        />
      ),
    },
    {
      title: '제목',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => text || '-',
    },
    {
      title: '링크 타입',
      dataIndex: 'linkType',
      key: 'linkType',
      width: 100,
      render: (type: string) => (
        <span
          style={{
            color: type === 'internal' ? 'var(--color-primary-500)' : 'var(--color-secondary-500)',
            fontWeight: 500,
          }}
        >
          {type === 'internal' ? '내부' : '외부'}
        </span>
      ),
    },
    {
      title: '링크 URL',
      dataIndex: 'linkUrl',
      key: 'linkUrl',
      ellipsis: true,
    },
    {
      title: '활성화',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean, record: CounselBanner) => (
        <Switch checked={isActive !== false} onChange={() => onToggleActive(record.bannerId, isActive !== false)} />
      ),
    },
    {
      title: '작업',
      key: 'action',
      width: 180,
      fixed: 'right' as const,
      render: (_: unknown, record: CounselBanner) => (
        <Space size="middle" onClick={(e) => e.stopPropagation()}>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(record);
            }}
          >
            수정
          </Button>
          <Popconfirm
            title="상담 배너 삭제"
            description="정말 이 상담 배너를 삭제하시겠습니까?"
            onConfirm={() => onDelete(record.bannerId)}
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
      dataSource={banners}
      rowKey="bannerId"
      loading={loading}
      scroll={{ x: 1000 }}
      pagination={{
        showSizeChanger: true,
        showTotal: (total) => `총 ${total}개`,
        responsive: true,
      }}
    />
  );
}
