import { Alert, Tag } from 'antd';
import type { OpsDependency, OpsServersResponse } from '../api/opsMonitoring.types';
import { ServerCard } from './ServerCard';

const DEPENDENCY_LABEL: Record<OpsDependency['name'], string> = {
  mongodb: 'MongoDB',
  redis: 'Redis',
  loki: '로그 저장소(Loki)',
};

function DependencyStrip({ dependencies }: { dependencies: OpsDependency[] }) {
  return (
    <div className="ops-dependencies" aria-label="이 API 서버의 연결 상태">
      <span className="muted">이 API 서버의 연결</span>
      {dependencies.map((dependency) => (
        <Tag
          key={dependency.name}
          color={dependency.status === 'up' ? 'green' : dependency.status === 'down' ? 'red' : 'default'}
        >
          {DEPENDENCY_LABEL[dependency.name]} ·{' '}
          {dependency.status === 'up'
            ? `정상 ${dependency.latencyMs ?? 0}ms`
            : dependency.status === 'down'
              ? '연결 실패'
              : '이 서버에 없음'}
        </Tag>
      ))}
    </div>
  );
}

export function ServersPanel({ data, now }: { data: OpsServersResponse; now: number }) {
  return (
    <div className="ops-panel">
      <DependencyStrip dependencies={data.dependencies} />
      {!data.hostFeedConfigured && (
        <Alert
          type="info"
          showIcon
          message="이 화면에는 이 API 서버만 보입니다"
          description="다른 서버 상태·도커 컨테이너·센트리 요약은 운영 호스트 모니터가 모아 운영 관리자 화면(admin.pawpong.kr)에 보여 줍니다."
        />
      )}
      <div className="ops-server-grid">
        {data.servers.map((server) => (
          <ServerCard key={`${server.source}-${server.environment}`} server={server} now={now} />
        ))}
      </div>
    </div>
  );
}
