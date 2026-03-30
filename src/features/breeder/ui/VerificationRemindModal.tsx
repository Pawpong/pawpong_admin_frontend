import { Modal } from 'antd';

interface Props {
  visible: boolean;
  selectedCount: number;
  onOk: () => void;
  onCancel: () => void;
}

export function VerificationRemindModal({ visible, selectedCount, onOk, onCancel }: Props) {
  return (
    <Modal title="입점 심사 독촉 알림 발송" open={visible} onOk={onOk} onCancel={onCancel} okText="발송" cancelText="취소" width="100%" style={{ maxWidth: '500px', top: 20 }} styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' } }}>
      <p className="mb-4 text-sm text-gray-600">선택한 {selectedCount}명의 브리더에게 입점 심사 독촉 알림을 발송합니다.</p>
      <div className="p-4 rounded mb-4" style={{ backgroundColor: '#fef3c7', borderLeft: '4px solid #f59e0b' }}>
        <p className="text-sm font-semibold mb-2" style={{ color: '#92400e' }}>발송 메시지</p>
        <p className="text-sm mb-2" style={{ color: '#78350f' }}><strong>서비스 알림:</strong> 브리더 입점 절차가 아직 완료되지 않았어요! 필요한 서류들을 제출하시면 입양자에게 프로필이 공개됩니다.</p>
        <p className="text-sm" style={{ color: '#78350f' }}><strong>이메일:</strong> [포퐁] 브리더 입점 절차를 완료해주세요</p>
      </div>
      <div className="p-3 rounded mb-3" style={{ backgroundColor: 'var(--color-tertiary-500)' }}>
        <p className="text-sm" style={{ color: 'var(--color-primary-500)' }}>서류 미제출 상태(PENDING)인 브리더에게만 발송됩니다.</p>
      </div>
    </Modal>
  );
}
