import { Modal, Form, Input, Switch, Select } from 'antd';
import type { FormInstance } from 'antd';

import type { AlimtalkTemplate } from '../../../shared/types/api.types';

interface AlimtalkEditModalProps {
  visible: boolean;
  form: FormInstance;
  selectedTemplate: AlimtalkTemplate | null;
  onOk: () => void;
  onCancel: () => void;
}

export function AlimtalkEditModal({ visible, form, selectedTemplate, onOk, onCancel }: AlimtalkEditModalProps) {
  return (
    <Modal title="알림톡 템플릿 수정" open={visible} onCancel={onCancel} onOk={onOk} width={600}>
      <Form form={form} onFinish={() => onOk()} layout="vertical">
        <Form.Item label="템플릿 코드" style={{ marginBottom: '12px' }}>
          <Input value={selectedTemplate?.templateCode} disabled />
        </Form.Item>
        <Form.Item label="템플릿 이름" style={{ marginBottom: '12px' }}>
          <Input value={selectedTemplate?.name} disabled />
        </Form.Item>
        <Form.Item label="솔라피 템플릿 ID" name="templateId" rules={[{ required: true, message: '솔라피 템플릿 ID를 입력하세요' }]} style={{ marginBottom: '12px' }}>
          <Input placeholder="KA01TP..." />
        </Form.Item>
        <Form.Item label="검수 상태" name="reviewStatus" rules={[{ required: true, message: '검수 상태를 선택하세요' }]} style={{ marginBottom: '12px' }}>
          <Select>
            <Select.Option value="pending">검수대기</Select.Option>
            <Select.Option value="approved">검수통과</Select.Option>
            <Select.Option value="rejected">검수거절</Select.Option>
            <Select.Option value="re_review">재검수</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="활성화" name="isActive" valuePropName="checked" style={{ marginBottom: '12px' }}>
          <Switch />
        </Form.Item>
        <Form.Item label="메모" name="memo" style={{ marginBottom: 0 }}>
          <Input.TextArea rows={3} placeholder="관리자용 메모" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
