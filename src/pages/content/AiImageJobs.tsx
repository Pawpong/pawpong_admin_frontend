import { Button, Card, Select, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

import { useAiImageJobs } from '../../features/ai-image/hooks/useAiImageJobs';
import { AiImageJobTable } from '../../features/ai-image/ui/AiImageJobTable';
import type { AiImageJobStatus } from '../../features/ai-image/api/aiImageApi';

const STATUS_OPTIONS: { value: AiImageJobStatus; label: string }[] = [
  { value: 'pending', label: '접수' },
  { value: 'queued', label: '대기' },
  { value: 'processing', label: '처리 중' },
  { value: 'succeeded', label: '성공' },
  { value: 'failed', label: '실패' },
];

/**
 * AI 생성 작업 모니터링 페이지.
 *
 * 결과 컨슈머는 오프셋 커밋이 막히는 것을 피하려 처리 실패 시 예외를 삼킨다.
 * 그래서 실패한 작업을 운영자가 확인할 수 있는 경로가 이 화면뿐이다.
 */
const AiImageJobs = () => {
  const { jobs, loading, pagination, statusFilter, onPageChange, handleStatusChange, refetch } = useAiImageJobs();

  return (
    <Card
      title="AI 생성 작업 모니터링"
      extra={
        <Space>
          <Select
            placeholder="상태 필터"
            allowClear
            style={{ width: 140 }}
            value={statusFilter}
            onChange={handleStatusChange}
            options={STATUS_OPTIONS}
          />
          <Button icon={<ReloadOutlined />} loading={loading} onClick={refetch}>
            새로고침
          </Button>
        </Space>
      }
    >
      <AiImageJobTable
        jobs={jobs}
        loading={loading}
        currentPage={pagination.currentPage}
        pageSize={pagination.pageSize}
        totalItems={pagination.totalItems}
        onPageChange={onPageChange}
      />
    </Card>
  );
};

export default AiImageJobs;
