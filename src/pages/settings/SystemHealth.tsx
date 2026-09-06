import { useCallback, useState } from 'react';
import { Card, Select, Space, Table, Tag, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { operationsApi } from '../../features/operations/api/operationsApi';
import { useRemoteData } from '../../shared/hooks/useRemoteData';
import { LoadError, Metric, PageHeading } from '../../shared/components/admin/PageHeading';

export default function SystemHealth() {
  const [hours, setHours] = useState(24);
  const state = useRemoteData(useCallback(() => operationsApi.getSystemHealth(hours), [hours]));
  return (
    <div className="system-health-page">
      <PageHeading
        title="시스템 상태"
        description="서버 로그를 기준으로 서비스 상태와 최근 운영 이슈를 확인하세요."
        action={
          <Space wrap>
            <Select
              aria-label="조회 기간"
              value={hours}
              onChange={setHours}
              options={[
                { value: 1, label: '최근 1시간' },
                { value: 24, label: '최근 24시간' },
                { value: 168, label: '최근 7일' },
              ]}
            />
            <Button icon={<ReloadOutlined />} onClick={state.reload}>
              새로고침
            </Button>
          </Space>
        }
      />
      <LoadError error={state.error} retry={state.reload} />
      <div className="metric-grid">
        <Metric
          label="전체 상태"
          value={
            state.data
              ? { healthy: '정상', warning: '확인 필요', critical: '장애 발생' }[state.data.overallStatus]
              : '—'
          }
        />
        <Metric label="심각한 이슈" value={state.data?.summary.critical ?? '—'} />
        <Metric label="주의 이슈" value={state.data?.summary.warning ?? '—'} />
        <Metric label="정보성 이슈" value={state.data?.summary.info ?? '—'} />
      </div>
      <div className="service-grid" aria-label="서비스별 로그 상태">
        {state.data &&
          Object.entries(state.data.services).map(([name, service]) => (
            <Card key={name} title={{ api: 'API 서버', redis: '캐시 서버', kafka: '채팅 서버' }[name] || name}>
              <Tag color={{ healthy: 'green', warning: 'orange', error: 'red', unknown: 'default' }[service.status]}>
                {{ healthy: '정상', warning: '주의', error: '오류', unknown: '확인 불가' }[service.status]}
              </Tag>
              {service.lastErrorAt && (
                <p className="muted service-last-error">
                  최근 오류 · {new Date(service.lastErrorAt).toLocaleString('ko-KR')}
                </p>
              )}
            </Card>
          ))}
      </div>
      <Card title="최근 운영 이슈" className="health-issues-card">
        <div className="health-issues-context">
          <p className="muted">
            로그 기반 집계이며 실시간 연결 검사 결과가 아닙니다. ‘최근 재발 없음’은 30분 이상 오류가 다시 기록되지
            않았다는 뜻으로, 실제 복구 확인과 다를 수 있습니다.
          </p>
          {state.data && <p className="muted">조회 기준 · {new Date(state.data.asOf).toLocaleString('ko-KR')}</p>}
        </div>
        <Table
          loading={state.loading}
          rowKey={(row) => `${row.category}-${row.title}-${row.firstAt}`}
          dataSource={state.data?.issueGroups}
          scroll={{ x: 900 }}
          columns={[
            {
              title: '심각도',
              width: 96,
              dataIndex: 'severity',
              render: (value) => (
                <Tag color={value === 'critical' ? 'red' : value === 'warning' ? 'orange' : 'blue'}>
                  {{ critical: '심각', warning: '주의', info: '정보' }[value as 'critical' | 'warning' | 'info'] ||
                    value}
                </Tag>
              ),
            },
            {
              title: '이슈',
              dataIndex: 'title',
              render: (value, row) => (
                <div className="health-issue-description">
                  <strong>{value}</strong>
                  <p className="muted">{row.description}</p>
                </div>
              ),
            },
            { title: '발생 횟수', dataIndex: 'count', width: 100 },
            {
              title: '최근 발생',
              dataIndex: 'lastAt',
              width: 210,
              render: (value) => new Date(value).toLocaleString('ko-KR'),
            },
            {
              title: '재발 상태',
              dataIndex: 'isResolved',
              width: 140,
              render: (value) => (value ? '최근 재발 없음' : '확인 필요'),
            },
          ]}
        />
      </Card>
    </div>
  );
}
