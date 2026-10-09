// 관리자 서버 모니터링 API 계약 (백엔드 platform-admin/ops/*, 2026-10-09).

export type OpsHealthLevel = 'ok' | 'warning' | 'critical' | 'unknown';

export type OpsProcess = {
  kind: 'pm2' | 'docker';
  name: string;
  state: string;
  health: string | null;
  cpuPercent: number | null;
  memoryBytes: number | null;
  memoryLimitBytes: number | null;
  restarts: number | null;
  startedAt: string | null;
};

export type OpsHistoryPoint = {
  at: string;
  cpuPercent: number | null;
  memoryPercent: number | null;
  containerMemoryPercent: number | null;
  diskPercent: number | null;
  load1: number | null;
  eventLoopLagMs: number | null;
};

export type OpsHost = {
  hostname: string;
  platform: string;
  arch: string;
  cpuCount: number;
  uptimeSeconds: number;
  loadAverage: number[];
  cpuPercent: number | null;
  memory: { totalBytes: number; availableBytes: number; usedPercent: number } | null;
  disk: { totalBytes: number; availableBytes: number; usedPercent: number } | null;
  container: {
    scope: 'app' | 'server';
    memoryUsageBytes: number | null;
    memoryLimitBytes: number | null;
    memoryPercent: number | null;
    cpuLimitCores: number | null;
    cpuPercent: number | null;
  } | null;
};

export type OpsServerSnapshot = {
  environment: string;
  label: string;
  collectedAt: string;
  host: OpsHost;
  app: {
    pid: number;
    uptimeSeconds: number;
    nodeVersion: string;
    rssBytes: number;
    heapUsedBytes: number;
    heapTotalBytes: number;
    eventLoopLagMs: number | null;
    deployment: string | null;
  };
  processes: OpsProcess[];
  processSource: 'pm2' | 'docker' | null;
  processCollectedAt: string | null;
  lastDeploy: { tag: string; at: string } | null;
  history: OpsHistoryPoint[];
};

export type OpsServerView = {
  environment: string;
  label: string;
  source: 'live' | 'peer';
  reachable: boolean;
  stale: boolean;
  fetchedAt: string | null;
  error: string | null;
  status: OpsHealthLevel;
  alerts: string[];
  snapshot: OpsServerSnapshot | null;
};

export type OpsDependency = {
  name: 'mongodb' | 'redis' | 'loki';
  status: 'up' | 'down' | 'not_configured';
  latencyMs: number | null;
};

export type OpsServersResponse = {
  asOf: string;
  hostFeedConfigured: boolean;
  servers: OpsServerView[];
  dependencies: OpsDependency[];
};

export type OpsTrafficPoint = {
  at: string;
  requests: number;
  status2xx: number;
  status3xx: number;
  status4xx: number;
  status5xx: number;
  p95Ms: number | null;
};

export type OpsLevelPoint = { at: string; error: number; warn: number; info: number; other: number };

export type OpsRouteStat = {
  method: string;
  route: string;
  requests: number;
  errors5xx: number;
  errors4xx: number;
  p95Ms: number | null;
};

export type OpsTrafficResponse = {
  available: boolean;
  reason: string | null;
  from: string;
  to: string;
  stepSeconds: number;
  totals: {
    requests: number;
    status2xx: number;
    status3xx: number;
    status4xx: number;
    status5xx: number;
    p50Ms: number | null;
    p95Ms: number | null;
    p99Ms: number | null;
    errorLogs: number;
    warnLogs: number;
  };
  series: OpsTrafficPoint[];
  levels: OpsLevelPoint[];
  topRoutes: OpsRouteStat[];
  failingRoutes: OpsRouteStat[];
  slowRoutes: OpsRouteStat[];
};

export type OpsLogEntry = { timestamp: string; level: string; context: string; message: string; deployment: string };

export type OpsLogsResponse = { available: boolean; reason: string | null; entries: OpsLogEntry[] };

export type OpsLogLevel = 'error' | 'warn' | 'info' | 'all';

export type OpsSentryFrame = {
  filename: string | null;
  function: string | null;
  lineNo: number | null;
  colNo: number | null;
  inApp: boolean;
};

export type OpsSentryIssue = {
  id: string;
  shortId: string;
  title: string;
  culprit: string | null;
  level: string;
  status: string;
  count: number;
  userCount: number;
  firstSeen: string | null;
  lastSeen: string | null;
  permalink: string | null;
  isUnhandled: boolean;
  stats24h: number[];
  latestEvent: {
    eventId: string;
    receivedAt: string | null;
    release: string | null;
    url: string | null;
    browser: string | null;
    os: string | null;
    device: string | null;
    exceptionType: string | null;
    exceptionValue: string | null;
    frames: OpsSentryFrame[];
  } | null;
};

export type OpsSentryEnvironment = { environment: string; project: string; ok: boolean; issues: OpsSentryIssue[] };

export type OpsSentryResponse = {
  available: boolean;
  reason: string | null;
  collectedAt: string | null;
  stale: boolean;
  organization: string | null;
  environments: OpsSentryEnvironment[];
};
