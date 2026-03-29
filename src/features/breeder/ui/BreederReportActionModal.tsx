import { Modal, Input } from 'antd';

const { TextArea } = Input;

interface BreederReportActionModalProps {
  visible: boolean;
  actionType: 'resolve' | 'reject';
  adminNotes: string;
  onAdminNotesChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function BreederReportActionModal({
  visible, actionType, adminNotes, onAdminNotesChange, onSubmit, onCancel,
}: BreederReportActionModalProps) {
  return (
    <Modal
      title={actionType === 'resolve' ? '신고 승인 (브리더 제재)' : '신고 반려'}
      open={visible}
      onOk={onSubmit}
      onCancel={onCancel}
      okText={actionType === 'resolve' ? '승인' : '반려'}
      okButtonProps={{ danger: actionType === 'resolve' }}
      cancelText="취소"
      width="100%"
      style={{ maxWidth: '500px', top: 20 }}
      styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' } }}
    >
      <div className="mb-4">
        <p className="mb-2">관리자 메모 (선택)</p>
        <TextArea
          rows={4}
          value={adminNotes}
          onChange={(e) => onAdminNotesChange(e.target.value)}
          placeholder="처리 사유나 메모를 입력하세요"
          maxLength={500}
          showCount
        />
      </div>

      {actionType === 'resolve' && (
        <div className="p-3 rounded mt-4" style={{ backgroundColor: 'var(--color-status-error-100)' }}>
          <p className="text-sm" style={{ color: 'var(--color-status-error-500)' }}>
            ⚠️ 신고 승인 시 해당 브리더는 제재됩니다. 신중하게 결정해주세요.
          </p>
        </div>
      )}
    </Modal>
  );
}
