import { Button, Select } from 'antd';
import { LoadError, PageHeading } from '../../shared/components/admin/PageHeading';
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
  const { jobs, loading, error, pagination, statusFilter, onPageChange, handleStatusChange, refetch } = useAiImageJobs();

  return (
    <div>
      <PageHeading
        title="AI 생성 작업 모니터링"
        description="사용자별 AI 이미지 생성 작업의 처리 상태, 원본·결과 이미지와 실패 사유를 확인합니다."
        action={
          <Button icon={<ReloadOutlined />} loading={loading} onClick={refetch}>
            새로고침
          </Button>
        }
      />
      <LoadError error={error} retry={refetch} />
      <div className="filter-bar">
        <span>처리 상태</span>
        <Select
          placeholder="전체 상태"
          allowClear
          className="filter-control"
          value={statusFilter}
          onChange={handleStatusChange}
          options={STATUS_OPTIONS}
        />
      </div>
      <AiImageJobTable
        jobs={jobs}
        loading={loading}
        currentPage={pagination.currentPage}
        pageSize={pagination.pageSize}
        totalItems={pagination.totalItems}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default AiImageJobs;
