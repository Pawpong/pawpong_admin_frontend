import { AlimtalkPreviewByCode } from '../../features/alimtalk/ui/AlimtalkPreview';
import type { BreederVerification as BreederRecord } from '../../shared/types/api.types';
import { BreederSearchBar } from '../../features/breeder/ui/BreederSearchBar';
import { LoadError, Metric, PageHeading } from '../../shared/components/admin/PageHeading';
import { useState } from 'react';
import { operationsApi } from '../../features/operations/api/operationsApi';
import { App, Tabs, Button, Popconfirm, Modal, Alert } from 'antd';
import { BellOutlined } from '@ant-design/icons';

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
  const { message } = App.useApp();
  const [approvalTarget, setApprovalTarget] = useState<BreederRecord | null>(null);
  const [sendingReminders, setSendingReminders] = useState(false);
  const {
    processing,
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
    totalCount,
    currentPage,
    pageSize,
    statusFilter,
    selectedBreeders,
    setSelectedBreeders,
    onStatusFilterChange,
    onPageChange,
    handleViewDetails,
    handleMarkAsReviewing,
    handleApprove,
    detail,
    reject,
    remind,
  } = useBreederVerification();

  return (
    <div>
      <PageHeading
        title="브리더 신청 관리"
        description="브리더 입점 신청의 연락처, 요금제, 신청일과 심사 상태를 확인하고 승인·반려를 처리합니다."
      />
      <LoadError error={error} retry={refetch} />
      <div className="metric-grid metric-grid-single">
        <Metric label="전체 신청 브리더" value={`${totalCount.toLocaleString()}명`} />
      </div>

      <BreederSearchBar
        searchKeyword={searchKeyword}
        cityName={cityName}
        accountType={accountType}
        onSearch={onSearch}
        onReset={onReset}
        onAccountTypeChange={onAccountTypeChange}
        onRefresh={refetch}
      />
      <Tabs
        activeKey={statusFilter || 'all'}
        onChange={onStatusFilterChange}
        className="mb-4"
        items={[
          { key: 'all', label: '전체' },
          { key: 'pending', label: '대기 중 (서류 미제출)' },
          { key: 'reviewing', label: '검토 중' },
          { key: 'approved', label: '승인됨' },
          { key: 'rejected', label: '반려됨' },
        ]}
      />

      <div className="bulk-action-bar">
        <Popconfirm
          title="서류 미제출 대상자에게 일괄 독촉 알림을 보낼까요?"
          description="서버가 발송 대상자를 선정합니다."
          okText="발송"
          cancelText="취소"
          onConfirm={async () => {
            setSendingReminders(true);
            try {
              const result = await operationsApi.sendDocumentReminders();
              message.success(`${result.sentCount}명에게 발송했습니다.`);
            } catch {
              message.error('일괄 독촉 발송에 실패했습니다.');
            } finally {
              setSendingReminders(false);
            }
          }}
        >
          <Button loading={sendingReminders}>미제출 대상자 일괄 독촉</Button>
        </Popconfirm>
        <Button
          icon={<BellOutlined />}
          onClick={remind.handleDocumentRemindClick}
          disabled={selectedBreeders.length === 0}
          type={selectedBreeders.length > 0 ? 'primary' : 'default'}
        >
          입점 심사 독촉 알림 ({selectedBreeders.length})
        </Button>
      </div>

      <VerificationTable
        processing={processing}
        dataSource={dataSource}
        loading={loading}
        currentPage={currentPage}
        pageSize={pageSize}
        totalCount={totalCount}
        selectedBreeders={selectedBreeders}
        onSelectChange={setSelectedBreeders}
        onPageChange={onPageChange}
        onViewDetails={handleViewDetails}
        onMarkAsReviewing={handleMarkAsReviewing}
        onApprove={(id) => {
          const record =
            detail.selectedBreeder?.breederId === id
              ? detail.selectedBreeder
              : dataSource.find((row) => row.breederId === id);
          if (record) setApprovalTarget(record);
        }}
        onReject={reject.openRejectModal}
      />

      <VerificationDetailModal
        processing={processing}
        visible={detail.isDetailModalOpen}
        breeder={detail.selectedBreeder}
        onClose={detail.closeDetail}
        onRefresh={() => {
          if (detail.selectedBreeder) void handleViewDetails(detail.selectedBreeder);
        }}
        onMarkAsReviewing={handleMarkAsReviewing}
        onApprove={(id) => {
          const record =
            detail.selectedBreeder?.breederId === id
              ? detail.selectedBreeder
              : dataSource.find((row) => row.breederId === id);
          if (record) setApprovalTarget(record);
        }}
        onReject={reject.openRejectModal}
      />

      <Modal
        title="승인 전 알림 확인"
        open={!!approvalTarget}
        width={720}
        confirmLoading={processing}
        okText="확인 후 승인"
        cancelText="취소"
        closable={!processing}
        maskClosable={!processing}
        cancelButtonProps={{ disabled: processing }}
        onCancel={() => setApprovalTarget(null)}
        onOk={async () => {
          if (approvalTarget) {
            await handleApprove(approvalTarget.breederId);
            setApprovalTarget(null);
          }
        }}
      >
        {approvalTarget && (
          <div className="approval-preview">
            <p>
              <strong>{approvalTarget.breederName}</strong> · {approvalTarget.emailAddress}
            </p>
            <Alert
              type="info"
              showIcon
              message="승인 시 서비스 알림·이메일·푸시 처리 흐름이 실행됩니다."
              description="알림톡 템플릿 등록 여부만으로 실제 발송 연동을 보장하지 않습니다. 아래 미리보기 값은 승인 요청에 포함되지 않습니다."
            />
            <AlimtalkPreviewByCode code="BREEDER_APPROVED" />
          </div>
        )}
      </Modal>

      <VerificationRejectModal
        processing={processing}
        visible={reject.isRejectModalOpen}
        form={reject.rejectForm}
        onOk={reject.handleRejectSubmit}
        onCancel={reject.closeReject}
      />

      <VerificationRemindModal
        visible={remind.isDocumentRemindModalOpen}
        selectedCount={remind.selectedCount}
        onOk={remind.handleDocumentRemindSubmit}
        onCancel={remind.closeRemind}
      />
    </div>
  );
}
