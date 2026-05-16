import { useEffect } from 'react';
import { Card } from 'antd';
import { WarningOutlined } from '@ant-design/icons';

import { useBreederReports } from '../../features/breeder/hooks/useBreederReports';
import { BreederReportTable } from '../../features/breeder/ui/BreederReportTable';
import { BreederReportDetailModal } from '../../features/breeder/ui/BreederReportDetailModal';
import { BreederReportActionModal } from '../../features/breeder/ui/BreederReportActionModal';

/**
 * 브리더 신고 관리 페이지
 */
export default function BreederReports() {
  const { reports, loading, pagination, pendingCount, onPageChange, fetchReports, detail, action } = useBreederReports();

  useEffect(() => { fetchReports(); }, [fetchReports]);

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--color-primary-500)' }}>
          브리더 신고 관리
        </h1>
        <p className="text-sm sm:text-base text-gray-500">브리더에 대한 신고를 검토하고 처리합니다</p>
      </div>

      <Card className="mb-6" style={{ borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg" style={{ backgroundColor: 'var(--color-status-error-100)' }}>
            <WarningOutlined style={{ fontSize: '24px', color: 'var(--color-status-error-500)' }} />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500">처리 대기 중</p>
            <p className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-status-error-500)' }}>{pendingCount}건</p>
          </div>
        </div>
      </Card>

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
