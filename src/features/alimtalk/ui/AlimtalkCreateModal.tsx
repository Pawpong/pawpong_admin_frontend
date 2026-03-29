import { Modal, Form, Input, Switch, Select, Space } from 'antd';
import type { FormInstance } from 'antd';

interface AlimtalkCreateModalProps {
  visible: boolean;
  form: FormInstance;
  onOk: () => void;
  onCancel: () => void;
}

export function AlimtalkCreateModal({ visible, form, onOk, onCancel }: AlimtalkCreateModalProps) {
  return (
    <Modal title="알림톡 템플릿 등록" open={visible} onCancel={onCancel} onOk={onOk} width={700}>
      <Form form={form} onFinish={() => onOk()} layout="vertical">
        <Form.Item label="템플릿 코드" name="templateCode"
          rules={[{ required: true, message: '템플릿 코드를 입력하세요' }, { pattern: /^[A-Z_]+$/, message: '대문자와 언더스코어(_)만 사용 가능합니다' }]}
          extra="예: PAYMENT_CONFIRMATION (대문자 스네이크 케이스)">
          <Input placeholder="PAYMENT_CONFIRMATION" />
        </Form.Item>
        <Form.Item label="솔라피 템플릿 ID" name="templateId" rules={[{ required: true, message: '솔라피 템플릿 ID를 입력하세요' }]} extra="CoolSMS 콘솔에서 확인한 템플릿 ID">
          <Input placeholder="KA01TP..." />
        </Form.Item>
        <Form.Item label="템플릿 이름" name="name" rules={[{ required: true, message: '템플릿 이름을 입력하세요' }]}>
          <Input placeholder="결제 완료 알림" />
        </Form.Item>
        <Form.Item label="설명" name="description">
          <Input.TextArea rows={2} placeholder="템플릿 설명 (선택사항)" />
        </Form.Item>
        <Form.Item label="필수 변수" name="requiredVariables" extra="템플릿에서 사용하는 변수 (쉼표로 구분)">
          <Select mode="tags" placeholder="결제금액, 주문번호" />
        </Form.Item>
        <Form.Item label="검수 상태" name="reviewStatus" initialValue="approved">
          <Select>
            <Select.Option value="pending">검수대기</Select.Option>
            <Select.Option value="approved">검수통과</Select.Option>
            <Select.Option value="rejected">검수거절</Select.Option>
            <Select.Option value="re_review">재검수</Select.Option>
          </Select>
        </Form.Item>
        <Space size="large">
          <Form.Item label="SMS 대체 발송" name="fallbackToSms" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
          <Form.Item label="활성화" name="isActive" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Space>
        <Form.Item label="메모" name="memo">
          <Input.TextArea rows={2} placeholder="관리자용 메모 (선택사항)" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
