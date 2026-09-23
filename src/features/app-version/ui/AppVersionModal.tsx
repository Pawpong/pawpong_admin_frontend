import { Modal, Form, Input, Select, Switch, Space, Alert } from 'antd';
import type { FormInstance } from 'antd';

import type { AppVersion } from '../api/appVersionApi';
import { APP_VERSION_PATTERN, compareAppVersions, isStoreUrl } from '../model/appVersionPolicy';

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
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="권장·필수 업데이트 적용 기준"
          description={
            <span>
              최소 요구 버전 미만은 <strong>필수 업데이트</strong>로 앱 사용 전에 업데이트해야 합니다. 최소 요구 버전
              이상이고 최신 버전 미만이면 <strong>권장 업데이트</strong>로 나중에 할 수 있습니다. 권장 업데이트만
              안내하려면 최소 요구 버전을 유지하고 최신 버전을 올리세요.
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
            label="최신 버전 (권장 업데이트 기준)"
            normalize={(value: string) => value.trim()}
            rules={[
              { required: true, message: '최신 버전을 입력해주세요' },
              {
                pattern: APP_VERSION_PATTERN,
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
            normalize={(value: string) => value.trim()}
            dependencies={['latestVersion']}
            rules={[
              { required: true, message: '최소 요구 버전을 입력해주세요' },
              {
                pattern: APP_VERSION_PATTERN,
                message: '버전 형식이 올바르지 않습니다. 예: 1.0.0',
              },
              ({ getFieldValue }) => ({
                validator(_rule, value) {
                  if (!value) return Promise.resolve();
                  const latest = getFieldValue('latestVersion') as string | undefined;
                  if (!latest || !APP_VERSION_PATTERN.test(latest) || !APP_VERSION_PATTERN.test(value))
                    return Promise.resolve();
                  if (compareAppVersions(value, latest) > 0) {
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
          rules={[{ required: true, whitespace: true, message: '강제 업데이트 메시지를 입력해주세요' }]}
        >
          <TextArea rows={2} placeholder="필수 보안 업데이트가 있습니다. 앱을 업데이트해주세요." />
        </Form.Item>

        <Form.Item
          name="recommendUpdateMessage"
          label="권장 업데이트 메시지"
          rules={[{ required: true, whitespace: true, message: '권장 업데이트 메시지를 입력해주세요' }]}
        >
          <TextArea rows={2} placeholder="새로운 기능이 추가되었습니다. 업데이트를 권장합니다." />
        </Form.Item>

        <Form.Item
          name="iosStoreUrl"
          label="iOS App Store URL"
          normalize={(value: string) => value.trim()}
          rules={[
            { required: true, message: 'iOS 스토어 URL을 입력해주세요' },
            {
              validator: (_, value) =>
                !value || isStoreUrl(value, 'ios')
                  ? Promise.resolve()
                  : Promise.reject(new Error('앱 ID가 포함된 https://apps.apple.com/ 상세 주소를 입력해주세요.')),
            },
          ]}
        >
          <Input placeholder="https://apps.apple.com/app/pawpong/id000000000" />
        </Form.Item>

        <Form.Item
          name="androidStoreUrl"
          label="Google Play Store URL"
          normalize={(value: string) => value.trim()}
          rules={[
            { required: true, message: 'Android 스토어 URL을 입력해주세요' },
            {
              validator: (_, value) =>
                !value || isStoreUrl(value, 'android')
                  ? Promise.resolve()
                  : Promise.reject(new Error('Google Play의 kr.pawpong.app 앱 상세 주소를 입력해주세요.')),
            },
          ]}
        >
          <Input placeholder="https://play.google.com/store/apps/details?id=kr.pawpong.app" />
        </Form.Item>

        <Form.Item
          name="appIconKey"
          label="추천 앱 아이콘"
          extra="앱에 포함된 아이콘만 선택할 수 있습니다. 지원 앱에서 사용자가 동의하면 적용하며, 기본 아이콘으로 되돌릴 수 있습니다. 새 이미지 추가는 앱 출시가 필요합니다."
        >
          <Select
            placeholder="추천 없음 (사용자 선택 유지)"
            options={[
              { value: 'default', label: '기본 — 발바닥 아이콘' },
              { value: 'pixel', label: '포퐁 픽셀 — 웹 브랜드 아이콘' },
            ]}
          />
        </Form.Item>

        <Form.Item name="isActive" label="활성 상태" valuePropName="checked">
          <Switch checkedChildren="활성" unCheckedChildren="비활성" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
