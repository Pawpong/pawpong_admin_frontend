import { Modal, Form, Input, Select, Switch, Upload, Image, Checkbox } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import type { FormInstance } from 'antd';

import type { Banner } from '../api/homeApi';
import { BannerTextPreview } from './BannerTextPreview';

interface BannerModalProps {
  visible: boolean;
  editingBanner: Banner | null;
  form: FormInstance;
  onOk: () => void;
  onCancel: () => void;
  uploading: boolean;
  uploadingMobile: boolean;
  desktopPreviewImage: string;
  mobilePreviewImage: string;
  onUploadDesktop: (file: File) => false | Promise<false>;
  onUploadMobile: (file: File) => false | Promise<false>;
}

/**
 * 메인 배너 생성/수정 모달 컴포넌트
 */
export function BannerModal({
  visible,
  editingBanner,
  form,
  onOk,
  onCancel,
  uploading,
  uploadingMobile,
  desktopPreviewImage,
  mobilePreviewImage,
  onUploadDesktop,
  onUploadMobile,
}: BannerModalProps) {
  const textOverlayEnabled = Form.useWatch('textOverlayEnabled', form);
  const textOverlay = Form.useWatch('textOverlay', form);
  return (
    <Modal
      title={editingBanner ? '배너 수정' : '배너 추가'}
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      width="100%"
      style={{ maxWidth: '700px', top: 20 }}
      styles={{
        body: {
          maxHeight: 'calc(100vh - 200px)',
          overflowY: 'auto',
        },
      }}
      okText={editingBanner ? '수정' : '생성'}
      cancelText="취소"
    >
      <Form form={form} layout="vertical">
        {/* PC/Pad 버전 배너 이미지 */}
        <Form.Item label="배너 이미지 (PC/Pad 버전)" required>
          <Upload beforeUpload={onUploadDesktop} showUploadList={false} accept="image/*">
            <Button icon={<UploadOutlined />} loading={uploading}>
              PC/Pad 이미지 업로드
            </Button>
          </Upload>
          {desktopPreviewImage && (
            <div style={{ marginTop: '12px' }}>
              <Image
                src={desktopPreviewImage}
                alt="PC/Pad 미리보기"
                width="100%"
                style={{ maxHeight: '200px', objectFit: 'contain', borderRadius: '8px' }}
              />
            </div>
          )}
          {!desktopPreviewImage && (
            <div
              style={{
                marginTop: '12px',
                padding: '40px',
                background: 'var(--color-grayscale-gray1)',
                borderRadius: '8px',
                textAlign: 'center',
                color: 'var(--color-grayscale-gray5)',
              }}
            >
              PC/Pad용 이미지를 업로드해주세요
            </div>
          )}
        </Form.Item>

        {/* 모바일 버전 배너 이미지 */}
        <Form.Item label="배너 이미지 (모바일 버전)" required>
          <Upload beforeUpload={onUploadMobile} showUploadList={false} accept="image/*">
            <Button icon={<UploadOutlined />} loading={uploadingMobile}>
              모바일 이미지 업로드
            </Button>
          </Upload>
          {mobilePreviewImage && (
            <div style={{ marginTop: '12px' }}>
              <Image
                src={mobilePreviewImage}
                alt="모바일 미리보기"
                width="100%"
                style={{ maxHeight: '200px', objectFit: 'contain', borderRadius: '8px' }}
              />
            </div>
          )}
          {!mobilePreviewImage && (
            <div
              style={{
                marginTop: '12px',
                padding: '40px',
                background: 'var(--color-grayscale-gray1)',
                borderRadius: '8px',
                textAlign: 'center',
                color: 'var(--color-grayscale-gray5)',
              }}
            >
              모바일용 이미지를 업로드해주세요
            </div>
          )}
        </Form.Item>

        <Form.Item
          name="textOverlayEnabled"
          label="선명한 글자 표시"
          valuePropName="checked"
          extra="글자가 없는 배경 이미지를 올리고, 문구는 아래에서 입력하세요. 기존 글자가 들어간 이미지에는 끄고 사용하세요."
        >
          <Switch />
        </Form.Item>
        {textOverlayEnabled && (
          <>
            <Form.Item name={['textOverlay', 'layout']} label="문구 배치" rules={[{ required: true }]}>
              <Select
                options={[
                  { value: 'welcome', label: '환영 · 제목과 포퐁 로고' },
                  { value: 'launch', label: '앱 출시 · 로고와 하단 버튼' },
                  { value: 'category', label: '동물 탐색 · 제목과 이동 문구' },
                ]}
              />
            </Form.Item>
            <Form.Item
              name={['textOverlay', 'headline']}
              label="화면에 표시할 제목"
              rules={[{ required: true, whitespace: true, message: '표시할 제목을 입력해주세요' }, { max: 40 }]}
            >
              <Input maxLength={40} showCount placeholder="건강하고 사랑스러운 반려동물" />
            </Form.Item>
            <Form.Item name={['textOverlay', 'subtitle']} label="보조 문구" rules={[{ max: 60 }]}>
              <Input maxLength={60} showCount placeholder="에서 찾으세요!" />
            </Form.Item>
            <Form.Item name={['textOverlay', 'ctaLabel']} label="이동 버튼 문구 (선택)" rules={[{ max: 24 }]}>
              <Input maxLength={24} showCount placeholder="앱에서 만나기" />
            </Form.Item>
            {desktopPreviewImage && textOverlay?.headline && (
              <BannerTextPreview
                imageUrl={desktopPreviewImage}
                mobileImageUrl={mobilePreviewImage}
                copy={textOverlay}
              />
            )}
          </>
        )}

        <Form.Item name="title" label="제목 (선택)">
          <Input placeholder="배너 제목 (관리용)" />
        </Form.Item>

        <Form.Item name="description" label="설명 (선택)">
          <Input.TextArea placeholder="배너 설명 (관리용)" rows={2} />
        </Form.Item>

        <Form.Item name="linkType" label="링크 타입" rules={[{ required: true, message: '링크 타입을 선택해주세요' }]}>
          <Select>
            <Select.Option value="internal">내부 링크</Select.Option>
            <Select.Option value="external">외부 링크</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="linkUrl" label="링크 URL" rules={[{ required: true, message: '링크 URL을 입력해주세요' }]}>
          <Input placeholder="/explore?animal=dog 또는 https://example.com" />
        </Form.Item>

        <Form.Item name="order" label="정렬 순서" rules={[{ required: true, message: '정렬 순서를 입력해주세요' }]}>
          <Input type="number" placeholder="0부터 시작 (낮을수록 먼저 표시)" />
        </Form.Item>

        <Form.Item name="targetAudience" label="표시 대상" extra="선택하지 않으면 전체 사용자에게 표시됩니다">
          <Checkbox.Group
            options={[
              { label: '비회원', value: 'guest' },
              { label: '입양자', value: 'adopter' },
              { label: '브리더', value: 'breeder' },
            ]}
          />
        </Form.Item>

        <Form.Item name="isActive" label="활성화 여부" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}
