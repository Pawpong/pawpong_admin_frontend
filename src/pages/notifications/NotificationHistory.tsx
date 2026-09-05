import { useCallback, useState } from 'react';
import { Button, Card, Descriptions, Form, Input, Modal, Select, Table, Tag } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { operationsApi, type NotificationQuery } from '../../features/operations/api/operationsApi';
import type { NotificationAdminResponse } from '../../features/operations/api/operations.types';
import { useRemoteData } from '../../shared/hooks/useRemoteData';
import { LoadError, Metric, PageHeading } from '../../shared/components/admin/PageHeading';

const types: Record<NotificationAdminResponse['type'], string> = {
  profile_review: '프로필 검토',
  profile_re_review: '프로필 재검토',
  matching: '매칭',
  breeder_approved: '브리더 승인',
  breeder_rejected: '브리더 반려',
  breeder_unapproved: '브리더 미승인',
  breeder_onboarding_incomplete: '입점 미완료',
  breeder_suspended: '브리더 정지',
  new_consult_request: '새 상담 신청',
  consult_request_confirmed: '상담 신청 확인',
  consult_completed: '상담 완료',
  document_reminder: '서류 제출 독촉',
  profile_completion_reminder: '프로필 완성 안내',
  admin_broadcast: '관리자 공지',
  new_review_registered: '새 후기',
  new_pet_registered: '새 반려동물',
  community_post_liked: '게시물 좋아요',
};
export default function NotificationHistory() {
  const [query, setQuery] = useState<NotificationQuery>({ pageNumber: 1, itemsPerPage: 20 });
  const [selected, setSelected] = useState<NotificationAdminResponse>();
  const list = useRemoteData(useCallback(() => operationsApi.getNotifications(query), [query]));
  const stats = useRemoteData(useCallback(() => operationsApi.getNotificationStats(), []));
  return (
    <div>
      <PageHeading
        title="알림 이력"
        description="발송된 알림과 읽음 상태, 유형별 알림 현황을 확인하세요."
        action={
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              list.reload();
              stats.reload();
            }}
          >
            새로고침
          </Button>
        }
      />
      <LoadError error={stats.error} retry={stats.reload} />
      <div className="metric-grid">
        <Metric label="전체 알림" value={stats.data?.totalNotifications ?? '—'} />
        <Metric label="읽지 않은 알림" value={stats.data?.unreadNotifications ?? '—'} />
        <Metric label="입양자 알림" value={stats.data ? Number(stats.data.notificationsByRole.adopter ?? 0) : '—'} />
        <Metric label="브리더 알림" value={stats.data ? Number(stats.data.notificationsByRole.breeder ?? 0) : '—'} />
      </div>
      {stats.data && (
        <div className="notification-types">
          {Object.entries(stats.data.notificationsByType).map(([type, count]) => (
            <Tag key={type}>
              {types[type as keyof typeof types] || type} · {String(count)}
            </Tag>
          ))}
        </div>
      )}
      <Form
        layout="inline"
        className="filter-bar"
        onFinish={(values) =>
          setQuery({
            ...values,
            isRead: values.isRead === undefined ? undefined : values.isRead === 'true',
            userId: values.userId?.trim() || undefined,
            pageNumber: 1,
            itemsPerPage: query.itemsPerPage,
          })
        }
      >
        <Form.Item name="userId" rules={[{ pattern: /^[a-f\d]{24}$/i, message: '사용자 ID는 24자리여야 합니다.' }]}>
          <Input aria-label="사용자 ID" placeholder="사용자 ID" allowClear />
        </Form.Item>
        <Form.Item name="userRole">
          <Select
            aria-label="사용자 역할"
            placeholder="전체 역할"
            allowClear
            style={{ width: 130 }}
            options={[
              { value: 'adopter', label: '입양자' },
              { value: 'breeder', label: '브리더' },
            ]}
          />
        </Form.Item>
        <Form.Item name="type">
          <Select
            aria-label="알림 유형"
            placeholder="전체 유형"
            allowClear
            style={{ width: 160 }}
            options={Object.entries(types).map(([value, label]) => ({ value, label }))}
          />
        </Form.Item>
        <Form.Item name="isRead">
          <Select
            aria-label="읽음 상태"
            placeholder="읽음 상태"
            allowClear
            style={{ width: 130 }}
            options={[
              { value: 'true', label: '읽음' },
              { value: 'false', label: '안 읽음' },
            ]}
          />
        </Form.Item>
        <Button htmlType="submit">조회</Button>
      </Form>
      <LoadError error={list.error} retry={list.reload} />
      <Table
        rowKey="notificationId"
        loading={list.loading}
        dataSource={list.data?.items}
        scroll={{ x: 900 }}
        pagination={{
          current: query.pageNumber,
          pageSize: query.itemsPerPage,
          total: list.data?.pagination.totalItems,
          showSizeChanger: true,
          onChange: (pageNumber, itemsPerPage) => setQuery({ ...query, pageNumber, itemsPerPage }),
        }}
        columns={[
          {
            title: '알림',
            dataIndex: 'title',
            render: (title, item) => (
              <Button type="link" onClick={() => setSelected(item)}>
                {title}
              </Button>
            ),
          },
          {
            title: '유형',
            dataIndex: 'type',
            render: (type: NotificationAdminResponse['type']) => types[type] || type,
          },
          { title: '수신 대상', dataIndex: 'userRole', render: (value) => (value === 'adopter' ? '입양자' : '브리더') },
          {
            title: '읽음 상태',
            dataIndex: 'isRead',
            render: (value) => <Tag color={value ? 'default' : 'gold'}>{value ? '읽음' : '안 읽음'}</Tag>,
          },
          { title: '발송일', dataIndex: 'createdAt', render: (date) => new Date(date).toLocaleString('ko-KR') },
        ]}
      />
      <Modal open={!!selected} title="알림 상세" onCancel={() => setSelected(undefined)} footer={null}>
        {selected && (
          <>
            <Card>
              <h3>{selected.title}</h3>
              <p style={{ whiteSpace: 'pre-wrap' }}>{selected.body}</p>
            </Card>
            <Descriptions
              column={1}
              items={[
                { key: 'user', label: '사용자 ID', children: selected.userId },
                { key: 'url', label: '이동 경로', children: selected.targetUrl || '없음' },
                {
                  key: 'read',
                  label: '읽은 시각',
                  children: selected.readAt ? new Date(selected.readAt).toLocaleString('ko-KR') : '아직 읽지 않음',
                },
              ]}
            />
          </>
        )}
      </Modal>
    </div>
  );
}
