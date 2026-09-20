import { BreederSearchBar } from '../../features/breeder/ui/BreederSearchBar';
import { LoadError, PageHeading } from '../../shared/components/admin/PageHeading';
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
    searchKeyword,
    cityName,
    onSearch,
    onReset,
    error,
    refetch,
    accountType,
    onAccountTypeChange,
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
    <div>
      <PageHeading
        title="브리더 관리"
        description="승인된 브리더의 연락처, 승인일, 계정 상태를 조회하고 정지·해제와 프로필 완성 독려를 처리합니다."
      />
      <LoadError error={error} retry={refetch} />
      <BreederSearchBar
        searchKeyword={searchKeyword}
        cityName={cityName}
        accountType={accountType}
        onSearch={onSearch}
        onReset={onReset}
        onAccountTypeChange={onAccountTypeChange}
        onRefresh={refetch}
      />
      {stats && <ManagementStats stats={stats} />}

      <div className="bulk-action-bar">
        <Button
          type={selectedBreeders.length > 0 ? 'primary' : 'default'}
          icon={<BellOutlined />}
          onClick={remind.click}
          disabled={selectedBreeders.length === 0}
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
      <SuspendModal
        visible={suspend.isOpen}
        form={suspend.form}
        submitting={suspend.submitting}
        onOk={suspend.submit}
        onCancel={suspend.close}
      />
      <UnsuspendModal
        visible={unsuspend.isOpen}
        breeder={selectedBreeder}
        submitting={unsuspend.submitting}
        onOk={unsuspend.submit}
        onCancel={unsuspend.close}
      />
      <ProfileRemindModal
        visible={remind.isOpen}
        count={selectedBreeders.length}
        submitting={remind.submitting}
        onOk={remind.submit}
        onCancel={remind.close}
      />
    </div>
  );
}
