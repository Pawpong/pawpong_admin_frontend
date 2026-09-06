import { useCallback, useState } from 'react';
import { Alert, App, Button, Card, Drawer, Input, Select, Space, Table, Tag, Timeline, Typography } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { supportApi, type Status, type Ticket } from '../features/support/api/supportApi';
import { useRemoteData } from '../shared/hooks/useRemoteData';
import { PageHeading } from '../shared/components/admin/PageHeading';
const labels = { open: '접수', in_progress: '처리 중', resolved: '처리 완료' };
const options = Object.entries(labels).map(([value, label]) => ({ value, label }));
export default function Support() {
  const { message } = App.useApp();
  const [search, setSearch] = useSearchParams();
  const receiptId = search.get('receipt') || undefined;
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<Status>();
  const [selected, setSelected] = useState<Ticket>();
  const [status, setStatus] = useState<Status>('open');
  const [assignment, setAssignment] = useState<'me' | 'unassigned'>();
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const fetcher = useCallback(() => supportApi.list(page, filter, receiptId), [page, filter, receiptId]);
  const { data, loading, error, reload: load } = useRemoteData(fetcher);
  const items = data?.items || [];
  const total = data?.total || 0;
  const open = (ticket: Ticket) => {
    setSelected(ticket);
    setStatus(ticket.status);
    setAssignment(undefined);
    setNote('');
  };
  const save = async () => {
    if (!selected || saving) return;
    if (status === 'resolved' && !note.trim()) {
      message.warning('처리 완료 내용을 입력해주세요.');
      return;
    }
    setSaving(true);
    try {
      await supportApi.update(selected.eventId, {
        revision: selected.revision,
        status,
        assignment,
        note,
      });
      message.success('처리 내역이 저장되었습니다.');
      setSelected(undefined);
      void load();
    } catch {
      message.error('저장하지 못했습니다. 다른 담당자가 수정했을 수 있으니 새로고침 후 다시 확인해주세요.');
    } finally {
      setSaving(false);
    }
  };
  return (
    <div>
      <PageHeading
        title="고객지원 접수"
        description="피드백과 AI Q&A 문제의 담당자 및 처리 이력을 관리합니다."
        action={<Button onClick={() => void load()}>새로고침</Button>}
      />
      {error && <Alert type="error" showIcon message={error} />}
      <Card>
        <Space wrap style={{ marginBottom: 16 }}>
          <Select
            aria-label="처리 상태 필터"
            placeholder="모든 상태"
            allowClear
            options={options}
            value={filter}
            onChange={(v) => {
              setFilter(v);
              setPage(1);
            }}
            style={{ width: 160 }}
          />
          {receiptId && (
            <Tag
              closable
              onClose={() => {
                setSearch({});
                setPage(1);
              }}
            >
              접수번호: {receiptId}
            </Tag>
          )}
        </Space>
        <Table<Ticket>
          rowKey="eventId"
          dataSource={items}
          loading={loading}
          scroll={{ x: 900 }}
          pagination={{ current: page, pageSize: 20, total, showSizeChanger: false, onChange: setPage }}
          columns={[
            {
              title: '접수',
              dataIndex: 'eventId',
              render: (id, row) => (
                <Button type="link" onClick={() => open(row)}>
                  {id}
                </Button>
              ),
            },
            {
              title: '종류',
              dataIndex: 'kind',
              render: (v) =>
                ({ feedback: '사용자 피드백', ai_no_match: 'FAQ 없음', ai_error: 'AI 답변 오류' })[v as string] || v,
            },
            { title: '환경', dataIndex: 'environment' },
            { title: '처리 상태', dataIndex: 'status', render: (v: Status) => <Tag>{labels[v] || '접수'}</Tag> },
            { title: '담당자 ID', dataIndex: 'assigneeId', render: (v) => v || '미지정' },
            {
              title: 'Discord 전달',
              dataIndex: 'deliveryStatus',
              render: (v) => (v === 'delivered' ? '완료' : '대기·재시도'),
            },
            { title: '접수 시각', dataIndex: 'createdAt', render: (v) => new Date(v).toLocaleString('ko-KR') },
          ]}
        />
      </Card>
      <Drawer
        title="접수 상세"
        open={!!selected}
        onClose={() => {
          if (!saving) setSelected(undefined);
        }}
        width={560}
        extra={
          <Button type="primary" loading={saving} onClick={() => void save()}>
            저장
          </Button>
        }
      >
        <Typography.Paragraph copyable>{selected?.eventId}</Typography.Paragraph>
        <Typography.Paragraph style={{ whiteSpace: 'pre-wrap' }}>
          {selected?.message || 'AI 질문 원문은 저장하지 않습니다.'}
        </Typography.Paragraph>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Select
            aria-label="처리 상태"
            options={options}
            value={status}
            onChange={setStatus}
            disabled={saving}
            style={{ width: '100%' }}
          />
          <Select
            aria-label="담당자 지정"
            placeholder="현재 담당자 유지"
            allowClear
            value={assignment}
            onChange={setAssignment}
            disabled={saving}
            options={[
              { value: 'me', label: '내가 담당하기' },
              { value: 'unassigned', label: '담당자 해제' },
            ]}
            style={{ width: '100%' }}
          />
          <Input.TextArea
            aria-label="처리 내용"
            placeholder="처리 내용 (완료 시 필수)"
            maxLength={1000}
            showCount
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={saving}
          />
        </Space>
        <Typography.Title level={5}>처리 이력</Typography.Title>
        <Timeline
          items={selected?.history?.map((h) => ({
            children: (
              <>
                <div>
                  {new Date(h.at).toLocaleString('ko-KR')} · {labels[h.status]} · {h.actorId}
                </div>
                <div>담당자: {h.assigneeId || '미지정'}</div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{h.note}</div>
              </>
            ),
          }))}
        />
      </Drawer>
    </div>
  );
}
