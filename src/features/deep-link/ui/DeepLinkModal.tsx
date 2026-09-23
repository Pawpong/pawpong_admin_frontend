import { Alert, Form, Input, Modal, Switch, Typography, type FormInstance } from 'antd';
import type { DeepLink, DeepLinkCreateRequest } from '../api/deepLinkApi';
import {
  DEEP_LINK_SLUG_PATTERN,
  DEEP_LINK_ORIGIN,
  deepLinkUrl,
  isHttpsUrl,
  isInternalAppPath,
  isPlainLinkText,
} from '../model/deepLinkPolicy';

const plainTextRule = {
  validator: (_: unknown, value?: string) =>
    !value || isPlainLinkText(value)
      ? Promise.resolve()
      : Promise.reject(new Error('HTML 기호와 줄바꿈 없는 일반 텍스트를 입력해주세요.')),
};

interface Props {
  open: boolean;
  editing: DeepLink | null;
  form: FormInstance<DeepLinkCreateRequest>;
  saving: boolean;
  onSave: () => void;
  onClose: () => void;
}

export function DeepLinkModal({ open, editing, form, saving, onSave, onClose }: Props) {
  const slug = Form.useWatch('slug', form);
  return (
    <Modal
      title={editing ? '딥링크 수정' : '딥링크 만들기'}
      open={open}
      onOk={onSave}
      onCancel={onClose}
      okText="저장"
      cancelText="취소"
      confirmLoading={saving}
      cancelButtonProps={{ disabled: saving }}
      closable={!saving}
      maskClosable={!saving}
      width={640}
    >
      <Form form={form} layout="vertical" disabled={saving} style={{ marginTop: 20 }}>
        <Form.Item
          name="slug"
          label="링크 주소"
          normalize={(value: string) => value.trim()}
          extra={
            slug && DEEP_LINK_SLUG_PATTERN.test(slug) ? (
              <Typography.Text copyable>{deepLinkUrl(slug)}</Typography.Text>
            ) : (
              '영문 소문자·숫자·하이픈을 사용하세요. 만들 때 비워두면 주소를 자동 생성합니다.'
            )
          }
          rules={[
            { required: !!editing, message: '링크 주소를 입력해주세요.' },
            { pattern: DEEP_LINK_SLUG_PATTERN, message: '영문 소문자와 숫자 사이에 하이픈을 사용할 수 있습니다.' },
            { max: 80, message: '링크 주소는 80자 이내로 입력해주세요.' },
          ]}
        >
          <Input
            addonBefore={`${new URL(DEEP_LINK_ORIGIN).hostname}/l/`}
            placeholder="예: autumn-news"
            maxLength={80}
          />
        </Form.Item>
        {editing ? (
          <Alert
            type="info"
            showIcon
            message="주소를 바꾸면 이전에 공유한 링크는 열리지 않습니다."
            style={{ marginBottom: 16 }}
          />
        ) : null}
        <Form.Item
          name="title"
          label="제목"
          rules={[{ required: true, whitespace: true, message: '제목을 입력해주세요.' }, { max: 100 }, plainTextRule]}
        >
          <Input maxLength={100} showCount placeholder="예: 포퐁 소식" />
        </Form.Item>
        <Form.Item name="description" label="공유 설명 (선택)" rules={[{ max: 500 }, plainTextRule]}>
          <Input.TextArea
            maxLength={500}
            showCount
            rows={3}
            placeholder="공유 미리보기와 링크 안내 페이지에 표시할 내용"
          />
        </Form.Item>
        <Form.Item
          name="targetPath"
          label="앱에서 열 화면"
          normalize={(value: string) => value.trim()}
          extra="포퐁 사용자 앱의 경로를 입력하세요. 홈 /, 입양 탐색 /explore, 커뮤니티 /community"
          rules={[
            { required: true, message: '앱 경로를 입력해주세요.' },
            { max: 500 },
            {
              validator: (_, value) =>
                !value || isInternalAppPath(value)
                  ? Promise.resolve()
                  : Promise.reject(new Error('/로 시작하는 내부 앱 경로를 입력해주세요.')),
            },
          ]}
        >
          <Input placeholder="/explore" maxLength={500} />
        </Form.Item>
        <Form.Item
          name="imageUrl"
          label="공유 이미지 URL (선택)"
          normalize={(value: string) => value.trim()}
          extra="HTTPS 이미지 주소를 입력하세요. 비워두면 서비스 기본 이미지를 사용합니다."
          rules={[
            { max: 2048 },
            {
              validator: (_, value) =>
                !value || isHttpsUrl(value)
                  ? Promise.resolve()
                  : Promise.reject(new Error('HTTPS 이미지 주소를 입력해주세요.')),
            },
          ]}
        >
          <Input placeholder="https://..." allowClear />
        </Form.Item>
        <Form.Item
          name="isActive"
          label="링크 활성 상태"
          valuePropName="checked"
          extra="비활성 링크는 공유 페이지와 앱에서 열리지 않습니다."
        >
          <Switch checkedChildren="활성" unCheckedChildren="비활성" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
