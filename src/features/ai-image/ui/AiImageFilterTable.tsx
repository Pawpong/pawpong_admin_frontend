import { Button, Image, Popconfirm, Space, Switch, Table, Tag, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import type { AiImageFilter } from '../api/aiImageApi';

const IMAGE_FALLBACK =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

interface AiImageFilterTableProps {
  filters: AiImageFilter[];
  loading: boolean;
  onEdit: (filter: AiImageFilter) => void;
  onDelete: (filterId: string) => void;
  onToggleActive: (filter: AiImageFilter) => void;
}

/** AI 필터 목록 테이블 */
export function AiImageFilterTable({
  filters,
  loading,
  onEdit,
  onDelete,
  onToggleActive,
}: AiImageFilterTableProps) {
  const columns: ColumnsType<AiImageFilter> = [
    {
      title: '순서',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 70,
      sorter: (a, b) => a.sortOrder - b.sortOrder,
    },
    {
      title: '썸네일',
      dataIndex: 'thumbnailUrl',
      key: 'thumbnailUrl',
      width: 110,
      render: (thumbnailUrl?: string) =>
        thumbnailUrl ? (
          <Image
            src={thumbnailUrl || undefined}
            alt="필터 썸네일"
            width={80}
            height={80}
            style={{ objectFit: 'cover', borderRadius: 8 }}
            preview
            fallback={IMAGE_FALLBACK}
          />
        ) : (
          <span style={{ color: 'var(--color-grayscale-gray5)' }}>없음</span>
        ),
    },
    {
      title: '필터명',
      dataIndex: 'name',
      key: 'name',
      width: 160,
      render: (name: string, filter) => (
        <Space direction="vertical" size={0}>
          <strong>{name}</strong>
          <span style={{ color: 'var(--color-grayscale-gray5)', fontSize: 12 }}>{filter.description || '-'}</span>
        </Space>
      ),
    },
    {
      title: '프롬프트',
      dataIndex: 'prompt',
      key: 'prompt',
      ellipsis: true,
      render: (prompt: string) => (
        <Tooltip title={prompt} styles={{ root: { maxWidth: 480 } }}>
          <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{prompt}</span>
        </Tooltip>
      ),
    },
    {
      title: '모델',
      dataIndex: 'model',
      key: 'model',
      width: 130,
      render: (model: string, filter) => (
        <Space direction="vertical" size={0}>
          <Tag>{model}</Tag>
          <span style={{ color: 'var(--color-grayscale-gray5)', fontSize: 12 }}>{filter.outputSize}</span>
        </Space>
      ),
    },
    {
      title: '레퍼런스',
      dataIndex: 'referenceImageObjectKeys',
      key: 'referenceImageObjectKeys',
      width: 90,
      render: (keys: string[]) => `${keys?.length ?? 0}장`,
    },
    {
      title: '노출',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (isActive: boolean, filter) => (
        <Switch checked={isActive} onChange={() => onToggleActive(filter)} />
      ),
    },
    {
      title: '관리',
      key: 'actions',
      width: 120,
      render: (_, filter) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(filter)} />
          <Popconfirm
            title="필터를 삭제할까요?"
            description="이미 접수된 생성 작업은 스냅샷으로 돌기 때문에 영향받지 않습니다."
            okText="삭제"
            cancelText="취소"
            onConfirm={() => onDelete(filter.filterId)}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      rowKey="filterId"
      columns={columns}
      dataSource={filters}
      loading={loading}
      pagination={false}
      scroll={{ x: 1100 }}
    />
  );
}
