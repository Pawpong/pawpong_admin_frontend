import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Input, Segmented, Select, Space, Spin, Switch, Tabs } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { opsMonitoringApi } from '../features/operations/api/opsMonitoringApi';
import type { OpsLogLevel } from '../features/operations/api/opsMonitoring.types';
import { usePolledData } from '../features/operations/hooks/usePolledData';
import { LogsPanel } from '../features/operations/ui/LogsPanel';
import { SentryPanel } from '../features/operations/ui/SentryPanel';
import { ServersPanel } from '../features/operations/ui/ServersPanel';
import { TrafficPanel } from '../features/operations/ui/TrafficPanel';
import { LoadError, PageHeading } from '../shared/components/admin/PageHeading';

const TABS = ['servers', 'traffic', 'sentry', 'logs'] as const;
type TabKey = (typeof TABS)[number];
const REFRESH_MS = 30_000;
const PERIODS = [
  { value: 1, label: '최근 1시간' },
  { value: 6, label: '최근 6시간' },
  { value: 24, label: '최근 24시간' },
  { value: 72, label: '최근 3일' },
  { value: 168, label: '최근 7일' },
];

/** 데이터가 아직 없을 때만 스피너. 새로고침 중에는 직전 화면을 흐리게 유지한다 */
function Frame({ loading, hasData, children }: { loading: boolean; hasData: boolean; children: React.ReactNode }) {
  if (!hasData) return loading ? <Spin className="ops-loading" /> : null;
  return <div className={loading ? 'ops-refreshing' : undefined}>{children}</div>;
}

function ServersTab({ autoRefresh }: { autoRefresh: boolean }) {
  const state = usePolledData(opsMonitoringApi.getServers, autoRefresh ? REFRESH_MS : null);
  return (
    <>
      <TabToolbar updatedAt={state.updatedAt} loading={state.loading} reload={state.reload} />
      <LoadError error={state.error} retry={state.reload} />
      <Frame loading={state.loading} hasData={Boolean(state.data)}>
        {state.data && <ServersPanel data={state.data} now={state.updatedAt ?? Date.parse(state.data.asOf)} />}
      </Frame>
    </>
  );
}

function TrafficTab({ autoRefresh }: { autoRefresh: boolean }) {
  const [periodHours, setPeriodHours] = useState(24);
  const fetcher = useCallback(() => opsMonitoringApi.getTraffic(periodHours), [periodHours]);
  const state = usePolledData(fetcher, autoRefresh ? REFRESH_MS * 2 : null);
  return (
    <>
      <TabToolbar updatedAt={state.updatedAt} loading={state.loading} reload={state.reload}>
        <Select aria-label="조회 기간" value={periodHours} onChange={setPeriodHours} options={PERIODS} />
      </TabToolbar>
      <LoadError error={state.error} retry={state.reload} />
      <Frame loading={state.loading} hasData={Boolean(state.data)}>
        {state.data && <TrafficPanel data={state.data} periodHours={periodHours} />}
      </Frame>
    </>
  );
}

function SentryTab({ autoRefresh }: { autoRefresh: boolean }) {
  const state = usePolledData(opsMonitoringApi.getSentry, autoRefresh ? REFRESH_MS * 2 : null);
  return (
    <>
      <TabToolbar updatedAt={state.updatedAt} loading={state.loading} reload={state.reload} />
      <LoadError error={state.error} retry={state.reload} />
      <Frame loading={state.loading} hasData={Boolean(state.data)}>
        {state.data && (
          <SentryPanel data={state.data} now={state.updatedAt ?? Date.parse(state.data.collectedAt ?? '')} />
        )}
      </Frame>
    </>
  );
}

function LogsTab() {
  const [periodHours, setPeriodHours] = useState(24);
  const [level, setLevel] = useState<OpsLogLevel>('error');
  const [search, setSearch] = useState('');
  const fetcher = useCallback(
    () => opsMonitoringApi.getLogs({ periodHours, level, search }),
    [periodHours, level, search],
  );
  const state = usePolledData(fetcher, null);
  return (
    <>
      <TabToolbar updatedAt={state.updatedAt} loading={state.loading} reload={state.reload}>
        <Select aria-label="조회 기간" value={periodHours} onChange={setPeriodHours} options={PERIODS} />
        <Segmented
          value={level}
          onChange={(value) => setLevel(value as OpsLogLevel)}
          options={[
            { value: 'error', label: '에러' },
            { value: 'warn', label: '경고' },
            { value: 'info', label: '정보' },
            { value: 'all', label: '전체' },
          ]}
        />
        <Input.Search
          className="filter-control-wide"
          allowClear
          maxLength={100}
          placeholder="본문 검색 (대소문자 구분)"
          onSearch={(value) => setSearch(value.trim())}
        />
      </TabToolbar>
      <LoadError error={state.error} retry={state.reload} />
      <Frame loading={state.loading} hasData={Boolean(state.data)}>
        {state.data && <LogsPanel data={state.data} />}
      </Frame>
    </>
  );
}

/** 탭마다 필터는 한 줄로, 차트 위에 둔다. 필터가 없는 탭은 상자 없이 갱신 시각만 둔다 */
function TabToolbar({
  updatedAt,
  loading,
  reload,
  children,
}: {
  updatedAt?: number;
  loading: boolean;
  reload: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className={children ? 'filter-bar ops-toolbar' : 'ops-toolbar ops-toolbar-plain'}>
      {children}
      <span className="ops-toolbar-status">
        {loading ? '불러오는 중…' : updatedAt ? `${new Date(updatedAt).toLocaleTimeString('ko-KR')} 갱신` : ''}
      </span>
      <Button icon={<ReloadOutlined />} onClick={reload} loading={loading}>
        새로고침
      </Button>
    </div>
  );
}

export default function ServerMonitoring() {
  const [params, setParams] = useSearchParams();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const requested = params.get('tab') as TabKey | null;
  const tab: TabKey = requested && TABS.includes(requested) ? requested : 'servers';
  return (
    <div className="ops-page">
      <PageHeading
        title="서버 모니터링"
        description="운영·개발 서버 자원, API 트래픽, 웹 프론트 오류(센트리), 운영 로그를 그라파나·센트리를 열지 않고 확인하세요."
        action={
          <Space>
            <Switch checked={autoRefresh} onChange={setAutoRefresh} aria-label="자동 갱신" />
            <span className="muted">자동 갱신</span>
          </Space>
        }
      />
      <Tabs
        activeKey={tab}
        onChange={(key) => setParams(key === 'servers' ? {} : { tab: key }, { replace: true })}
        destroyOnHidden
        items={[
          { key: 'servers', label: '서버 상태', children: <ServersTab autoRefresh={autoRefresh} /> },
          { key: 'traffic', label: 'API 트래픽', children: <TrafficTab autoRefresh={autoRefresh} /> },
          { key: 'sentry', label: '프론트 오류', children: <SentryTab autoRefresh={autoRefresh} /> },
          { key: 'logs', label: '운영 로그', children: <LogsTab /> },
        ]}
      />
      <p className="muted ops-footnote">
        서버 상태 30초, 트래픽·센트리 1분마다 갱신합니다. 센트리 요약은 운영 호스트가 5분마다 받아 둔 값이라 최대 5분
        늦을 수 있습니다.
      </p>
    </div>
  );
}
