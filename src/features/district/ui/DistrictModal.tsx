import { Modal, Form, Input } from 'antd';
import type { FormInstance } from 'antd';

import type { District } from '../../../shared/types/api.types';

const { TextArea } = Input;

interface DistrictModalProps {
  visible: boolean;
  editingDistrict: District | null;
  form: FormInstance;
  submitting: boolean;
  onOk: () => void;
  onCancel: () => void;
}

export function DistrictModal({ visible, editingDistrict, form, submitting, onOk, onCancel }: DistrictModalProps) {
  return (
    <Modal
      title={editingDistrict ? '지역 수정' : '새 지역 추가'}
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      confirmLoading={submitting}
      width={600}
      okText="저장"
      cancelText="취소"
    >
      <Form form={form} layout="vertical" style={{ marginTop: '20px' }}>
        <Form.Item name="city" label="시/도" rules={[{ required: true, message: '시/도를 입력해주세요' }]}>
          <Input placeholder="예: 서울특별시" />
        </Form.Item>
        <Form.Item name="districts" label="시/군/구 목록 (쉼표로 구분)" rules={[{ required: true, message: '시/군/구를 입력해주세요' }]}>
          <TextArea rows={4} placeholder="예: 강남구, 강동구, 강북구" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
