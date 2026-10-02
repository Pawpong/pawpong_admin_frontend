import { useCallback, useState } from 'react';
import {
  Alert,
  Button,
  Descriptions,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import { billingApi, type BillingEvent, type BillingQuery, type Purchase } from '../api/billingApi';
import { billingError } from '../model/catalog';
import { useRemoteData } from '../../../shared/hooks/useRemoteData';
import { LoadError } from '../../../shared/components/admin/PageHeading';

const statuses = [
  { value: 'pending', label: '승인 대기' },
  { value: 'verified', label: '결제 확인' },
  { value: 'refunded', label: '환불' },
  { value: 'expired', label: '만료' },
  { value: 'canceled', label: '갱신 해지' },
  { value: 'on_hold', label: '보류' },
];
const time = (value?: string | null) => (value ? new Date(value).toLocaleString('ko-KR') : '—');
const eventTitle: Record<string, string> = {
  verification_requested: '검증 요청',
  verification_succeeded: '검증 성공',
  verification_failed: '검증 실패',
  duplicate_request: '중복 요청',
  ownership_rejected: '소유자 불일치',
  entitlement_granted: '이용권 지급',
  entitlement_revoked: '이용권 회수',
  refunded: '환불',
  subscription_renewed: '구독 갱신',
  subscription_expired: '구독 만료',
  subscription_canceled: '갱신 해지',
  store_updated: '스토어 상태 반영',
  notification_ignored: '알림 무시',
  admin_action: '관리자 조치',
  credit_spent: '이용권 차감',
  credit_restored: '이용권 복구',
  store_acknowledged: '스토어 승인',
};

function PurchaseDetail({ id, onChanged }: { id: string; onChanged: () => void }) {
  const fetcher = useCallback(() => billingApi.detail(id), [id]);
  const detail = useRemoteData(fetcher);
  const [reason, setReason] = useState('');
  const [action, setAction] = useState<'revoke' | 'regrant'>('revoke');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const adjust = async () => {
    if (!reason.trim()) return;
    setBusy(true);
    setError('');
    try {
      await billingApi.adjust(id, { action, reason: reason.trim() });
      setReason('');
      detail.reload();
      onChanged();
    } catch (e) {
      setError(billingError(e));
    } finally {
      setBusy(false);
    }
  };
  const p = detail.data?.purchase;
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <LoadError error={detail.error} retry={detail.reload} />
      {!p && !detail.error && <p>구매 내역을 확인하고 있습니다…</p>}
      {p && (
        <>
          <Descriptions
            bordered
            column={1}
            size="small"
            items={[
              { key: 'id', label: '구매 ID', children: p.id },
              { key: 'user', label: '회원 ID', children: p.userId },
              { key: 'product', label: '상품', children: `${p.productCode} / ${p.productId}` },
              { key: 'status', label: '상태', children: statuses.find((s) => s.value === p.status)?.label ?? p.status },
              { key: 'env', label: '스토어 · 환경', children: `${p.platform} · ${p.environment}` },
              { key: 'transaction', label: '거래 ID', children: p.transactionId },
              { key: 'original', label: '원거래 ID', children: p.originalTransactionId },
              {
                key: 'amount',
                label: '스토어 확인 금액',
                children: p.amount === null ? '정보 없음' : `${p.amount} ${p.currency ?? ''}`,
              },
              {
                key: 'benefits',
                label: '구매 시 지급 정의',
                children: p.benefits.map((b, i) => (
                  <div key={i}>
                    {b.type} {b.creditKey} × {b.quantity}
                  </div>
                )),
              },
              { key: 'period', label: '구매일 / 만료일', children: `${time(p.purchasedAt)} / ${time(p.expiresAt)}` },
              {
                key: 'renew',
                label: '자동 갱신',
                children: p.autoRenewing === null ? '해당 없음' : p.autoRenewing ? '켜짐' : '꺼짐',
              },
              {
                key: 'entitlement',
                label: '권한',
                children: p.adminRevoked ? '관리자 회수' : p.entitlementActive ? '유효' : '비활성',
              },
            ]}
          />
          <Alert
            type="warning"
            showIcon
            message="권한 조치는 스토어 결제 취소·환불과 별개입니다."
            description="원장 근거를 확인한 뒤 사유를 남기세요. 이미 사용한 이용권 회수는 환불 정산으로 남을 수 있습니다."
          />
          {error && <Alert type="error" message={error} />}
          <Select
            aria-label="권한 조치"
            value={action}
            onChange={setAction}
            disabled={busy}
            options={[
              { value: 'revoke', label: '권한 회수' },
              { value: 'regrant', label: '권한 재지급' },
            ]}
            style={{ width: '100%' }}
          />
          <Input.TextArea
            aria-label="권한 조치 사유"
            placeholder="권한 조치 사유 (필수)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
            rows={3}
            disabled={busy}
          />
          <Button
            danger={action === 'revoke'}
            type="primary"
            loading={busy}
            disabled={!reason.trim()}
            onClick={() => void adjust()}
          >
            {action === 'revoke' ? '권한 회수 기록' : '권한 재지급 기록'}
          </Button>
          <Typography.Title level={4}>이벤트 타임라인</Typography.Title>
          <Timeline
            items={detail.data?.events.map((event) => ({
              children: (
                <>
                  <strong>{eventTitle[event.type] ?? event.type}</strong>
                  <p>
                    {time(event.occurredAt)} · {event.source}
                  </p>
                  {event.reason && <p>{event.reason}</p>}
                  {event.actorId && <p>처리 관리자: {event.actorId}</p>}
                  {event.creditDelta !== undefined && (
                    <p>
                      {event.creditKey} 이용권 {event.creditDelta > 0 ? '+' : ''}
                      {event.creditDelta}
                    </p>
                  )}
                </>
              ),
            }))}
          />
        </>
      )}
    </Space>
  );
}

export function PurchaseLedger({ audit = false }: { audit?: boolean }) {
  const [query, setQuery] = useState<BillingQuery>({ page: 1, limit: 20 });
  const [detailId, setDetailId] = useState<string>();
  const fetchPurchases = useCallback(() => {
    const { userId, ...rest } = query;
    return userId ? billingApi.userPurchases(userId, rest) : billingApi.purchases(query);
  }, [query]);
  const fetchEvents = useCallback(() => {
    const filters = { ...query };
    delete filters.status;
    return billingApi.events(filters);
  }, [query]);
  // 탭별로 컴포넌트를 마운트하므로 감사/구매 API를 함께 요청하지 않는다.
  const data = useRemoteData(
    useCallback(
      async () =>
        audit
          ? { kind: 'events' as const, page: await fetchEvents() }
          : { kind: 'purchases' as const, page: await fetchPurchases() },
      [audit, fetchEvents, fetchPurchases],
    ),
  );
  const pagination = {
    current: query.page,
    pageSize: 20,
    total: data.data?.page.pagination.totalItems,
    showSizeChanger: false,
    onChange: (page: number) => setQuery((q) => ({ ...q, page })),
  };
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Form
        layout="inline"
        onFinish={(values: BillingQuery) =>
          setQuery({
            ...Object.fromEntries(Object.entries(values).filter(([, v]) => v)),
            page: 1,
            limit: 20,
            ...(values.from ? { from: new Date(values.from).toISOString() } : {}),
            ...(values.to ? { to: new Date(values.to).toISOString() } : {}),
          })
        }
        style={{ gap: 12 }}
      >
        <Form.Item name="userId" label="회원 ID">
          <Input allowClear />
        </Form.Item>
        <Form.Item name="productCode" label="상품 코드">
          <Input allowClear />
        </Form.Item>
        <Form.Item name="platform" label="스토어">
          <Select
            allowClear
            style={{ width: 140 }}
            options={[
              { value: 'ios', label: 'App Store' },
              { value: 'android', label: 'Google Play' },
            ]}
          />
        </Form.Item>
        {!audit && (
          <Form.Item name="status" label="상태">
            <Select allowClear style={{ width: 120 }} options={statuses} />
          </Form.Item>
        )}
        <Form.Item name="from" label="시작일">
          <Input type="datetime-local" />
        </Form.Item>
        <Form.Item name="to" label="종료일">
          <Input type="datetime-local" />
        </Form.Item>
        <Button htmlType="submit" type="primary">
          조회
        </Button>
        <Button onClick={data.reload}>새로고침</Button>
      </Form>
      <LoadError error={data.error} retry={data.reload} />
      {audit ? (
        <Table<BillingEvent>
          rowKey="id"
          loading={data.loading}
          dataSource={data.data?.kind === 'events' ? data.data.page.items : []}
          pagination={pagination}
          scroll={{ x: 1000 }}
          columns={[
            { title: '기록일', dataIndex: 'recordedAt', render: time },
            { title: '이벤트', dataIndex: 'type', render: (v) => eventTitle[v] ?? v },
            {
              title: '회원 / 관리자',
              render: (_, e) => (
                <>
                  {e.userId || '—'}
                  <br />
                  {e.actorId || '—'}
                </>
              ),
            },
            { title: '상품', dataIndex: 'productCode' },
            {
              title: '이용권 변동',
              render: (_, e) => (e.creditDelta === undefined ? '—' : `${e.creditKey ?? ''} ${e.creditDelta}`),
            },
            { title: '사유', dataIndex: 'reason' },
            {
              title: '구매',
              render: (_, e) => e.purchaseId && <Button onClick={() => setDetailId(e.purchaseId!)}>상세</Button>,
            },
          ]}
        />
      ) : (
        <Table<Purchase>
          rowKey="id"
          loading={data.loading}
          dataSource={data.data?.kind === 'purchases' ? data.data.page.items : []}
          pagination={pagination}
          scroll={{ x: 1000 }}
          columns={[
            { title: '구매일', dataIndex: 'purchasedAt', render: time },
            { title: '회원 ID', dataIndex: 'userId' },
            { title: '상품', dataIndex: 'productCode' },
            {
              title: '스토어 / 환경',
              render: (_, p) => (
                <>
                  {p.platform}
                  <br />
                  <Tag color={p.environment === 'Sandbox' ? 'orange' : 'blue'}>{p.environment}</Tag>
                </>
              ),
            },
            { title: '상태', dataIndex: 'status', render: (v) => statuses.find((s) => s.value === v)?.label },
            { title: '만료일', dataIndex: 'expiresAt', render: time },
            { title: '관리', render: (_, p) => <Button onClick={() => setDetailId(p.id)}>상세</Button> },
          ]}
        />
      )}
      <Drawer
        title="구매 상세와 권한 조치"
        open={Boolean(detailId)}
        onClose={() => setDetailId(undefined)}
        width={640}
        destroyOnHidden
      >
        {detailId && <PurchaseDetail key={detailId} id={detailId} onChanged={data.reload} />}
      </Drawer>
    </Space>
  );
}
