import { Modal, Form, InputNumber, Space } from 'antd';
import type { FormInstance } from 'antd';

import type { StandardQuestion } from '../../../shared/types/api.types';
import { getQuestionTypeTag } from './StandardQuestionTable';

/** ID를 한글 라벨로 변환하는 매핑 객체 */
const ID_LABEL_MAP: Record<string, string> = {
  privacyConsent: '개인정보 동의',
  selfIntroduction: '자기소개',
  familyMembers: '가족 구성원',
  allFamilyConsent: '가족 동의',
  allergyTestInfo: '알러지 검사',
  timeAwayFromHome: '부재 시간',
  livingSpaceDescription: '거주 공간',
  previousPetExperience: '반려동물 경험',
  canProvideBasicCare: '기본 케어 가능',
  canAffordMedicalExpenses: '의료비 감당 가능',
  neuteringConsent: '중성화 동의',
  preferredPetDescription: '선호 반려동물',
  desiredAdoptionTiming: '입양 희망 시기',
  additionalNotes: '추가 문의',
};

interface StandardQuestionReorderModalProps {
  visible: boolean;
  questions: StandardQuestion[];
  form: FormInstance;
  onOk: () => void;
  onCancel: () => void;
}

/**
 * 표준 질문 순서 변경 모달 컴포넌트
 */
export function StandardQuestionReorderModal({
  visible,
  questions,
  form,
  onOk,
  onCancel,
}: StandardQuestionReorderModalProps) {
  return (
    <Modal
      title="질문 순서 변경"
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      width={800}
      okText="저장"
      cancelText="취소"
    >
      <div style={{ marginTop: '20px', marginBottom: '10px' }}>
        <p style={{ color: '#666' }}>각 질문의 순서를 변경하세요. 숫자가 작을수록 먼저 표시됩니다.</p>
      </div>
      <Form form={form} layout="vertical">
        {questions.map((q) => (
          <Form.Item
            key={q.id}
            name={q.id}
            label={
              <Space>
                <span style={{ fontWeight: 600, minWidth: '120px' }}>{ID_LABEL_MAP[q.id] || q.id}</span>
                {getQuestionTypeTag(q.type)}
                <span style={{ color: '#666', fontSize: '13px' }}>
                  {q.label.substring(0, 40)}
                  {q.label.length > 40 ? '...' : ''}
                </span>
              </Space>
            }
            rules={[{ required: true, type: 'number' }]}
          >
            <InputNumber min={1} max={100} style={{ width: '100px' }} placeholder="순서" />
          </Form.Item>
        ))}
      </Form>
    </Modal>
  );
}
