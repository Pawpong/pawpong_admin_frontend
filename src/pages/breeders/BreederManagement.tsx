import { Button } from 'antd';
import { BellOutlined } from '@ant-design/icons';

import { useBreederManagement } from '../../features/breeder/hooks/useBreederManagement';
import { ManagementStats } from '../../features/breeder/ui/ManagementStats';
import { ManagementTable } from '../../features/breeder/ui/ManagementTable';
import {
  ManagementDetailModal,
  SuspendModal,
  UnsuspendModal,
  ProfileRemindModal,
} from '../../features/breeder/ui/ManagementModals';

/**
 * 브리더 관리 페이지
 * 인증이 승인된 브리더의 계정과 노출 상태를 관리합니다.
 */
export default function BreederManagement() {
  const {
    dataSource,
    loading,
    total,
    currentPage,
    pageSize,
    stats,
    selectedBreeders,
    setSelectedBreeders,
    selectedBreeder,
    onPageChange,
    handleViewDetails,
    handleSuspendClick,
    handleUnsuspendClick,
    handleTestAccountToggle,
    detail,
    suspend,
    unsuspend,
    remind,
  } = useBreederManagement();

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--color-primary-500)' }}>
          브리더 관리
        </h1>
        <p className="text-sm sm:text-base text-gray-500">
          인증이 승인된 브리더의 계정과 서비스 노출 상태를 관리합니다
        </p>
      </div>

      <ManagementStats stats={stats} />

      <div className="mb-4 flex justify-end">
        <Button
          icon={<BellOutlined />}
          onClick={remind.click}
          disabled={selectedBreeders.length === 0}
          style={
            selectedBreeders.length > 0
              ? { backgroundColor: 'var(--color-primary-500)', color: '#fff', borderColor: 'var(--color-primary-500)' }
              : {}
          }
        >
          프로필 완성 독려 알림 ({selectedBreeders.length})
        </Button>
      </div>

      <ManagementTable
        dataSource={dataSource}
        loading={loading}
        currentPage={currentPage}
        pageSize={pageSize}
        total={total}
        selectedBreeders={selectedBreeders}
        onSelectChange={setSelectedBreeders}
        onPageChange={onPageChange}
        onViewDetails={handleViewDetails}
        onSuspend={handleSuspendClick}
        onUnsuspend={handleUnsuspendClick}
        onTestAccountToggle={handleTestAccountToggle}
      />

      <ManagementDetailModal visible={detail.isDetailModalOpen} breeder={selectedBreeder} onClose={detail.close} />
      <SuspendModal visible={suspend.isOpen} form={suspend.form} onOk={suspend.submit} onCancel={suspend.close} />
      <UnsuspendModal
        visible={unsuspend.isOpen}
        breeder={selectedBreeder}
        onOk={unsuspend.submit}
        onCancel={unsuspend.close}
      />
      <ProfileRemindModal
        visible={remind.isOpen}
        count={selectedBreeders.length}
        onOk={remind.submit}
        onCancel={remind.close}
      />
    </div>
  );
}
