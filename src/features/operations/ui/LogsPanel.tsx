import { Alert, Card, Table, Tag } from 'antd';
import type { OpsLogEntry, OpsLogsResponse } from '../api/opsMonitoring.types';
import { formatDateTime } from '../model/opsFormat';

const LEVEL_TAG: Record<string, string> = { error: 'red', warn: 'orange', info: 'blue', debug: 'default' };

/** JSON 한 줄 로그는 읽기 좋게 펼친다 */
function prettyMessage(message: string): string {
  const trimmed = message.trim();
  if (!trimmed.startsWith('{')) return message;
  try {
    return JSON.stringify(JSON.parse(trimmed), null, 2);
  } catch {
    return message;
  }
}

/** 그라파나 Explore 대신 쓰는 운영 로그 목록 */
export function LogsPanel({ data }: { data: OpsLogsResponse }) {
  if (!data.available) {
    return <Alert type="info" showIcon message="운영 로그를 볼 수 없습니다" description={data.reason} />;
  }
  return (
    <Card className="ops-table-card">
      <Table<OpsLogEntry>
        size="small"
        rowKey={(entry) => `${entry.timestamp}-${entry.context}-${entry.message.slice(0, 40)}`}
        dataSource={data.entries}
        pagination={{ pageSize: 50, showSizeChanger: false }}
        scroll={{ x: 900 }}
        locale={{ emptyText: '조건에 맞는 로그가 없습니다' }}
        expandable={{
          expandedRowRender: (entry) => <pre className="ops-log-message">{prettyMessage(entry.message)}</pre>,
          expandRowByClick: true,
        }}
        columns={[
          { title: '시각', dataIndex: 'timestamp', width: 130, render: (value: string) => formatDateTime(value) },
          {
            title: '레벨',
            dataIndex: 'level',
            width: 80,
            render: (level: string) => <Tag color={LEVEL_TAG[level] ?? 'default'}>{level}</Tag>,
          },
          {
            title: '위치',
            dataIndex: 'context',
            width: 200,
            render: (context: string, entry) => (
              <span className="ops-log-context">
                <code className="ops-code">{context || '—'}</code>
                {entry.deployment && <span className="muted">{entry.deployment}</span>}
              </span>
            ),
          },
          {
            title: '내용',
            dataIndex: 'message',
            render: (message: string) => <span className="ops-log-preview">{message}</span>,
          },
        ]}
      />
    </Card>
  );
}
