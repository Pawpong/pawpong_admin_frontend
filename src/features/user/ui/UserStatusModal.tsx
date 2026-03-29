import { Modal, Form, Select, Input } from 'antd';
import type { FormInstance } from 'antd';

const { Option } = Select;

interface UserStatusModalProps {
  visible: boolean;
  form: FormInstance;
  onOk: () => void;
  onCancel: () => void;
}

/** 사용자 상태 변경 모달 */
export function UserStatusModal({ visible, form, onOk, onCancel }: UserStatusModalProps) {
  return (
    <Modal
      title="사용자 상태 변경"
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      okText="변경"
      cancelText="취소"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="accountStatus"
          label="계정 상태"
          rules={[{ required: true, message: '상태를 선택해주세요' }]}
        >
          <Select>
            <Option value="active">활성</Option>
            <Option value="suspended">정지</Option>
            <Option value="deleted">탈퇴</Option>
          </Select>
        </Form.Item>
        <Form.Item name="reason" label="변경 사유" rules={[{ required: true, message: '변경 사유를 입력해주세요' }]}>
          <Input.TextArea rows={4} placeholder="변경 사유를 입력해주세요" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
