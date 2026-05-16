import { Modal, Form, Input, Select, InputNumber, Switch } from 'antd';
import type { FormInstance } from 'antd';

import type { FAQ } from '../../../shared/types/api.types';

const { Option } = Select;

interface FaqModalProps {
  visible: boolean;
  editingFaq: FAQ | null;
  form: FormInstance;
  submitting: boolean;
  onOk: () => void;
  onCancel: () => void;
}

export function FaqModal({ visible, editingFaq, form, submitting, onOk, onCancel }: FaqModalProps) {
  return (
    <Modal
      title={editingFaq ? 'FAQ 수정' : 'FAQ 추가'}
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      confirmLoading={submitting}
      okText={editingFaq ? '수정' : '생성'}
      cancelText="취소"
      width={700}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="question" label="질문" rules={[{ required: true, message: '질문을 입력해주세요' }]}>
          <Input placeholder="자주 묻는 질문을 입력하세요" />
        </Form.Item>
        <Form.Item name="answer" label="답변" rules={[{ required: true, message: '답변을 입력해주세요' }]}>
          <Input.TextArea rows={4} placeholder="답변 내용을 입력하세요" />
        </Form.Item>
        <Form.Item name="category" label="카테고리" rules={[{ required: true, message: '카테고리를 선택해주세요' }]}>
          <Select>
            <Option value="service">서비스</Option>
            <Option value="adoption">입양</Option>
            <Option value="breeder">브리더</Option>
            <Option value="payment">결제</Option>
            <Option value="etc">기타</Option>
          </Select>
        </Form.Item>
        <Form.Item name="userType" label="대상 사용자" rules={[{ required: true, message: '대상 사용자를 선택해주세요' }]}>
          <Select>
            <Option value="adopter">입양자</Option>
            <Option value="breeder">브리더</Option>
            <Option value="both">공통</Option>
          </Select>
        </Form.Item>
        <Form.Item name="order" label="정렬 순서" rules={[{ required: true }]}>
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="isActive" label="활성화" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}
