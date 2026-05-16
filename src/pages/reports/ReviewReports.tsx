import { useEffect } from 'react';
import { Card } from 'antd';
import { WarningOutlined } from '@ant-design/icons';

import { useReviewReports } from '../../features/review/hooks/useReviewReports';
import { ReviewReportTable } from '../../features/review/ui/ReviewReportTable';
import { ReviewReportDetailModal } from '../../features/review/ui/ReviewReportDetailModal';

/**
 * 후기 신고 관리 페이지
 * 신고된 후기들을 조회하고 부적절한 후기를 삭제할 수 있습니다.
 */
const ReviewReports: React.FC = () => {
  const { reports, loading, pagination, onPageChange, fetchReports, handleDelete, detail } = useReviewReports();

  useEffect(() => { fetchReports(); }, [fetchReports]);

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--color-primary-500)' }}>
          후기 신고 관리
        </h1>
        <p className="text-sm sm:text-base text-gray-500">신고된 후기를 검토하고 관리합니다</p>
      </div>

      <Card className="mb-6" style={{ borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg" style={{ backgroundColor: 'var(--color-status-error-100)' }}>
            <WarningOutlined style={{ fontSize: '24px', color: 'var(--color-status-error-500)' }} />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500">신고된 후기</p>
            <p className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-status-error-500)' }}>{reports.length}건</p>
          </div>
        </div>
      </Card>

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
