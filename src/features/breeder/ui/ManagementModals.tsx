import { Modal, Descriptions, Form, Input, Button } from 'antd';
import type { FormInstance } from 'antd';

import type { BreederVerification } from '../../../shared/types/api.types';

const { TextArea } = Input;

const modalStyle = {
  width: '100%',
  style: { maxWidth: '500px', top: 20 } as const,
  styles: { body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' as const } },
};

/* 상세 보기 모달 */
export function ManagementDetailModal({
  visible,
  breeder,
  onClose,
}: {
  visible: boolean;
  breeder: BreederVerification | null;
  onClose: () => void;
}) {
  return (
    <Modal
      title="브리더 상세 정보"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          닫기
        </Button>,
      ]}
      {...modalStyle}
      style={{ maxWidth: '700px', top: 20 }}
    >
      {breeder && (
        <Descriptions bordered column={{ xs: 1, sm: 2 }}>
          <Descriptions.Item label="브리더명" span={2}>
            <strong>{breeder.breederName}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="이메일">{breeder.emailAddress}</Descriptions.Item>
          <Descriptions.Item label="전화번호">{breeder.phoneNumber || '-'}</Descriptions.Item>
          <Descriptions.Item label="인증 상태">승인됨</Descriptions.Item>
          <Descriptions.Item label="신청일" span={2}>
            {breeder.verificationInfo.submittedAt
              ? new Date(breeder.verificationInfo.submittedAt).toLocaleString('ko-KR')
              : '-'}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );
}

/* 계정 정지 모달 */
export function SuspendModal({
  visible,
  form,
  onOk,
  onCancel,
}: {
  visible: boolean;
  form: FormInstance;
  onOk: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      title="브리더 계정 정지"
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      okText="정지"
      okButtonProps={{ danger: true }}
      cancelText="취소"
      {...modalStyle}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="reason" label="정지 사유" rules={[{ required: true, message: '정지 사유를 입력해주세요' }]}>
          <TextArea
            rows={4}
            placeholder="정지 사유를 입력해주세요 (브리더에게 이메일로 발송됩니다)"
            maxLength={1000}
            showCount
          />
        </Form.Item>
        <div className="p-3 rounded mt-4" style={{ backgroundColor: 'var(--color-status-error-100)' }}>
          <p className="text-sm" style={{ color: 'var(--color-status-error-500)' }}>
            계정 정지는 영구적이며, 브리더는 서비스를 이용할 수 없게 됩니다.
          </p>
        </div>
      </Form>
    </Modal>
  );
}

/* 정지 해제 모달 */
export function UnsuspendModal({
  visible,
  breeder,
  onOk,
  onCancel,
}: {
  visible: boolean;
  breeder: BreederVerification | null;
  onOk: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      title="브리더 계정 정지 해제"
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      okText="해제"
      cancelText="취소"
      {...modalStyle}
    >
      {breeder && (
        <p className="mb-4">
          <strong>{breeder.breederName}</strong>님의 계정 정지를 해제하시겠습니까?
        </p>
      )}
      <div className="p-3 rounded mt-4" style={{ backgroundColor: 'var(--color-tertiary-500)' }}>
        <p className="text-sm" style={{ color: 'var(--color-primary-500)' }}>
          정지가 해제되면 브리더는 다시 서비스를 이용할 수 있으며, 해제 안내 이메일이 발송됩니다.
        </p>
      </div>
    </Modal>
  );
}

/* 프로필 완성 독려 모달 */
export function ProfileRemindModal({
  visible,
  count,
  onOk,
  onCancel,
}: {
  visible: boolean;
  count: number;
  onOk: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      title="프로필 완성 독려 알림 발송"
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      okText="발송"
      cancelText="취소"
      {...modalStyle}
    >
      <p className="mb-4 text-sm text-gray-600">선택한 {count}명의 브리더에게 프로필 완성 독려 알림을 발송합니다.</p>
      <div
        className="p-4 rounded mb-4"
        style={{ backgroundColor: '#dbeafe', borderLeft: '4px solid var(--color-primary-500)' }}
      >
        <p className="text-sm font-semibold mb-2" style={{ color: '#1e3a8a' }}>
          발송 메시지
        </p>
        <p className="text-sm" style={{ color: '#1e40af' }}>
          <strong>서비스 알림:</strong> 브리더 프로필이 아직 완성되지 않았어요! 프로필 작성을 마무리하면 입양자에게
          노출되고 상담을 받을 수 있어요.
        </p>
      </div>
      <div className="p-3 rounded" style={{ backgroundColor: 'var(--color-tertiary-500)' }}>
        <p className="text-sm" style={{ color: 'var(--color-primary-500)' }}>
          입점 승인(APPROVED) 후 프로필 미완성인 브리더에게만 발송됩니다.
        </p>
      </div>
    </Modal>
  );
}
