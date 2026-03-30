import { Card } from 'antd';

import { useLevelChangeRequests } from '../../features/breeder/hooks/useLevelChangeRequests';
import { LevelChangeTable } from '../../features/breeder/ui/LevelChangeTable';
import { LevelChangeDetailModal, LevelChangeRejectModal } from '../../features/breeder/ui/LevelChangeModals';

/**
 * 레벨 변경 신청 관리 페이지
 */
export default function BreederLevelChangeRequests() {
  const { dataSource, loading, totalCount, currentPage, pageSize, selectedBreeder, onPageChange, handleViewDetails, handleApprove, handleRejectClick, detail, reject } = useLevelChangeRequests();

  return (
    <div className="p-3 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">레벨 변경 신청 관리</h1>

      <Card className="mb-6">
        <div className="text-center">
          <p className="text-xs sm:text-sm text-gray-500">총 레벨 변경 신청</p>
          <p className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-primary-500)' }}>{totalCount}건</p>
        </div>
      </Card>

      <LevelChangeTable dataSource={dataSource} loading={loading} currentPage={currentPage} pageSize={pageSize} totalCount={totalCount} onPageChange={onPageChange} onViewDetails={handleViewDetails} onApprove={handleApprove} onReject={handleRejectClick} />

      <LevelChangeDetailModal visible={detail.isOpen} breeder={selectedBreeder} onClose={detail.close} onApprove={handleApprove} onReject={handleRejectClick} />
      <LevelChangeRejectModal visible={reject.isOpen} breeder={selectedBreeder} form={reject.form} onOk={reject.submit} onCancel={reject.close} />
    </div>
  );
}
