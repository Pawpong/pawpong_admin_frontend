import { Modal, Form, Input, Select, Switch, Space, Alert } from 'antd';
import type { FormInstance } from 'antd';

import type { AppVersion } from '../api/appVersionApi';

const { Option } = Select;
const { TextArea } = Input;

/** "1.2.3" 또는 "1.2.3.4" 형태만 허용 */
const SEMVER_PATTERN = /^\d+\.\d+\.\d+(?:\.\d+)?$/;

/**
 * "1.2.3" 두 개를 비교해 -1/0/1 반환
 */
function compareSemver(a: string, b: string): number {
    const pa = a.split('.').map(Number);
    const pb = b.split('.').map(Number);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
        const na = pa[i] ?? 0;
        const nb = pb[i] ?? 0;
        if (Number.isNaN(na) || Number.isNaN(nb)) return 0;
        if (na < nb) return -1;
        if (na > nb) return 1;
    }
    return 0;
}

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
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="강제 업데이트는 신중히 설정하세요"
          description={
            <span>
              <strong>최소 요구 버전</strong> 미만 사용자는 즉시 앱이 차단되고 스토어로만 이동됩니다.
              앱스토어 심사 시 사용자 경험 저해 사유가 될 수 있어, 보안 이슈/필수 마이그레이션 등 꼭 필요한 경우에만 올려주세요.
            </span>
          }
        />
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
            rules={[
              { required: true, message: '최신 버전을 입력해주세요' },
              {
                pattern: SEMVER_PATTERN,
                message: '버전 형식이 올바르지 않습니다. 예: 1.2.0',
              },
            ]}
            style={{ flex: 1 }}
          >
            <Input placeholder="예: 1.2.0" />
          </Form.Item>

          <Form.Item
            name="minRequiredVersion"
            label="최소 요구 버전 (강제 업데이트 기준)"
            dependencies={['latestVersion']}
            rules={[
              { required: true, message: '최소 요구 버전을 입력해주세요' },
              {
                pattern: SEMVER_PATTERN,
                message: '버전 형식이 올바르지 않습니다. 예: 1.0.0',
              },
              ({ getFieldValue }) => ({
                validator(_rule, value) {
                  if (!value) return Promise.resolve();
                  const latest = getFieldValue('latestVersion') as string | undefined;
                  if (!latest || !SEMVER_PATTERN.test(latest)) return Promise.resolve();
                  if (compareSemver(value, latest) > 0) {
                    return Promise.reject(
                      new Error('최소 요구 버전은 최신 버전보다 클 수 없습니다 (모든 사용자 차단)'),
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
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
