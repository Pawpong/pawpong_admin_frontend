import { Modal, Form, Input, Select } from 'antd';
import type { FormInstance } from 'antd';

import type { Breed } from '../../../shared/types/api.types';

const { Option } = Select;
const { TextArea } = Input;

interface BreedModalProps {
  visible: boolean;
  editingBreed: Breed | null;
  form: FormInstance;
  submitting: boolean;
  onOk: () => void;
  onCancel: () => void;
}

/**
 * 품종 생성/수정 모달 컴포넌트
 */
export function BreedModal({ visible, editingBreed, form, submitting, onOk, onCancel }: BreedModalProps) {
  return (
    <Modal
      title={editingBreed ? '품종 수정' : '새 품종 추가'}
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      confirmLoading={submitting}
      width={600}
      okText="저장"
      cancelText="취소"
    >
      <Form form={form} layout="vertical" style={{ marginTop: '20px' }}>
        <Form.Item name="petType" label="동물 타입" rules={[{ required: true, message: '동물 타입을 선택해주세요' }]}>
          <Select placeholder="동물 타입 선택" disabled={!!editingBreed}>
            <Option value="dog">강아지</Option>
            <Option value="cat">고양이</Option>
          </Select>
        </Form.Item>

        <Form.Item name="category" label="카테고리" rules={[{ required: true, message: '카테고리를 입력해주세요' }]}>
          <Input placeholder="예: 소형견" />
        </Form.Item>

        <Form.Item name="categoryDescription" label="카테고리 설명">
          <Input placeholder="예: 10kg 미만" />
        </Form.Item>

        <Form.Item
          name="breeds"
          label="품종 목록 (쉼표로 구분)"
          rules={[{ required: true, message: '품종을 입력해주세요' }]}
        >
          <TextArea rows={4} placeholder="예: 비숑프리제, 닥스훈트, 말티즈" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
