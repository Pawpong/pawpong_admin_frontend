import { Modal, Form, Input, Switch } from 'antd';
import type { FormInstance } from 'antd';
import { PhoneOutlined } from '@ant-design/icons';

import type { PhoneWhitelist } from '../../../shared/types/api.types';

interface PhoneWhitelistModalProps {
  visible: boolean;
  editingItem: PhoneWhitelist | null;
  form: FormInstance;
  submitting: boolean;
  onOk: () => void;
  onCancel: () => void;
}

export function PhoneWhitelistModal({ visible, editingItem, form, submitting, onOk, onCancel }: PhoneWhitelistModalProps) {
  return (
    <Modal
      title={editingItem ? '화이트리스트 수정' : '새 번호 추가'}
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      confirmLoading={submitting}
      width="100%"
      style={{ maxWidth: '500px', top: 20 }}
      styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' } }}
      okText="저장"
      cancelText="취소"
    >
      <Form form={form} layout="vertical" style={{ marginTop: '20px' }}>
        <Form.Item
          name="phoneNumber"
          label="전화번호"
          rules={[
            { required: true, message: '전화번호를 입력해주세요' },
            { pattern: /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/, message: '올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)' },
          ]}
        >
          <Input placeholder="예: 010-1234-5678" disabled={!!editingItem} prefix={<PhoneOutlined />} />
        </Form.Item>
        <Form.Item name="description" label="설명" rules={[{ required: true, message: '설명을 입력해주세요' }]}>
          <Input.TextArea rows={3} placeholder="예: 개발팀 테스트 계정, QA 테스트용" />
        </Form.Item>
        {editingItem && (
          <Form.Item name="isActive" label="활성 상태" valuePropName="checked">
            <Switch checkedChildren="활성" unCheckedChildren="비활성" />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
