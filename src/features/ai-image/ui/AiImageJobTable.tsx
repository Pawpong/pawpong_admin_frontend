import { Image, Space, Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import type { AiImageJob, AiImageJobStatus } from '../api/aiImageApi';

const IMAGE_FALLBACK =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const STATUS_META: Record<AiImageJobStatus, { color: string; label: string }> = {
  pending: { color: 'default', label: '접수' },
  queued: { color: 'processing', label: '대기' },
  processing: { color: 'processing', label: '처리 중' },
  succeeded: { color: 'success', label: '성공' },
  failed: { color: 'error', label: '실패' },
};

/** 실패 코드를 운영자가 바로 판단할 수 있는 문장으로 바꾼다 */
const ERROR_DESCRIPTIONS: Record<string, string> = {
  QUEUE_UNAVAILABLE: 'Kafka 미연결로 큐에 싣지 못했습니다 (재시도 안 함)',
  INPUT_TOO_LARGE: '원본이 크기 상한을 넘었습니다 (재시도 안 함)',
  INPUT_DOWNLOAD_FAILED: '원본을 내려받지 못했습니다 (재시도 대상)',
  OPENAI_NOT_CONFIGURED: 'OpenAI 키가 설정되지 않았습니다 (재시도 안 함)',
  OPENAI_CALL_FAILED: 'OpenAI 호출이 실패했습니다 — 레이트리밋 가능성 (재시도 대상)',
  OPENAI_EMPTY_RESPONSE: '응답에 이미지가 없었습니다 (재시도 대상)',
  OUTPUT_UPLOAD_FAILED: '결과 업로드에 실패했습니다 (재시도 대상)',
};

interface AiImageJobTableProps {
  jobs: AiImageJob[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number, pageSize: number) => void;
}

/** AI 생성 작업 모니터링 테이블 */
export function AiImageJobTable({
  jobs,
  loading,
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
}: AiImageJobTableProps) {
  const columns: ColumnsType<AiImageJob> = [
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: AiImageJobStatus, job) => (
        <Space direction="vertical" size={0}>
          <Tag color={STATUS_META[status]?.color}>{STATUS_META[status]?.label ?? status}</Tag>
          {job.attempt > 1 && (
            <span style={{ fontSize: 12, color: 'var(--color-grayscale-gray5)' }}>{job.attempt}회 시도</span>
          )}
        </Space>
      ),
    },
    {
      title: '원본 / 결과',
      key: 'images',
      width: 180,
      render: (_, job) => (
        <Space>
          <Image
            src={job.inputImageUrl || undefined}
            alt="원본"
            width={64}
            height={64}
            style={{ objectFit: 'cover', borderRadius: 6 }}
            fallback={IMAGE_FALLBACK}
          />
          {job.outputImageUrl ? (
            <Image
              src={job.outputImageUrl || undefined}
              alt="결과"
              width={64}
              height={64}
              style={{ objectFit: 'cover', borderRadius: 6 }}
              fallback={IMAGE_FALLBACK}
            />
          ) : (
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 6,
                background: 'var(--color-grayscale-gray1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                color: 'var(--color-grayscale-gray5)',
              }}
            >
              결과 없음
            </div>
          )}
        </Space>
      ),
    },
    {
      title: '실패 사유',
      dataIndex: 'errorCode',
      key: 'errorCode',
      width: 200,
      render: (errorCode: string | null) =>
        errorCode ? (
          <Tooltip title={ERROR_DESCRIPTIONS[errorCode] ?? '정의되지 않은 오류 코드'}>
            <Tag color="error" style={{ fontFamily: 'monospace' }}>
              {errorCode}
            </Tag>
          </Tooltip>
        ) : (
          <span style={{ color: 'var(--color-grayscale-gray5)' }}>-</span>
        ),
    },
    {
      title: '사용자',
      dataIndex: 'userId',
      key: 'userId',
      width: 200,
      render: (userId: string, job) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{userId}</span>
          <Tag>{job.userRole === 'adopter' ? '입양자' : '브리더'}</Tag>
        </Space>
      ),
    },
    {
      title: '사용 프롬프트 (생성 시점)',
      dataIndex: 'promptSnapshot',
      key: 'promptSnapshot',
      ellipsis: true,
      render: (prompt: string, job) => (
        <Tooltip title={prompt} styles={{ root: { maxWidth: 480 } }}>
          <Space direction="vertical" size={0}>
            <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{prompt}</span>
            <span style={{ fontSize: 12, color: 'var(--color-grayscale-gray5)' }}>
              {job.modelSnapshot} · {job.outputSizeSnapshot}
            </span>
          </Space>
        </Tooltip>
      ),
    },
    {
      title: '요청 / 종료',
      key: 'timestamps',
      width: 180,
      render: (_, job) => (
        <Space direction="vertical" size={0} style={{ fontSize: 12 }}>
          <span>{new Date(job.createdAt).toLocaleString('ko-KR')}</span>
          <span style={{ color: 'var(--color-grayscale-gray5)' }}>
            {job.completedAt ? new Date(job.completedAt).toLocaleString('ko-KR') : '진행 중'}
          </span>
        </Space>
      ),
    },
  ];

  return (
    <Table
      rowKey="jobId"
      columns={columns}
      dataSource={jobs}
      loading={loading}
      scroll={{ x: 1200 }}
      pagination={{
        current: currentPage,
        pageSize,
        total: totalItems,
        showSizeChanger: true,
        showTotal: (total) => `총 ${total}건`,
        onChange: onPageChange,
      }}
    />
  );
}
