import { Button, Popconfirm, Space, Switch, Table, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { LoadError, PageHeading } from '../../shared/components/admin/PageHeading';
import { useDeepLinkCrud } from '../../features/deep-link/hooks/useDeepLinkCrud';
import { DeepLinkModal } from '../../features/deep-link/ui/DeepLinkModal';
import { deepLinkUrl } from '../../features/deep-link/model/deepLinkPolicy';
import type { DeepLink } from '../../features/deep-link/api/deepLinkApi';

export default function DeepLinks() {
  const crud = useDeepLinkCrud();
  const navigate = useNavigate();
  const columns: ColumnsType<DeepLink> = [
    {
      title: '링크',
      key: 'link',
      width: 330,
      render: (_, item) => (
        <Space direction="vertical" size={4}>
          <Typography.Text strong>{item.title}</Typography.Text>
          <Typography.Text
            copyable={{ text: deepLinkUrl(item.slug), tooltips: ['URL 복사', '복사됨'] }}
            style={{ wordBreak: 'break-all' }}
          >
            {deepLinkUrl(item.slug)}
          </Typography.Text>
          <Typography.Text type="secondary">{item.description || '설명 없음'}</Typography.Text>
        </Space>
      ),
    },
    {
      title: '앱 이동 경로',
      dataIndex: 'targetPath',
      width: 230,
      render: (value: string) => (
        <Typography.Text code style={{ wordBreak: 'break-all' }}>
          {value}
        </Typography.Text>
      ),
    },
    {
      title: '활성 상태',
      key: 'isActive',
      width: 100,
      render: (_, item) => (
        <Switch
          checked={item.isActive}
          checkedChildren="활성"
          unCheckedChildren="비활성"
          aria-label={`${item.title} 활성 상태`}
          loading={crud.changingId === item.id}
          disabled={!!crud.changingId}
          onChange={() => void crud.toggleActive(item)}
        />
      ),
    },
    {
      title: '수정일',
      dataIndex: 'updatedAt',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('ko-KR'),
    },
    {
      title: '작업',
      key: 'actions',
      width: 220,
      render: (_, item) => (
        <Space wrap size={0}>
          <Button type="link" disabled={!!crud.changingId} onClick={() => crud.openEdit(item)}>
            수정
          </Button>
          <Button
            type="link"
            disabled={!item.isActive}
            onClick={() => navigate('/notifications/push', { state: { deepLinkUrl: deepLinkUrl(item.slug) } })}
          >
            푸시 작성
          </Button>
          <Popconfirm
            title="딥링크 삭제"
            description="삭제하면 이 주소로 공유한 링크가 열리지 않습니다."
            okText="삭제"
            cancelText="취소"
            okButtonProps={{ danger: true }}
            onConfirm={() => crud.remove(item)}
          >
            <Button type="link" danger disabled={!!crud.changingId}>
              삭제
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  return (
    <div>
      <PageHeading
        title="딥링크 관리"
        description="포퐁 앱으로 연결되는 공유 링크를 만들고 제목·이미지·이동 화면을 관리합니다."
        action={
          <Button type="primary" icon={<PlusOutlined />} onClick={crud.openCreate}>
            딥링크 만들기
          </Button>
        }
      />
      <LoadError error={crud.error} retry={crud.refetch} />
      <Table<DeepLink>
        rowKey="id"
        columns={columns}
        dataSource={crud.data}
        loading={crud.loading}
        scroll={{ x: 1000 }}
        locale={{
          emptyText: crud.error
            ? '목록을 불러오지 못했습니다.'
            : '등록된 딥링크가 없습니다. 딥링크 만들기로 시작하세요.',
        }}
        pagination={{
          current: crud.pagination.currentPage,
          pageSize: crud.pagination.pageSize,
          total: crud.pagination.totalItems,
          showSizeChanger: true,
          showTotal: (total) => `총 ${total}개`,
          onChange: crud.onPageChange,
        }}
      />
      <DeepLinkModal
        open={crud.open}
        editing={crud.editing}
        form={crud.form}
        saving={crud.saving}
        onSave={() => void crud.save()}
        onClose={crud.close}
      />
    </div>
  );
}
