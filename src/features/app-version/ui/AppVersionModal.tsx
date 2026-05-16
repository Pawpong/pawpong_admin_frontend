import { Modal, Form, Input, Select, Switch, Space } from 'antd';
import type { FormInstance } from 'antd';

import type { AppVersion } from '../api/appVersionApi';

const { Option } = Select;
const { TextArea } = Input;

interface AppVersionModalProps {
  visible: boolean;
  editingVersion: AppVersion | null;
  form: FormInstance;
  submitting: boolean;
  onOk: () => void;
  onCancel: () => void;
}

/**
 * 앱 버전 생성/수정 모달 컴포넌트
 */
export function AppVersionModal({ visible, editingVersion, form, submitting, onOk, onCancel }: AppVersionModalProps) {
  return (
    <Modal
      title={editingVersion ? '앱 버전 수정' : '새 앱 버전 추가'}
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      confirmLoading={submitting}
      width={640}
      okText="저장"
      cancelText="취소"
    >
      <Form form={form} layout="vertical" style={{ marginTop: '20px' }}>
        <Form.Item name="platform" label="플랫폼" rules={[{ required: true, message: '플랫폼을 선택해주세요' }]}>
          <Select placeholder="플랫폼 선택" disabled={!!editingVersion}>
            <Option value="ios">iOS</Option>
            <Option value="android">Android</Option>
          </Select>
        </Form.Item>

        <Space style={{ display: 'flex' }} align="start">
          <Form.Item
            name="latestVersion"
            label="최신 버전"
            rules={[{ required: true, message: '최신 버전을 입력해주세요' }]}
            style={{ flex: 1 }}
          >
            <Input placeholder="예: 1.2.0" />
          </Form.Item>

          <Form.Item
            name="minRequiredVersion"
            label="최소 요구 버전"
            rules={[{ required: true, message: '최소 요구 버전을 입력해주세요' }]}
            style={{ flex: 1 }}
          >
            <Input placeholder="예: 1.0.0" />
          </Form.Item>
        </Space>

        <Form.Item
          name="forceUpdateMessage"
          label="강제 업데이트 메시지"
          rules={[{ required: true, message: '강제 업데이트 메시지를 입력해주세요' }]}
        >
          <TextArea rows={2} placeholder="필수 보안 업데이트가 있습니다. 앱을 업데이트해주세요." />
        </Form.Item>

        <Form.Item
          name="recommendUpdateMessage"
          label="권장 업데이트 메시지"
          rules={[{ required: true, message: '권장 업데이트 메시지를 입력해주세요' }]}
        >
          <TextArea rows={2} placeholder="새로운 기능이 추가되었습니다. 업데이트를 권장합니다." />
        </Form.Item>

        <Form.Item
          name="iosStoreUrl"
          label="iOS App Store URL"
          rules={[{ required: true, message: 'iOS 스토어 URL을 입력해주세요' }]}
        >
          <Input placeholder="https://apps.apple.com/app/pawpong/id000000000" />
        </Form.Item>

        <Form.Item
          name="androidStoreUrl"
          label="Google Play Store URL"
          rules={[{ required: true, message: 'Android 스토어 URL을 입력해주세요' }]}
        >
          <Input placeholder="https://play.google.com/store/apps/details?id=kr.pawpong.app" />
        </Form.Item>

        <Form.Item name="isActive" label="활성 상태" valuePropName="checked">
          <Switch checkedChildren="활성" unCheckedChildren="비활성" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
