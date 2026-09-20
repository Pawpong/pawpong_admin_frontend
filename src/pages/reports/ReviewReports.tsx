import { useEffect } from 'react';
import { LoadError, Metric, PageHeading } from '../../shared/components/admin/PageHeading';

import { useReviewReports } from '../../features/review/hooks/useReviewReports';
import { ReviewReportTable } from '../../features/review/ui/ReviewReportTable';
import { ReviewReportDetailModal } from '../../features/review/ui/ReviewReportDetailModal';

/**
 * 후기 신고 관리 페이지
 * 신고된 후기들을 조회하고 부적절한 후기를 삭제할 수 있습니다.
 */
const ReviewReports: React.FC = () => {
  const { reports, loading, loadError, pagination, onPageChange, fetchReports, handleDelete, detail } = useReviewReports();

  useEffect(() => { fetchReports(); }, [fetchReports]);

  return (
    <div>
      <PageHeading
        title="후기 신고 관리"
        description="신고된 후기의 작성자, 신고자, 신고 사유를 확인하고 후기 공개 여부를 결정합니다."
      />
      <LoadError error={loadError} retry={fetchReports} />
      <div className="metric-grid metric-grid-single">
        <Metric label="조회된 신고" value={`${reports.length.toLocaleString()}건`} />
      </div>
      <ReviewReportTable
        reports={reports} loading={loading} pagination={pagination}
        onPageChange={onPageChange} onView={detail.openDetail} onDelete={handleDelete}
      />

      <ReviewReportDetailModal
        visible={detail.detailVisible} report={detail.selectedReport}
        onClose={detail.closeDetail} onDelete={handleDelete}
      />
    </div>
  );
};

export default ReviewReports;
