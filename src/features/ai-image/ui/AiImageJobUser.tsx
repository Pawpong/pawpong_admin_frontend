import { Space, Tag, Typography } from 'antd';

import type { AiImageJob } from '../api/aiImageApi';

const ACCOUNT_STATUS: Record<string, { label: string; color?: string }> = {
  suspended: { label: '이용 정지', color: 'warning' },
  deleted: { label: '탈퇴', color: 'default' },
  missing: { label: '계정 정보 없음', color: 'default' },
  unknown: { label: '상태 미확인', color: 'default' },
};

const ROLE_LABELS: Record<string, string> = { adopter: '입양자', breeder: '브리더' };

/** 이름·계정으로 식별하고 ID는 필요할 때 펼쳐 확인·복사한다. */
export function AiImageJobUser({ job }: { job: AiImageJob }) {
  const user = job.user;
  const isDeleted = user?.accountStatus === 'deleted';
  const isMissing = user?.accountStatus === 'missing';
  const canIdentify = Boolean(user) && !isDeleted && !isMissing;
  const nickname = canIdentify ? user?.nickname?.trim() : null;
  const displayName = canIdentify ? user?.displayName?.trim() || nickname || '이름 미등록' : null;
  const name = isDeleted ? '탈퇴한 사용자' : isMissing ? '사용자를 찾을 수 없음' : displayName || '사용자 정보 미제공';
  const status = user ? ACCOUNT_STATUS[user.accountStatus] : undefined;

  return (
    <Space direction="vertical" size={2} style={{ width: '100%', overflowWrap: 'anywhere' }}>
      <span style={{ fontWeight: 600 }}>{name}</span>
      {nickname && nickname !== displayName ? (
        <span style={{ fontSize: 12, color: 'var(--color-grayscale-gray5)' }}>닉네임: {nickname}</span>
      ) : null}
      <span style={{ fontSize: 12, color: 'var(--color-grayscale-gray5)' }}>
        {canIdentify ? user?.emailAddress?.trim() || '이메일 미등록' : '계정 정보 없음'}
      </span>
      <Space size={4} wrap>
        <Tag>{ROLE_LABELS[job.userRole] ?? '역할 미확인'}</Tag>
        {status ? <Tag color={status.color}>{status.label}</Tag> : null}
      </Space>
      <details style={{ fontSize: 12, color: 'var(--color-grayscale-gray5)' }}>
        <summary style={{ cursor: 'pointer' }}>사용자 ID</summary>
        <Typography.Text style={{ fontFamily: 'monospace', fontSize: 12 }} copyable={{ text: job.userId }}>
          {job.userId || 'ID 없음'}
        </Typography.Text>
      </details>
    </Space>
  );
}
