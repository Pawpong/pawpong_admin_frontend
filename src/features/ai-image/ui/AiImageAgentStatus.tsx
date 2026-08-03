import { Alert, Button, Descriptions, Space, Tag } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

import type { AiImageAgentHealth } from '../api/aiImageApi';

interface AiImageAgentStatusProps {
  health: AiImageAgentHealth | null;
  loading: boolean;
  onRefresh: () => void;
}

const STATUS_META = {
  SERVING: { color: 'success', label: '정상' },
  DEGRADED: { color: 'warning', label: '일부 기능 불가' },
  UNREACHABLE: { color: 'error', label: '연결 불가' },
} as const;

/** 상태별로 관리자가 지금 무엇을 할 수 있는지 알려준다 */
function describeStatus(health: AiImageAgentHealth): { type: 'success' | 'warning' | 'error'; message: string } {
  if (health.status === 'UNREACHABLE') {
    return {
      type: 'error',
      message: 'AI Agent에 연결할 수 없습니다. 미리보기를 사용할 수 없고, 사용자 생성 요청은 큐에 쌓입니다.',
    };
  }

  if (!health.openaiConfigured) {
    return { type: 'warning', message: 'OpenAI 키가 설정되지 않았습니다. 이미지 생성이 즉시 실패합니다.' };
  }

  if (!health.kafkaConnected) {
    return {
      type: 'warning',
      message: 'Kafka에 연결되지 않았습니다. 미리보기는 되지만 사용자 생성 요청은 즉시 실패로 처리됩니다.',
    };
  }

  return { type: 'success', message: 'AI Agent가 정상 동작 중입니다. 미리보기와 사용자 생성 모두 가능합니다.' };
}

/**
 * AI Agent 가동 상태 패널.
 *
 * 미리보기는 OpenAI 왕복 때문에 최대 120초가 걸린다.
 * 눌러놓고 기다리다 실패를 확인하는 일이 없도록 상태를 화면 위에 항상 띄운다.
 */
export function AiImageAgentStatus({ health, loading, onRefresh }: AiImageAgentStatusProps) {
  if (!health) {
    return <Alert type="info" message="AI Agent 상태를 확인하는 중입니다..." showIcon />;
  }

  const meta = STATUS_META[health.status];
  const description = describeStatus(health);

  return (
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      <Alert
        type={description.type}
        showIcon
        message={
          <Space>
            <span>AI Agent</span>
            <Tag color={meta.color}>{meta.label}</Tag>
          </Space>
        }
        description={
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <span>{description.message}</span>
            {health.isReachable && (
              <Descriptions size="small" column={{ xs: 1, sm: 2, md: 4 }} style={{ marginTop: 8 }}>
                <Descriptions.Item label="버전">{health.version ?? '-'}</Descriptions.Item>
                <Descriptions.Item label="처리 중">{health.inFlightJobs}건</Descriptions.Item>
                <Descriptions.Item label="Kafka">{health.kafkaConnected ? '연결됨' : '끊김'}</Descriptions.Item>
                <Descriptions.Item label="OpenAI 키">
                  {health.openaiConfigured ? '설정됨' : '없음'}
                </Descriptions.Item>
              </Descriptions>
            )}
            {health.errorMessage && (
              <span style={{ color: 'var(--color-grayscale-gray5)' }}>사유: {health.errorMessage}</span>
            )}
          </Space>
        }
        action={
          <Button size="small" icon={<ReloadOutlined />} loading={loading} onClick={onRefresh}>
            새로고침
          </Button>
        }
      />
    </Space>
  );
}
