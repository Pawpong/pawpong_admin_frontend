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
    <div>
      <PageHeading
        title="시스템 상태"
        description="서비스 연결 상태와 최근 발생한 운영 이슈를 확인하세요."
        action={
          <Space>
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
      <div className="service-grid">
        {state.data &&
          Object.entries(state.data.services).map(([name, service]) => (
            <Card key={name} title={{ api: 'API 서버', redis: '캐시 서버', kafka: '채팅 서버' }[name] || name}>
              <Tag color={service.status === 'healthy' ? 'green' : 'orange'}>{service.status}</Tag>
              {service.lastErrorAt && (
                <p className="muted">최근 오류 · {new Date(service.lastErrorAt).toLocaleString('ko-KR')}</p>
              )}
            </Card>
          ))}
      </div>
      <Card title="최근 운영 이슈" className="mt-6">
        <Table
          loading={state.loading}
          rowKey={(row) => `${row.category}-${row.title}-${row.firstAt}`}
          dataSource={state.data?.issueGroups}
          scroll={{ x: 750 }}
          columns={[
            {
              title: '상태',
              dataIndex: 'severity',
              render: (value) => (
                <Tag color={value === 'critical' ? 'red' : value === 'warning' ? 'orange' : 'blue'}>{value}</Tag>
              ),
            },
            {
              title: '이슈',
              dataIndex: 'title',
              render: (value, row) => (
                <div>
                  <strong>{value}</strong>
                  <p className="muted">{row.description}</p>
                </div>
              ),
            },
            { title: '발생 횟수', dataIndex: 'count' },
            { title: '최근 발생', dataIndex: 'lastAt', render: (value) => new Date(value).toLocaleString('ko-KR') },
            { title: '해결 여부', dataIndex: 'isResolved', render: (value) => (value ? '해결됨' : '확인 필요') },
          ]}
        />
      </Card>
    </div>
  );
}
