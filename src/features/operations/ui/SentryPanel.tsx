import { useMemo, useState } from 'react';
import { Alert, Card, Input, Segmented, Table, Tag } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import type { OpsSentryIssue, OpsSentryResponse } from '../api/opsMonitoring.types';
import { formatCount, formatDateTime, formatRelative } from '../model/opsFormat';
import { HourlySparkline } from './TrafficCharts';

const ENVIRONMENT_LABEL: Record<string, string> = {
  production: '운영 (pawpong.kr)',
  development: '개발 (dev.pawpong.kr)',
};
const STATUS_LABEL: Record<string, string> = { unresolved: '미해결', resolved: '해결됨', ignored: '무시됨' };
const LEVEL_COLOR: Record<string, string> = {
  fatal: 'magenta',
  error: 'red',
  warning: 'orange',
  info: 'blue',
  debug: 'default',
};

function IssueDetail({ issue }: { issue: OpsSentryIssue }) {
  const event = issue.latestEvent;
  if (!event) return <p className="muted">최신 이벤트 상세를 아직 받지 못했습니다. 센트리에서 확인하세요.</p>;
  return (
    <div className="ops-issue-detail">
      <dl className="ops-server-facts">
        <div>
          <dt>오류</dt>
          <dd>
            <code className="ops-code">{event.exceptionType ?? '—'}</code> {event.exceptionValue}
          </dd>
        </div>
        <div>
          <dt>발생 화면</dt>
          <dd>{event.url ?? issue.culprit ?? '—'}</dd>
        </div>
        <div>
          <dt>환경</dt>
          <dd>{[event.device, event.os, event.browser].filter(Boolean).join(' · ') || '—'}</dd>
        </div>
        <div>
          <dt>릴리스</dt>
          <dd>{event.release ? <code className="ops-code">{event.release.slice(0, 7)}</code> : '—'}</dd>
        </div>
        <div>
          <dt>처음 · 마지막</dt>
          <dd>
            {formatDateTime(issue.firstSeen)} · {formatDateTime(issue.lastSeen)}
          </dd>
        </div>
      </dl>
      {event.frames.length > 0 && (
        <>
          <h4>스택 (오류 지점부터)</h4>
          <ol className="ops-frames">
            {event.frames.map((frame, index) => (
              <li key={index} className={frame.inApp ? 'ops-frame-app' : undefined}>
                <code>{frame.function ?? '(익명)'}</code>
                <span>
                  {frame.filename ?? '?'}
                  {frame.lineNo !== null ? `:${frame.lineNo}` : ''}
                  {frame.colNo !== null ? `:${frame.colNo}` : ''}
                </span>
                {frame.inApp && <Tag>우리 코드</Tag>}
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}

/** 센트리 대시보드를 대신하는 프론트 오류 탭. 운영 호스트가 5분마다 받아 둔 요약을 보여 준다 */
export function SentryPanel({ data, now }: { data: OpsSentryResponse; now: number }) {
  const [environment, setEnvironment] = useState('production');
  const [status, setStatus] = useState<'unresolved' | 'all'>('unresolved');
  const [query, setQuery] = useState('');
  const current = data.environments.find((item) => item.environment === environment) ?? data.environments[0];
  const issues = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return (current?.issues ?? []).filter(
      (issue) =>
        (status === 'all' || issue.status === 'unresolved') &&
        (!keyword || `${issue.title} ${issue.culprit ?? ''} ${issue.shortId}`.toLowerCase().includes(keyword)),
    );
  }, [current, status, query]);

  if (!data.available) {
    return <Alert type="info" showIcon message="프론트 오류 요약을 볼 수 없습니다" description={data.reason} />;
  }
  const unresolved = (current?.issues ?? []).filter((issue) => issue.status === 'unresolved');
  const last24h = (current?.issues ?? []).reduce((sum, issue) => sum + issue.stats24h.reduce((a, b) => a + b, 0), 0);
  const users = unresolved.reduce((sum, issue) => sum + issue.userCount, 0);

  return (
    <div className="ops-panel">
      {data.stale && (
        <Alert
          type="warning"
          showIcon
          message={`센트리 요약이 ${formatRelative(data.collectedAt, now)} 값입니다`}
          description="운영 호스트의 pawpong-sentry-monitor 타이머가 멈췄는지 확인하세요."
        />
      )}
      <div className="filter-bar">
        <Segmented
          value={environment}
          onChange={(value) => setEnvironment(String(value))}
          options={data.environments.map((item) => ({
            value: item.environment,
            label: ENVIRONMENT_LABEL[item.environment] ?? item.environment,
          }))}
        />
        <Segmented
          value={status}
          onChange={(value) => setStatus(value as 'unresolved' | 'all')}
          options={[
            { value: 'unresolved', label: '미해결만' },
            { value: 'all', label: '전체' },
          ]}
        />
        <Input.Search
          className="filter-control-wide"
          allowClear
          placeholder="제목·화면 경로로 찾기"
          onSearch={setQuery}
          onChange={(event) => !event.target.value && setQuery('')}
        />
        <span>최근 14일 · {formatRelative(data.collectedAt, now)} 수집</span>
      </div>
      {current && !current.ok && (
        <Alert type="warning" showIcon message="이번 수집에서 센트리 응답이 일부 실패해 목록이 빠졌을 수 있습니다" />
      )}
      <div className="metric-grid">
        <div className="metric-card">
          <span>미해결 이슈</span>
          <strong>{formatCount(unresolved.length)}</strong>
          <small>{current?.project}</small>
        </div>
        <div className="metric-card">
          <span>최근 24시간 발생</span>
          <strong>{formatCount(last24h)}</strong>
          <small>이슈 전체 이벤트 합</small>
        </div>
        <div className="metric-card">
          <span>영향 사용자</span>
          <strong>{formatCount(users)}</strong>
          <small>미해결 이슈 기준 · 익명 수집이라 0일 수 있음</small>
        </div>
        <div className="metric-card">
          <span>가장 최근 오류</span>
          <strong>{formatRelative(unresolved[0]?.lastSeen ?? null, now)}</strong>
          <small>{unresolved[0]?.shortId ?? '미해결 이슈 없음'}</small>
        </div>
      </div>
      <Card className="ops-table-card">
        <Table<OpsSentryIssue>
          rowKey="id"
          size="middle"
          dataSource={issues}
          pagination={{ pageSize: 20, showSizeChanger: false }}
          scroll={{ x: 960 }}
          expandable={{ expandedRowRender: (issue) => <IssueDetail issue={issue} />, expandRowByClick: true }}
          locale={{ emptyText: status === 'unresolved' ? '미해결 오류가 없습니다' : '최근 14일 오류가 없습니다' }}
          columns={[
            {
              title: '레벨',
              dataIndex: 'level',
              width: 90,
              render: (level: string, issue) => (
                <>
                  <Tag color={LEVEL_COLOR[level] ?? 'default'}>{level}</Tag>
                  {issue.isUnhandled && <Tag color="volcano">처리 안 됨</Tag>}
                </>
              ),
            },
            {
              title: '이슈',
              render: (_, issue) => (
                <div className="ops-issue-title">
                  <strong>{issue.title}</strong>
                  <span className="muted">
                    {issue.shortId}
                    {issue.culprit ? ` · ${issue.culprit}` : ''}
                    {issue.status !== 'unresolved' ? ` · ${STATUS_LABEL[issue.status] ?? issue.status}` : ''}
                  </span>
                </div>
              ),
            },
            {
              title: '24시간',
              dataIndex: 'stats24h',
              width: 120,
              render: (values: number[], issue) => (
                <HourlySparkline values={values} label={`${issue.shortId} 최근 24시간 발생 추이`} endAt={now} />
              ),
            },
            { title: '발생', dataIndex: 'count', width: 80, align: 'right', render: (v: number) => formatCount(v) },
            {
              title: '사용자',
              dataIndex: 'userCount',
              width: 80,
              align: 'right',
              render: (v: number) => formatCount(v),
            },
            {
              title: '마지막 발생',
              dataIndex: 'lastSeen',
              width: 120,
              render: (value: string | null) => <span title={formatDateTime(value)}>{formatRelative(value, now)}</span>,
            },
            {
              title: '',
              width: 56,
              render: (_, issue) =>
                issue.permalink ? (
                  <a
                    href={issue.permalink}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${issue.shortId} 센트리에서 열기`}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <ExportOutlined />
                  </a>
                ) : null,
            },
          ]}
        />
      </Card>
    </div>
  );
}
