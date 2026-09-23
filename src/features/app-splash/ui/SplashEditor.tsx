import { useState } from 'react';
import { App, Button, Form, Input, InputNumber, Space, Switch, Typography, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { appSplashApi, type AppSplash, type SplashSettings } from '../api/appSplashApi';
import { uploadApi } from '../../upload/api/uploadApi';

const DEFAULTS: SplashSettings = { isEnabled: true, imageFileName: '', backgroundColor: '#FFFFFF', imageWidth: 200, durationMs: 1200 };

/** 플랫폼별 초안을 유지하고 저장 전 실제 비율의 화면을 확인한다. */
export function SplashEditor({ initial }: { initial: AppSplash }) {
  const { message } = App.useApp();
  const [form] = Form.useForm<SplashSettings>();
  const [saved, setSaved] = useState(initial);
  const [imageUrl, setImageUrl] = useState(initial.imageUrl);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const enabled = Form.useWatch('isEnabled', form) ?? initial.isEnabled;
  const background = Form.useWatch('backgroundColor', form) ?? initial.backgroundColor;
  const width = Form.useWatch('imageWidth', form) ?? initial.imageWidth;
  const validColor = /^#[0-9a-f]{6}$/i.test(background) ? background : '#FFFFFF';
  const previewWidth = Math.min(Math.max(enabled ? width : 200, 80), 320);

  const upload = async (file: File) => {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 3 * 1024 * 1024) {
      message.error('PNG, JPG, WebP 이미지를 3MB 이하로 올려주세요.');
      return false;
    }
    setUploading(true);
    try {
      const result = await uploadApi.uploadSingle(file, 'app-splash');
      form.setFieldValue('imageFileName', result.fileName);
      setImageUrl(result.cdnUrl);
      setDirty(true);
      message.success('이미지를 올렸습니다. 저장하면 앱에 반영됩니다.');
    } catch {
      message.error('이미지를 올리지 못했습니다. 다시 시도해주세요.');
    } finally { setUploading(false); }
    return false;
  };

  const save = async (values: SplashSettings) => {
    setSaving(true);
    try {
      const result = await appSplashApi.save(initial.platform, values);
      setSaved(result);
      setImageUrl(result.imageUrl);
      setDirty(false);
      message.success('저장했습니다. 다음 앱 실행부터 반영됩니다.');
    } catch { message.error('저장하지 못했습니다. 입력한 설정을 확인하고 다시 시도해주세요.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="splash-editor">
      <Form name={`splash-${initial.platform}`} form={form} layout="vertical" initialValues={initial} onFinish={save} onValuesChange={() => setDirty(true)} disabled={saving || uploading}>
        <Form.Item name="isEnabled" label="시작 화면 사용" valuePropName="checked" extra="끄면 별도 표시 시간을 두지 않고 기본 로고에서 서비스로 이동합니다.">
          <Switch checkedChildren="사용" unCheckedChildren="사용 안 함" />
        </Form.Item>
        <Form.Item name="imageFileName" hidden><Input /></Form.Item>
        <Form.Item label="시작 이미지" extra="PNG·JPG·WebP, 최대 3MB. 이미지를 지정하지 않으면 기본 포퐁 로고를 사용합니다.">
          <Space wrap>
            <Upload accept="image/png,image/jpeg,image/webp" beforeUpload={upload} showUploadList={false} disabled={saving || uploading}>
              <Button icon={<UploadOutlined />} loading={uploading}>이미지 업로드</Button>
            </Upload>
            <Button onClick={() => { form.setFieldValue('imageFileName', ''); setImageUrl(''); setDirty(true); }}>기본 로고 사용</Button>
          </Space>
        </Form.Item>
        <Form.Item name="backgroundColor" label="배경색" rules={[{ required: true, pattern: /^#[0-9a-f]{6}$/i, message: '#FFFFFF 형식의 색상을 입력해주세요.' }]}>
          <Input maxLength={7} placeholder="#FFFFFF" style={{ width: 160 }} />
        </Form.Item>
        <Form.Item name="imageWidth" label="이미지 너비" rules={[{ required: true, type: 'integer', min: 80, max: 320 }]} extra="80~320. 이미지 전체가 보이도록 비율을 유지합니다.">
          <InputNumber min={80} max={320} step={10} suffix="dp" />
        </Form.Item>
        <Form.Item name="durationMs" label="최소 표시 시간" rules={[{ required: true, type: 'integer', min: 0, max: 3000 }]} extra="0~3,000ms. 1,000ms는 1초입니다. 서비스 로딩 중에는 조금 더 표시될 수 있습니다.">
          <InputNumber min={0} max={3000} step={100} suffix="ms" />
        </Form.Item>
        <Space wrap>
          <Button type="primary" htmlType="submit" loading={saving} disabled={uploading || !dirty}>설정 저장</Button>
          <Button onClick={() => { form.setFieldsValue(saved); setImageUrl(saved.imageUrl); setDirty(false); }} disabled={!dirty}>변경 취소</Button>
          <Button onClick={() => { form.setFieldsValue(DEFAULTS); setImageUrl(''); setDirty(true); }}>기본값으로 되돌리기</Button>
        </Space>
        <p><Typography.Text type="secondary">{dirty ? '저장하지 않은 변경 사항이 있습니다.' : saved.updatedAt ? `최근 저장: ${new Date(saved.updatedAt).toLocaleString('ko-KR')}` : '기본 설정을 사용하고 있습니다.'}</Typography.Text></p>
      </Form>
      <div>
        <Typography.Title level={5}>화면 미리보기</Typography.Title>
        <div className="splash-phone" style={{ backgroundColor: enabled ? validColor : '#FFFFFF' }}>
          <div style={{ width: `${(previewWidth / 390) * 100}%`, aspectRatio: '1' }}>
            <img key={imageUrl} src={enabled && imageUrl ? imageUrl : '/images/pawpong-splash.png'} alt="포퐁 시작 화면 이미지" style={{ width: '100%', height: '100%' }} />
          </div>
          {(!enabled || !imageUrl) && <>
            <img className="splash-wordmark" src="/images/pawpong-wordmark.png" alt="" style={{ top: `${50 + ((previewWidth / 2 + 8) / 844) * 100}%` }} />
            <span className="splash-tagline">반려동물과의 첫 만남, 포퐁</span>
          </>}
        </div>
        <Typography.Paragraph type="secondary" style={{ marginTop: 12 }}>앱을 새로 실행할 때 적용됩니다. {enabled ? '이미지는 중앙에 표시됩니다.' : '기본 로고만 표시합니다.'}</Typography.Paragraph>
      </div>
    </div>
  );
}
