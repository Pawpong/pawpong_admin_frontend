import { Modal, Form, Checkbox, Input } from 'antd';
import type { FormInstance } from 'antd';

import type { BreederVerification } from '../../../shared/types/api.types';
import { COMMON_REJECTION_REASONS, ELITE_REJECTION_REASONS } from '../hooks/useBreederVerification';

const { TextArea } = Input;

interface Props {
  visible: boolean;
  breeder: BreederVerification | null;
  form: FormInstance;
  onOk: () => void;
  onCancel: () => void;
}

export function VerificationRejectModal({ visible, breeder, form, onOk, onCancel }: Props) {
  return (
    <Modal title="브리더 인증 반려" open={visible} onOk={onOk} onCancel={onCancel} okText="반려 처리" okButtonProps={{ danger: true }} cancelText="취소" width="100%" style={{ maxWidth: '600px', top: 20 }} styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' } }}>
      <Form form={form} layout="vertical">
        <Form.Item name="rejectionReasons" label="반려 사유 (복수 선택 가능)" rules={[{ required: true, message: '최소 1개 이상 선택해주세요' }]}>
          <Checkbox.Group style={{ width: '100%' }}>
            <div className="mb-4">
              <div className="px-3 py-2 rounded mb-3" style={{ backgroundColor: 'var(--color-tertiary-500)', borderLeft: '3px solid var(--color-primary-500)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-primary-500)' }}>공통 반려 사유</p>
              </div>
              <div className="flex flex-col gap-2 pl-2">
                {COMMON_REJECTION_REASONS.map((reason, i) => <Checkbox key={`c-${i}`} value={reason}><span className="text-sm">{reason}</span></Checkbox>)}
              </div>
            </div>
            {breeder?.verificationInfo?.level === 'elite' && (
              <div className="mt-4">
                <div className="px-3 py-2 rounded mb-3" style={{ backgroundColor: 'var(--color-level-elite-100)', borderLeft: '3px solid var(--color-level-elite-500)' }}>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-level-elite-500)' }}>엘리트 레벨 한정 반려 사유</p>
                </div>
                <div className="flex flex-col gap-2 pl-2">
                  {ELITE_REJECTION_REASONS.map((reason, i) => <Checkbox key={`e-${i}`} value={reason}><span className="text-sm">{reason}</span></Checkbox>)}
                </div>
              </div>
            )}
          </Checkbox.Group>
        </Form.Item>
        <Form.Item name="customReason" label="기타 사유 (선택)">
          <TextArea rows={3} placeholder="기타 반려 사유를 입력해주세요" maxLength={500} showCount />
        </Form.Item>
        <div className="p-3 rounded mb-3" style={{ backgroundColor: '#fef3c7', borderLeft: '3px solid #f59e0b' }}>
          <p className="text-sm" style={{ color: '#92400e' }}>선택된 반려 사유는 자동으로 이메일에 포함되어 브리더에게 발송됩니다.</p>
        </div>
      </Form>
    </Modal>
  );
}
