import {
  Alert,
  Button,
  Col,
  Divider,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Switch,
  Tag,
  Upload,
} from 'antd';
import { CloseOutlined, ExperimentOutlined, UploadOutlined } from '@ant-design/icons';
import type { CSSProperties } from 'react';
import type { FormInstance } from 'antd';

import type { AiImageAssetPurpose, AiImageFilter, AiImagePreviewResult } from '../api/aiImageApi';
import { MAX_REFERENCE_IMAGES, type AiImageReferenceAsset } from '../hooks/useAiImageFilterCrud';

interface AiImageFilterModalProps {
  visible: boolean;
  editingFilter: AiImageFilter | null;
  form: FormInstance;
  onOk: () => void;
  onCancel: () => void;
  uploadingPurpose: AiImageAssetPurpose | null;
  thumbnailPreview: string;
  references: AiImageReferenceAsset[];
  onThumbnailUpload: (file: File) => false | Promise<false>;
  onReferenceUpload: (file: File) => false | Promise<false>;
  onRemoveReference: (objectKey: string) => void;
  previewing: boolean;
  previewResult: AiImagePreviewResult | null;
  previewSourcePreview: string;
  onPreviewSourceUpload: (file: File) => false | Promise<false>;
  onPreview: () => void;
}

const EMPTY_BOX_STYLE: CSSProperties = {
  padding: 32,
  background: 'var(--color-grayscale-gray1)',
  borderRadius: 8,
  textAlign: 'center',
  color: 'var(--color-grayscale-gray5)',
};

const ACCEPTED_IMAGE_TYPES = 'image/png,image/jpeg,image/webp';

/** 자주 쓰는 도트 굵기 — 숫자를 직접 고르기 전에 감을 잡게 한다 */
const PIXEL_PRESETS = [
  { label: '굵은 도트', pixelSize: 64, paletteSize: 24 },
  { label: '기본', pixelSize: 96, paletteSize: 48 },
  { label: '섬세한 도트', pixelSize: 128, paletteSize: 64 },
];

/**
 * AI 필터 생성/수정 모달.
 *
 * 왼쪽은 필터 정의, 오른쪽은 저장 전에 프롬프트를 시험하는 영역이다.
 * 미리보기는 필터를 저장하지 않고 돌기 때문에 사용자 쿼터·생성 이력에 남지 않는다.
 */
export function AiImageFilterModal({
  visible,
  editingFilter,
  form,
  onOk,
  onCancel,
  uploadingPurpose,
  thumbnailPreview,
  references,
  onThumbnailUpload,
  onReferenceUpload,
  onRemoveReference,
  previewing,
  previewResult,
  previewSourcePreview,
  onPreviewSourceUpload,
  onPreview,
}: AiImageFilterModalProps) {
  const postProcessType = Form.useWatch('postProcessType', form);
  const isPixelate = postProcessType !== 'none';

  return (
    <Modal
      title={editingFilter ? 'AI 필터 수정' : 'AI 필터 추가'}
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      width="100%"
      style={{ maxWidth: 1080, top: 20 }}
      styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' } }}
      okText={editingFilter ? '수정' : '생성'}
      cancelText="취소"
    >
      {/* 정의와 시험 영역이 하나의 폼 인스턴스를 공유한다.
          미리보기가 지금 입력 중인 프롬프트를 그대로 읽어야 하므로 폼을 쪼개지 않는다. */}
      <Form form={form} layout="vertical">
        <Row gutter={24}>
          {/* ---------- 필터 정의 ---------- */}
          <Col xs={24} md={13}>
            <Form.Item
              name="name"
              label="필터명"
              rules={[{ required: true, message: '필터명을 입력해주세요' }]}
              extra="사용자에게 그대로 노출됩니다"
            >
              <Input placeholder="예: 포근한 버섯 상점" maxLength={50} />
            </Form.Item>

            <Form.Item name="description" label="설명">
              <Input.TextArea placeholder="예: 반려동물을 버섯 가게 주인으로" rows={2} maxLength={200} />
            </Form.Item>

            <Form.Item label="썸네일">
              <Upload beforeUpload={onThumbnailUpload} showUploadList={false} accept={ACCEPTED_IMAGE_TYPES}>
                <Button icon={<UploadOutlined />} loading={uploadingPurpose === 'thumbnail'}>
                  썸네일 업로드
                </Button>
              </Upload>
              {thumbnailPreview ? (
                <div style={{ marginTop: 12 }}>
                  <Image
                    src={thumbnailPreview}
                    alt="썸네일 미리보기"
                    width={140}
                    height={140}
                    style={{ objectFit: 'cover', borderRadius: 8 }}
                  />
                </div>
              ) : (
                <div style={{ ...EMPTY_BOX_STYLE, marginTop: 12 }}>썸네일을 업로드해주세요</div>
              )}
            </Form.Item>

            <Form.Item
              name="prompt"
              label="변환 프롬프트"
              rules={[{ required: true, message: '프롬프트를 입력해주세요' }]}
              extra="사용자에게 노출되지 않습니다"
            >
              <Input.TextArea
                placeholder="16-bit pixel art portrait of the pet, warm mushroom shop background"
                rows={4}
                maxLength={2000}
                showCount
              />
            </Form.Item>

            <Form.Item name="negativePrompt" label="제외할 요소">
              <Input.TextArea placeholder="blurry, text, watermark" rows={2} maxLength={1000} />
            </Form.Item>

            <Row gutter={12}>
              <Col span={12}>
                <Form.Item name="model" label="모델" rules={[{ required: true, message: '모델을 선택해주세요' }]}>
                  <Select options={[{ value: 'gpt-image-1', label: 'gpt-image-1' }]} placeholder="이미지 모델" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="outputSize" label="출력 크기">
                  <Select
                    options={[
                      { value: '1024x1024', label: '1024 x 1024 (정사각)' },
                      { value: '1024x1536', label: '1024 x 1536 (세로)' },
                      { value: '1536x1024', label: '1536 x 1024 (가로)' },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">도트 스타일</Divider>

            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  name="postProcessType"
                  label="후처리"
                  extra="도트는 결과를 실제 픽셀 격자로 맞춰 포퐁 톤을 통일합니다"
                >
                  <Select
                    options={[
                      { value: 'pixelate', label: '도트 (기본)' },
                      { value: 'none', label: '없음 — 모델 결과 그대로' },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="inputFidelity"
                  label="원본 보존"
                  extra="높음은 우리 아이 얼굴·무늬를 더 살립니다 (생성 비용 증가)"
                >
                  <Select
                    options={[
                      { value: 'high', label: '높음 (기본)' },
                      { value: 'low', label: '보통' },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Space size={6} wrap style={{ marginBottom: 12 }}>
              {PIXEL_PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  size="small"
                  disabled={!isPixelate}
                  onClick={() => form.setFieldsValue({ pixelSize: preset.pixelSize, paletteSize: preset.paletteSize })}
                >
                  {preset.label} {preset.pixelSize}px · {preset.paletteSize}색
                </Button>
              ))}
            </Space>

            <Row gutter={12}>
              <Col span={12}>
                <Form.Item name="pixelSize" label="도트 해상도" extra="장축 도트 수. 낮을수록 굵어집니다">
                  <InputNumber min={16} max={512} disabled={!isPixelate} style={{ width: '100%' }} addonAfter="px" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="paletteSize" label="팔레트 색 수" extra="낮을수록 레트로해집니다">
                  <InputNumber min={2} max={256} disabled={!isPixelate} style={{ width: '100%' }} addonAfter="색" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label={`스타일 레퍼런스 (${references.length}/${MAX_REFERENCE_IMAGES})`}
              extra="원본 사진과 함께 모델에 전달되어 화풍·색감을 맞춥니다. 레퍼런스 속 대상은 그리지 않습니다."
            >
              <Upload beforeUpload={onReferenceUpload} showUploadList={false} accept={ACCEPTED_IMAGE_TYPES}>
                <Button
                  icon={<UploadOutlined />}
                  loading={uploadingPurpose === 'reference'}
                  disabled={references.length >= MAX_REFERENCE_IMAGES}
                >
                  레퍼런스 추가
                </Button>
              </Upload>
              <div style={{ marginTop: 8 }}>
                {references.length > 0 ? (
                  <Space size={8} wrap>
                    {references.map((reference) => (
                      <div key={reference.objectKey} style={{ position: 'relative' }}>
                        {reference.previewUrl ? (
                          <Image
                            src={reference.previewUrl}
                            alt="레퍼런스"
                            width={72}
                            height={72}
                            style={{ objectFit: 'cover', borderRadius: 8 }}
                          />
                        ) : (
                          <Tag>{reference.objectKey.split('/').pop()}</Tag>
                        )}
                        <Button
                          size="small"
                          shape="circle"
                          icon={<CloseOutlined />}
                          aria-label="레퍼런스 삭제"
                          onClick={() => onRemoveReference(reference.objectKey)}
                          style={{ position: 'absolute', top: -8, right: -8 }}
                        />
                      </div>
                    ))}
                  </Space>
                ) : (
                  <span style={{ color: 'var(--color-grayscale-gray5)' }}>등록된 레퍼런스가 없습니다</span>
                )}
              </div>
            </Form.Item>

            <Row gutter={12}>
              <Col span={12}>
                <Form.Item name="sortOrder" label="정렬 순서">
                  <InputNumber min={0} style={{ width: '100%' }} placeholder="낮을수록 먼저 노출" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="isActive" label="사용자 노출" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
          </Col>

          {/* ---------- 프롬프트 시험 ---------- */}
          <Col xs={24} md={11}>
            <Divider orientation="left" style={{ marginTop: 0 }}>
              프롬프트 시험
            </Divider>

            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 12 }}
              message="저장하지 않고 결과만 확인합니다"
              description="왼쪽의 프롬프트·도트 스타일·레퍼런스를 그대로 써서 사용자와 같은 조건으로 생성합니다. 사용자 쿼터·생성 이력에 남지 않고, 최대 2분이 걸릴 수 있습니다."
            />

            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <Upload beforeUpload={onPreviewSourceUpload} showUploadList={false} accept={ACCEPTED_IMAGE_TYPES}>
                <Button icon={<UploadOutlined />} loading={uploadingPurpose === 'source'}>
                  시험용 원본 업로드
                </Button>
              </Upload>

              <Row gutter={12}>
                <Col span={12}>
                  <div style={{ fontSize: 12, marginBottom: 6 }}>원본</div>
                  {previewSourcePreview ? (
                    <Image src={previewSourcePreview} alt="원본" width="100%" style={{ borderRadius: 8 }} />
                  ) : (
                    <div style={EMPTY_BOX_STYLE}>원본 없음</div>
                  )}
                </Col>
                <Col span={12}>
                  <div style={{ fontSize: 12, marginBottom: 6 }}>결과</div>
                  {previewResult?.isSuccess && previewResult.outputImageUrl ? (
                    <Image
                      src={previewResult.outputImageUrl}
                      alt="미리보기 결과"
                      width="100%"
                      style={{ borderRadius: 8 }}
                    />
                  ) : (
                    <div style={EMPTY_BOX_STYLE}>결과 없음</div>
                  )}
                </Col>
              </Row>

              <Button type="primary" icon={<ExperimentOutlined />} loading={previewing} onClick={onPreview} block>
                {previewing ? '생성 중… 최대 2분 소요' : '이 프롬프트로 생성해보기'}
              </Button>

              {previewResult?.isSuccess && (
                <Alert
                  type="success"
                  showIcon
                  message={`생성 성공 (${(previewResult.latencyMs / 1000).toFixed(1)}초)`}
                />
              )}

              {previewResult && !previewResult.isSuccess && (
                <Alert
                  type="error"
                  showIcon
                  message={`생성 실패: ${previewResult.errorCode ?? '알 수 없는 오류'}`}
                  description={previewResult.errorMessage ?? undefined}
                />
              )}
            </Space>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
