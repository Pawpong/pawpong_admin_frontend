import { useEffect } from 'react';
import { LoadError, Metric, PageHeading } from '../../shared/components/admin/PageHeading';

import { useBreederReports } from '../../features/breeder/hooks/useBreederReports';
import { BreederReportTable } from '../../features/breeder/ui/BreederReportTable';
import { BreederReportDetailModal } from '../../features/breeder/ui/BreederReportDetailModal';
import { BreederReportActionModal } from '../../features/breeder/ui/BreederReportActionModal';

/**
 * 브리더 신고 관리 페이지
 */
export default function BreederReports() {
  const { reports, loading, loadError, pagination, pendingCount, onPageChange, fetchReports, detail, action } = useBreederReports();

  useEffect(() => { fetchReports(); }, [fetchReports]);

  return (
    <div>
      <PageHeading
        title="브리더 신고 관리"
        description="브리더에 대한 신고의 대상, 사유, 신고일과 처리 상태를 확인하고 조치합니다."
      />
      <LoadError error={loadError} retry={fetchReports} />
      <div className="metric-grid metric-grid-single">
        <Metric label="처리 대기 중" value={`${pendingCount.toLocaleString()}건`} />
      </div>
      <BreederReportTable
        reports={reports} loading={loading} pagination={pagination}
        onPageChange={onPageChange} onView={detail.openDetail} onAction={action.openAction}
      />

      <BreederReportDetailModal
        visible={detail.detailVisible} report={detail.selectedReport}
        onClose={detail.closeDetail} onAction={action.openAction}
      />

      <BreederReportActionModal
        visible={action.actionVisible} actionType={action.actionType}
        adminNotes={action.adminNotes} onAdminNotesChange={action.setAdminNotes}
        onSubmit={action.handleActionSubmit} onCancel={action.closeAction}
      />
    </div>
  );
}
