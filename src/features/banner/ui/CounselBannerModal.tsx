import { Modal, Form, Input, Select, Switch, Upload, Image, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd';

import type { CounselBanner } from '../../user/api/userApi';

interface CounselBannerModalProps {
  visible: boolean;
  editingBanner: CounselBanner | null;
  form: FormInstance;
  onOk: () => void;
  onCancel: () => void;
  uploading: boolean;
  previewImage: string;
  onUpload: (file: File) => false | Promise<false>;
}

/**
 * 상담 배너 생성/수정 모달 컴포넌트
 */
export function CounselBannerModal({
  visible,
  editingBanner,
  form,
  onOk,
  onCancel,
  uploading,
  previewImage,
  onUpload,
}: CounselBannerModalProps) {
  return (
    <Modal
      title={editingBanner ? '상담 배너 수정' : '상담 배너 추가'}
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
        <Form.Item label="배너 이미지">
          <Upload beforeUpload={onUpload} showUploadList={false} accept="image/*">
            <Button icon={<UploadOutlined />} loading={uploading}>
              이미지 업로드
            </Button>
          </Upload>
          {previewImage && (
            <div style={{ marginTop: '12px' }}>
              <Image
                src={previewImage}
                alt="미리보기"
                width="100%"
                style={{ maxHeight: '200px', objectFit: 'contain', borderRadius: '8px' }}
              />
            </div>
          )}
          {!previewImage && (
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
              이미지를 업로드해주세요
            </div>
          )}
        </Form.Item>

        <Form.Item name="title" label="제목 (선택)">
          <Input placeholder="배너 제목 (관리용)" />
        </Form.Item>

        <Form.Item name="description" label="설명 (선택)">
          <Input.TextArea placeholder="배너 설명 (관리용)" rows={2} />
        </Form.Item>

        <Form.Item name="linkType" label="링크 타입 (선택)">
          <Select placeholder="링크 타입 선택 (선택사항)" allowClear>
            <Select.Option value="internal">내부 링크</Select.Option>
            <Select.Option value="external">외부 링크</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="linkUrl" label="링크 URL (선택)">
          <Input placeholder="/breeders/management 또는 https://example.com (선택사항)" />
        </Form.Item>

        <Form.Item name="order" label="정렬 순서" rules={[{ required: true, message: '정렬 순서를 입력해주세요' }]}>
          <Input type="number" placeholder="0부터 시작 (낮을수록 먼저 표시)" />
        </Form.Item>

        <Form.Item name="isActive" label="활성화 여부" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}
