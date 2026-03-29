import { Modal, Form, Input, Select, Switch } from 'antd';
import type { FormInstance } from 'antd';

import type { StandardQuestion } from '../../../shared/types/api.types';

const { Option } = Select;
const { TextArea } = Input;

interface StandardQuestionModalProps {
  visible: boolean;
  editingQuestion: StandardQuestion | null;
  form: FormInstance;
  onOk: () => void;
  onCancel: () => void;
}

/**
 * 표준 질문 수정 모달 컴포넌트
 */
export function StandardQuestionModal({ visible, editingQuestion, form, onOk, onCancel }: StandardQuestionModalProps) {
  return (
    <Modal
      title="표준 질문 수정"
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      width={700}
      okText="저장"
      cancelText="취소"
    >
      <Form form={form} layout="vertical" style={{ marginTop: '20px' }}>
        <Form.Item name="type" label="질문 타입" rules={[{ required: true, message: '질문 타입을 선택해주세요' }]}>
          <Select placeholder="질문 타입 선택">
            <Option value="text">단답형 (text)</Option>
            <Option value="textarea">장문형 (textarea)</Option>
            <Option value="checkbox">체크박스 (checkbox)</Option>
            <Option value="radio">라디오 (radio)</Option>
            <Option value="select">선택형 (select)</Option>
          </Select>
        </Form.Item>

        <Form.Item name="label" label="질문 내용" rules={[{ required: true, message: '질문 내용을 입력해주세요' }]}>
          <Input placeholder="예: 개인정보 수집 및 이용에 동의하시나요?" />
        </Form.Item>

        <Form.Item name="required" label="필수 여부" valuePropName="checked">
          <Switch checkedChildren="필수" unCheckedChildren="선택" />
        </Form.Item>

        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}>
          {({ getFieldValue }) => {
            const type = getFieldValue('type');
            return ['select', 'radio', 'checkbox'].includes(type) ? (
              <Form.Item
                name="options"
                label="선택 옵션 (쉼표로 구분)"
                rules={[{ required: true, message: '옵션을 입력해주세요' }]}
              >
                <Input placeholder="예: 예, 아니오, 모름" addonBefore="옵션" />
              </Form.Item>
            ) : null;
          }}
        </Form.Item>

        <Form.Item name="placeholder" label="플레이스홀더">
          <Input placeholder="예: 서울시 강남구" />
        </Form.Item>

        <Form.Item name="description" label="설명 또는 도움말">
          <TextArea rows={3} placeholder="예: 개인정보는 입양 심사 목적으로만 사용됩니다" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
