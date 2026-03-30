import { Modal, Descriptions, Tag, Space, Image, Button, Form, Input, Checkbox } from 'antd';
import type { FormInstance } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';

import type { BreederVerification } from '../../../shared/types/api.types';
import { COMMON_REJECTION_REASONS, ELITE_REJECTION_REASONS, DOCUMENT_TYPE_LABELS } from '../hooks/useBreederVerification';

const { TextArea } = Input;

const getLevelTag = (level: string) => level === 'elite' ? <Tag color="purple">Elite</Tag> : <Tag color="blue">New</Tag>;

/* 상세 보기 모달 */
export function LevelChangeDetailModal({ visible, breeder, onClose, onApprove, onReject }: {
  visible: boolean; breeder: BreederVerification | null; onClose: () => void;
  onApprove: (id: string, level: string) => void; onReject: (r: BreederVerification) => void;
}) {
  if (!breeder) return null;
  return (
    <Modal title="레벨 변경 신청 상세" open={visible} onCancel={onClose} footer={null} width={800}>
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="브리더명">{breeder.breederName}</Descriptions.Item>
        <Descriptions.Item label="이메일">{breeder.emailAddress}</Descriptions.Item>
        <Descriptions.Item label="전화번호">{breeder.phoneNumber || '-'}</Descriptions.Item>
        <Descriptions.Item label="레벨 변경"><Space>{getLevelTag(breeder.verificationInfo.previousLevel || 'new')}<ArrowRightOutlined />{getLevelTag(breeder.verificationInfo.level)}</Space></Descriptions.Item>
        <Descriptions.Item label="요금제">{breeder.verificationInfo.subscriptionPlan === 'premium' ? 'Premium' : 'Basic'}</Descriptions.Item>
        <Descriptions.Item label="신청일">{breeder.verificationInfo.submittedAt ? new Date(breeder.verificationInfo.submittedAt).toLocaleString('ko-KR') : '-'}</Descriptions.Item>
      </Descriptions>
      <h3 className="mt-6 mb-3 font-semibold">제출 서류</h3>
      <div className="space-y-4">
        {breeder.verificationInfo.documents?.map((doc, i) => (
          <div key={i} className="border rounded p-3">
            <p className="font-medium mb-2">{DOCUMENT_TYPE_LABELS[doc.type] || doc.type}</p>
            {doc.fileUrl && <Image src={doc.fileUrl} alt={doc.type} style={{ maxWidth: '100%', maxHeight: '400px' }} />}
            <p className="text-xs text-gray-500 mt-2">업로드: {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString('ko-KR') : '-'}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button onClick={onClose}>닫기</Button>
        <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => { onApprove(breeder.breederId, breeder.verificationInfo.level); }} style={{ backgroundColor: 'var(--color-primary-500)', borderColor: 'var(--color-primary-500)' }}>승인</Button>
        <Button danger icon={<CloseCircleOutlined />} onClick={() => { onClose(); onReject(breeder); }}>거절</Button>
      </div>
    </Modal>
  );
}

/* 거절 사유 모달 */
export function LevelChangeRejectModal({ visible, breeder, form, onOk, onCancel }: {
  visible: boolean; breeder: BreederVerification | null; form: FormInstance; onOk: () => void; onCancel: () => void;
}) {
  return (
    <Modal title="레벨 변경 신청 거절" open={visible} onCancel={onCancel} onOk={onOk} okText="거절" cancelText="취소" okButtonProps={{ danger: true }}>
      <Form form={form} layout="vertical">
        <Form.Item label="거절 사유 선택">
          <div className="space-y-2">
            <p className="text-sm font-medium">공통 사유:</p>
            {COMMON_REJECTION_REASONS.map((reason, i) => (
              <Checkbox key={i} onChange={(e) => { if (e.target.checked) { const c = form.getFieldValue('rejectionReason') || ''; form.setFieldsValue({ rejectionReason: c ? `${c}\n- ${reason}` : `- ${reason}` }); } }}>{reason}</Checkbox>
            ))}
            {breeder?.verificationInfo.level === 'elite' && (
              <>
                <p className="text-sm font-medium mt-4">엘리트 레벨 전용 사유:</p>
                {ELITE_REJECTION_REASONS.map((reason, i) => (
                  <Checkbox key={i} onChange={(e) => { if (e.target.checked) { const c = form.getFieldValue('rejectionReason') || ''; form.setFieldsValue({ rejectionReason: c ? `${c}\n- ${reason}` : `- ${reason}` }); } }}>{reason}</Checkbox>
                ))}
              </>
            )}
          </div>
        </Form.Item>
        <Form.Item label="거절 사유" name="rejectionReason" rules={[{ required: true, message: '거절 사유를 입력해주세요.' }]}>
          <TextArea rows={6} placeholder="거절 사유를 입력하세요..." showCount maxLength={500} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
