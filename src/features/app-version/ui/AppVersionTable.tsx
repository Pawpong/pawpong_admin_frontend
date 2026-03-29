import { Table, Tag, Space, Button, Switch, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import type { AppVersion } from '../api/appVersionApi';
import type { PaginationState } from '../../../shared/hooks';

interface AppVersionTableProps {
  versions: AppVersion[];
  loading: boolean;
  pagination: PaginationState;
  onPageChange: (page: number, pageSize: number) => void;
  onEdit: (record: AppVersion) => void;
  onDelete: (id: string) => void;
  onToggleActive: (record: AppVersion) => void;
}

/**
 * 앱 버전 테이블 컴포넌트
 */
export function AppVersionTable({
  versions,
  loading,
  pagination,
  onPageChange,
  onEdit,
  onDelete,
  onToggleActive,
}: AppVersionTableProps) {
  const columns: ColumnsType<AppVersion> = [
    {
      title: '플랫폼',
      dataIndex: 'platform',
      key: 'platform',
      width: 100,
      render: (platform: string) =>
        platform === 'ios' ? <Tag color="blue">iOS</Tag> : <Tag color="green">Android</Tag>,
      filters: [
        { text: 'iOS', value: 'ios' },
        { text: 'Android', value: 'android' },
      ],
      onFilter: (value, record) => record.platform === value,
    },
    {
      title: '최신 버전',
      dataIndex: 'latestVersion',
      key: 'latestVersion',
      width: 120,
      render: (version: string) => <span style={{ fontWeight: 600 }}>{version}</span>,
    },
    {
      title: '최소 요구 버전',
      dataIndex: 'minRequiredVersion',
      key: 'minRequiredVersion',
      width: 130,
      render: (version: string) => <Tag color="red">{version}</Tag>,
    },
    {
      title: '활성 상태',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (_, record) => (
        <Switch
          checked={record.isActive}
          onChange={() => onToggleActive(record)}
          checkedChildren="활성"
          unCheckedChildren="비활성"
        />
      ),
    },
    {
      title: '생성일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: '작업',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" icon={<EditOutlined />} onClick={() => onEdit(record)}>
            수정
          </Button>
          <Popconfirm
            title="앱 버전 삭제"
            description="이 버전 정보를 삭제하시겠습니까?"
            onConfirm={() => onDelete(record.appVersionId)}
            okText="삭제"
            cancelText="취소"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
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
      dataSource={versions}
      rowKey="appVersionId"
      loading={loading}
      pagination={{
        current: pagination.currentPage,
        pageSize: pagination.pageSize,
        total: pagination.totalItems,
        showTotal: (total) => `총 ${total}개`,
        showSizeChanger: true,
        onChange: onPageChange,
      }}
    />
  );
}
