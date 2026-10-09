import { Alert, Card, Collapse, Table, Tabs } from 'antd';
import type { OpsRouteStat, OpsTrafficResponse } from '../api/opsMonitoring.types';
import { formatCount, formatDateTime, formatMs } from '../model/opsFormat';
import { LatencyChart, LogLevelChart, RequestsChart } from './TrafficCharts';

function RouteTable({ routes, empty }: { routes: OpsRouteStat[]; empty: string }) {
  return (
    <Table<OpsRouteStat>
      size="small"
      rowKey={(route) => `${route.method} ${route.route}`}
      pagination={false}
      dataSource={routes}
      scroll={{ x: 640 }}
      locale={{ emptyText: empty }}
      columns={[
        {
          title: '경로',
          render: (_, route) => (
            <span className="ops-route">
              <code className="ops-method">{route.method}</code>
              <code className="ops-code">{route.route}</code>
            </span>
          ),
        },
        {
          title: '요청',
          dataIndex: 'requests',
          width: 90,
          align: 'right',
          render: (value: number) => formatCount(value),
        },
        {
          title: '5xx',
          dataIndex: 'errors5xx',
          width: 80,
          align: 'right',
          render: (value: number) =>
            value ? <span className="ops-level-text ops-level-critical">{formatCount(value)}</span> : '0',
        },
        {
          title: '4xx',
          dataIndex: 'errors4xx',
          width: 80,
          align: 'right',
          render: (value: number) => formatCount(value),
        },
        {
          title: 'p95',
          dataIndex: 'p95Ms',
          width: 90,
          align: 'right',
          render: (value: number | null) => formatMs(value),
        },
      ]}
    />
  );
}

/** 그라파나 로그 대시보드를 대신하는 API 트래픽 탭 */
export function TrafficPanel({ data, periodHours }: { data: OpsTrafficResponse; periodHours: number }) {
  if (!data.available) {
    return <Alert type="info" showIcon message="트래픽 지표를 볼 수 없습니다" description={data.reason} />;
  }
  const { totals } = data;
  const errorRate = totals.requests ? (totals.status5xx / totals.requests) * 100 : 0;
  return (
    <div className="ops-panel">
      <div className="metric-grid metric-grid-five">
        <div className="metric-card">
          <span>요청 수</span>
          <strong>{formatCount(totals.requests)}</strong>
          <small>헬스체크 제외 · 최근 {periodHours}시간</small>
        </div>
        <div className="metric-card">
          <span>서버 오류(5xx)</span>
          <strong className={totals.status5xx ? 'ops-level-text ops-level-critical' : undefined}>
            {formatCount(totals.status5xx)}
          </strong>
          <small>전체 요청의 {errorRate.toFixed(2)}%</small>
        </div>
        <div className="metric-card">
          <span>요청 오류(4xx)</span>
          <strong>{formatCount(totals.status4xx)}</strong>
          <small>404 대부분은 외부 스캐너 요청</small>
        </div>
        <div className="metric-card">
          <span>p95 응답 시간</span>
          <strong>{formatMs(totals.p95Ms)}</strong>
          <small>
            중앙값 {formatMs(totals.p50Ms)} · p99 {formatMs(totals.p99Ms)}
          </small>
        </div>
        <div className="metric-card">
          <span>에러 로그</span>
          <strong className={totals.errorLogs ? 'ops-level-text ops-level-critical' : undefined}>
            {formatCount(totals.errorLogs)}
          </strong>
          <small>경고 {formatCount(totals.warnLogs)}건</small>
        </div>
      </div>

      <Card title="요청 수" extra={<span className="muted">{Math.round(data.stepSeconds / 60)}분 단위</span>}>
        <RequestsChart series={data.series} spanHours={periodHours} />
      </Card>

      <div className="ops-two-columns">
        <Card title="p95 응답 시간">
          <LatencyChart series={data.series} spanHours={periodHours} />
        </Card>
        <Card title="에러·경고 로그">
          <LogLevelChart levels={data.levels} spanHours={periodHours} />
        </Card>
      </div>

      <Card title="경로별 현황" className="ops-table-card">
        <Tabs
          items={[
            {
              key: 'top',
              label: '많이 호출된 경로',
              children: <RouteTable routes={data.topRoutes} empty="기간 안에 요청이 없습니다" />,
            },
            {
              key: 'failing',
              label: `실패한 경로 ${data.failingRoutes.length ? `(${data.failingRoutes.length})` : ''}`,
              children: <RouteTable routes={data.failingRoutes} empty="4xx·5xx 응답이 없습니다" />,
            },
            {
              key: 'slow',
              label: '느린 경로',
              children: <RouteTable routes={data.slowRoutes} empty="기간 안에 요청이 없습니다" />,
            },
          ]}
        />
        <p className="muted ops-footnote">
          경로의 ID 조각은 :id 로 묶었습니다. p95 는 같은 패턴 경로 중 가장 느린 값입니다.
        </p>
      </Card>

      <Collapse
        className="ops-table-view"
        items={[
          {
            key: 'table',
            label: '차트 값을 표로 보기',
            children: (
              <Table
                size="small"
                rowKey="at"
                pagination={{ pageSize: 24, showSizeChanger: false }}
                scroll={{ x: 720 }}
                dataSource={data.series.map((point, index) => ({ ...point, ...data.levels[index], at: point.at }))}
                columns={[
                  { title: '시각', dataIndex: 'at', render: (value: string) => formatDateTime(value) },
                  { title: '요청', dataIndex: 'requests', align: 'right', render: (v: number) => formatCount(v) },
                  { title: '4xx', dataIndex: 'status4xx', align: 'right', render: (v: number) => formatCount(v) },
                  { title: '5xx', dataIndex: 'status5xx', align: 'right', render: (v: number) => formatCount(v) },
                  { title: 'p95', dataIndex: 'p95Ms', align: 'right', render: (v: number | null) => formatMs(v) },
                  { title: '에러 로그', dataIndex: 'error', align: 'right', render: (v: number) => formatCount(v) },
                  { title: '경고 로그', dataIndex: 'warn', align: 'right', render: (v: number) => formatCount(v) },
                ]}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
