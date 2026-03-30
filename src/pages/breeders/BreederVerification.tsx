import { Card, Tabs, Button } from 'antd';
import { FileTextOutlined, BellOutlined } from '@ant-design/icons';

import { useBreederVerification } from '../../features/breeder/hooks/useBreederVerification';
import { VerificationTable } from '../../features/breeder/ui/VerificationTable';
import { VerificationDetailModal } from '../../features/breeder/ui/VerificationDetailModal';
import { VerificationRejectModal } from '../../features/breeder/ui/VerificationRejectModal';
import { VerificationRemindModal } from '../../features/breeder/ui/VerificationRemindModal';

/**
 * 브리더 신청 관리 페이지
 * 브리더 입점 신청을 검토하고 승인/반려 처리합니다.
 */
export default function BreederVerification() {
  const {
    dataSource, loading, totalCount, currentPage, pageSize, statusFilter,
    selectedBreeders, setSelectedBreeders, onStatusFilterChange, onPageChange,
    handleViewDetails, handleMarkAsReviewing, handleApprove,
    detail, reject, remind,
  } = useBreederVerification();

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--color-primary-500)' }}>브리더 신청 관리</h1>
        <p className="text-sm sm:text-base text-gray-500">브리더 입점 신청을 검토하고 승인/반려 처리합니다</p>
      </div>

      <Card className="mb-4 sm:mb-6" style={{ borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg" style={{ backgroundColor: 'var(--color-tertiary-500)' }}>
            <FileTextOutlined style={{ fontSize: '20px', color: 'var(--color-primary-500)' }} />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500">총 브리더</p>
            <p className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-primary-500)' }}>{totalCount}명</p>
          </div>
        </div>
      </Card>

      <Tabs activeKey={statusFilter || 'all'} onChange={onStatusFilterChange} className="mb-4"
        items={[{ key: 'all', label: '전체' }, { key: 'pending', label: '대기 중 (서류 미제출)' }, { key: 'reviewing', label: '검토 중' }, { key: 'approved', label: '승인됨' }, { key: 'rejected', label: '반려됨' }]} />

      <div className="mb-4 flex justify-end">
        <Button icon={<BellOutlined />} onClick={remind.handleDocumentRemindClick} disabled={selectedBreeders.length === 0}
          style={selectedBreeders.length > 0 ? { backgroundColor: '#f59e0b', color: '#fff', borderColor: '#f59e0b' } : {}}>
          입점 심사 독촉 알림 ({selectedBreeders.length})
        </Button>
      </div>

      <VerificationTable
        dataSource={dataSource} loading={loading} currentPage={currentPage} pageSize={pageSize} totalCount={totalCount}
        selectedBreeders={selectedBreeders} onSelectChange={setSelectedBreeders} onPageChange={onPageChange}
        onViewDetails={handleViewDetails} onMarkAsReviewing={handleMarkAsReviewing} onApprove={handleApprove} onReject={reject.openRejectModal} />

      <VerificationDetailModal visible={detail.isDetailModalOpen} breeder={detail.selectedBreeder} onClose={detail.closeDetail}
        onMarkAsReviewing={handleMarkAsReviewing} onApprove={handleApprove} onReject={reject.openRejectModal} />

      <VerificationRejectModal visible={reject.isRejectModalOpen} breeder={reject.selectedBreeder} form={reject.rejectForm}
        onOk={reject.handleRejectSubmit} onCancel={reject.closeReject} />

      <VerificationRemindModal visible={remind.isDocumentRemindModalOpen} selectedCount={remind.selectedCount}
        onOk={remind.handleDocumentRemindSubmit} onCancel={remind.closeRemind} />
    </div>
  );
}
