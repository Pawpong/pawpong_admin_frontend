import { Alert, Card, Table, Tag, Tooltip } from 'antd';
import type { OpsHealthLevel, OpsProcess, OpsServerView } from '../api/opsMonitoring.types';
import {
  formatBytes,
  formatDuration,
  formatPercent,
  formatRelative,
  HEALTH_LABEL,
  processLevel,
  usageLevel,
  USAGE_THRESHOLDS,
} from '../model/opsFormat';
import { UsageHistoryChart } from './UsageHistoryChart';
import { UsageMeter } from './UsageMeter';

const LEVEL_TAG: Record<OpsHealthLevel, string> = {
  ok: 'green',
  warning: 'orange',
  critical: 'red',
  unknown: 'default',
};

export function HealthTag({ level }: { level: OpsHealthLevel }) {
  return <Tag color={LEVEL_TAG[level]}>{HEALTH_LABEL[level]}</Tag>;
}

const PROCESS_STATE: Record<string, string> = {
  online: '실행 중',
  running: '실행 중',
  stopped: '중지됨',
  stopping: '중지 중',
  errored: '오류로 멈춤',
  launching: '시작 중',
  exited: '종료됨',
  restarting: '재시작 중',
  missing: '컨테이너 없음',
};

const HEALTH_TEXT: Record<string, string> = {
  healthy: '헬스체크 정상',
  unhealthy: '헬스체크 실패',
  starting: '헬스체크 대기',
};

function ProcessTable({
  processes,
  source,
  now,
}: {
  processes: OpsProcess[];
  source: 'pm2' | 'docker' | null;
  now: number;
}) {
  return (
    <Table<OpsProcess>
      size="small"
      rowKey="name"
      pagination={false}
      dataSource={processes}
      scroll={{ x: 440 }}
      locale={{ emptyText: source ? '프로세스 정보가 없습니다' : '이 서버의 프로세스 정보는 아직 수집되지 않았습니다' }}
      columns={[
        {
          title: source === 'pm2' ? 'PM2 프로세스' : '컨테이너',
          render: (_, process) => (
            <div className="ops-process-name">
              <span className="ops-process-head">
                <HealthTag level={processLevel(process)} />
                <code className="ops-code ops-nowrap">{process.name}</code>
              </span>
              <span className="muted">
                {PROCESS_STATE[process.state] ?? process.state}
                {process.health && ` · ${HEALTH_TEXT[process.health] ?? process.health}`}
              </span>
            </div>
          ),
        },
        {
          title: '메모리 · CPU',
          width: 140,
          align: 'right',
          render: (_, process) => {
            const percent =
              process.memoryBytes !== null && process.memoryLimitBytes
                ? (process.memoryBytes / process.memoryLimitBytes) * 100
                : null;
            const level = usageLevel(percent, USAGE_THRESHOLDS.memory);
            return (
              <div className="ops-cell-stack">
                <span
                  className={level === 'ok' || level === 'unknown' ? undefined : `ops-level-text ops-level-${level}`}
                >
                  {formatBytes(process.memoryBytes)}
                  {process.memoryLimitBytes ? ` / ${formatBytes(process.memoryLimitBytes)}` : ''}
                </span>
                <span className="muted">CPU {formatPercent(process.cpuPercent)}</span>
              </div>
            );
          },
        },
        {
          title: '재시작 · 가동',
          width: 96,
          align: 'right',
          render: (_, process) => (
            <div className="ops-cell-stack">
              <span>{process.restarts === null ? '—' : `${process.restarts}회`}</span>
              {process.startedAt ? (
                <Tooltip title={new Date(process.startedAt).toLocaleString('ko-KR')}>
                  <span className="muted">{formatDuration((now - Date.parse(process.startedAt)) / 1000)}</span>
                </Tooltip>
              ) : (
                <span className="muted">—</span>
              )}
            </div>
          ),
        },
      ]}
    />
  );
}

/** 서버 한 대의 상태 카드 — 경고 문장, 자원 미터, 24시간 추이, 프로세스 목록 */
export function ServerCard({ server, now }: { server: OpsServerView; now: number }) {
  const snapshot = server.snapshot;
  const host = snapshot?.host;
  const containerScope = host?.container?.scope;
  // 개발 서버는 맥미니 위 리눅스 컨테이너라 호스트 메모리보다 컨테이너 한도가 실제 한계다
  const serverIsContainer = containerScope === 'server' && host?.container?.memoryLimitBytes;
  const memoryLabel = serverIsContainer ? '메모리(컨테이너 한도 대비)' : '메모리';

  return (
    <Card
      className="ops-server-card"
      title={
        <div className="ops-server-title">
          <HealthTag level={server.status} />
          <span>{server.label}</span>
        </div>
      }
      extra={
        <span className="muted">
          {server.source === 'live' ? '실시간' : `${formatRelative(server.fetchedAt, now)} 수집`}
        </span>
      }
    >
      {server.alerts.length > 0 && (
        <Alert
          className="ops-server-alerts"
          type={server.status === 'critical' ? 'error' : server.status === 'warning' ? 'warning' : 'info'}
          showIcon
          message={server.alerts.length === 1 ? server.alerts[0] : `확인할 항목 ${server.alerts.length}개`}
          description={
            server.alerts.length > 1 ? (
              <ul className="ops-alert-list">
                {server.alerts.map((alert) => (
                  <li key={alert}>{alert}</li>
                ))}
              </ul>
            ) : undefined
          }
        />
      )}
      {!snapshot || !host ? (
        <p className="muted">서버 상태를 받지 못했습니다{server.error ? ` (${server.error})` : ''}.</p>
      ) : (
        <>
          <dl className="ops-server-facts">
            <div>
              <dt>호스트</dt>
              <dd>
                {host.hostname} · {host.platform}/{host.arch} · {host.container?.cpuLimitCores ?? host.cpuCount}코어
              </dd>
            </div>
            <div>
              <dt>서버 가동</dt>
              <dd>{formatDuration(host.uptimeSeconds)}</dd>
            </div>
            <div>
              <dt>API 가동</dt>
              <dd>
                {formatDuration(snapshot.app.uptimeSeconds)}
                {snapshot.app.deployment ? ` · ${snapshot.app.deployment} 슬롯` : ''}
              </dd>
            </div>
            <div>
              <dt>부하(1·5·15분)</dt>
              <dd>{host.loadAverage.map((value) => value.toFixed(2)).join(' · ') || '—'}</dd>
            </div>
            {snapshot.lastDeploy && (
              <div>
                <dt>마지막 배포</dt>
                <dd>
                  <code className="ops-code">{snapshot.lastDeploy.tag.slice(0, 7)}</code> ·{' '}
                  {formatRelative(snapshot.lastDeploy.at, now)}
                </dd>
              </div>
            )}
          </dl>

          <div className="ops-meter-grid">
            <UsageMeter
              label="CPU"
              value={host.cpuPercent}
              level={usageLevel(host.cpuPercent, USAGE_THRESHOLDS.cpu)}
              detail={
                host.container?.cpuPercent != null
                  ? `컨테이너 한도 대비 ${formatPercent(host.container.cpuPercent)}`
                  : undefined
              }
            />
            {serverIsContainer && host.container ? (
              <UsageMeter
                label={memoryLabel}
                value={host.container.memoryPercent}
                level={usageLevel(host.container.memoryPercent, USAGE_THRESHOLDS.memory)}
                detail={`${formatBytes(host.container.memoryUsageBytes)} / ${formatBytes(host.container.memoryLimitBytes)}`}
              />
            ) : (
              <UsageMeter
                label="메모리"
                value={host.memory?.usedPercent ?? null}
                level={usageLevel(host.memory?.usedPercent, USAGE_THRESHOLDS.memory)}
                detail={
                  host.memory
                    ? `${formatBytes(host.memory.totalBytes - host.memory.availableBytes)} / ${formatBytes(host.memory.totalBytes)}`
                    : undefined
                }
              />
            )}
            <UsageMeter
              label="디스크"
              value={host.disk?.usedPercent ?? null}
              level={usageLevel(host.disk?.usedPercent, USAGE_THRESHOLDS.disk)}
              detail={host.disk ? `남은 공간 ${formatBytes(host.disk.availableBytes)}` : undefined}
            />
            {containerScope === 'app' && host.container ? (
              <UsageMeter
                label="API 컨테이너 메모리"
                value={host.container.memoryPercent}
                level={usageLevel(host.container.memoryPercent, USAGE_THRESHOLDS.memory)}
                detail={`${formatBytes(host.container.memoryUsageBytes)} / ${formatBytes(host.container.memoryLimitBytes)}`}
              />
            ) : (
              serverIsContainer &&
              host.memory && (
                <UsageMeter
                  label="맥미니 VM 메모리"
                  value={host.memory.usedPercent}
                  level={usageLevel(host.memory.usedPercent, USAGE_THRESHOLDS.memory)}
                  detail={`${formatBytes(host.memory.totalBytes - host.memory.availableBytes)} / ${formatBytes(host.memory.totalBytes)}`}
                />
              )
            )}
          </div>

          <section className="ops-section">
            <h4>최근 24시간 자원 사용률</h4>
            <UsageHistoryChart
              history={snapshot.history}
              memoryLabel={memoryLabel}
              useContainerMemory={Boolean(serverIsContainer)}
            />
          </section>

          <section className="ops-section">
            <h4>
              {snapshot.processSource === 'pm2' ? 'PM2 프로세스' : '컨테이너'}
              {snapshot.processCollectedAt && (
                <span className="muted"> · {formatRelative(snapshot.processCollectedAt, now)} 기준</span>
              )}
            </h4>
            <ProcessTable processes={snapshot.processes} source={snapshot.processSource} now={now} />
            <p className="muted ops-footnote">
              API 프로세스 메모리 {formatBytes(snapshot.app.rssBytes)} · 힙 {formatBytes(snapshot.app.heapUsedBytes)} /{' '}
              {formatBytes(snapshot.app.heapTotalBytes)} · 이벤트 루프 지연 p99{' '}
              {snapshot.app.eventLoopLagMs === null ? '—' : `${snapshot.app.eventLoopLagMs}ms`} · Node{' '}
              {snapshot.app.nodeVersion}
            </p>
          </section>
        </>
      )}
    </Card>
  );
}
