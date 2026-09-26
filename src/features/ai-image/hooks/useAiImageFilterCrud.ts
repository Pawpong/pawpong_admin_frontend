import { useCallback, useState } from 'react';
import { Form, message } from 'antd';

import {
  aiImageApi,
  type AiImageAssetPurpose,
  type AiImageFilter,
  type AiImageFilterRequest,
  type AiImagePreviewResult,
} from '../api/aiImageApi';
import { useListData } from '../../../shared/hooks';

/** 모델 미지정 시 기본값 (백엔드 필수 필드) */
const DEFAULT_MODEL = 'gpt-image-1';
const DEFAULT_OUTPUT_SIZE = '1024x1024';

/**
 * 새 필터의 출발점. 포퐁 결과물은 도트 그림으로 톤을 맞추므로
 * 도트 후처리와 원본 보존 high 를 기본으로 두고, 프롬프트도 도트 초상화 틀로 채워 둔다.
 * 백엔드 기본 필터(seed-default-ai-image-filter)와 같은 값이다.
 */
const PAWPONG_PIXEL_DEFAULTS = {
  prompt: [
    'Turn this pet photo into a cozy 16-bit pixel art portrait in the Pawpong style.',
    'Keep the exact same animal: its breed, face shape, eye color, ear shape and fur colors and markings must stay recognizable.',
    'Centered bust portrait, the pet looking at the viewer with a gentle happy expression.',
    'Clean pixel grid with crisp 1px dark outlines, limited warm pastel palette (cream, soft orange, warm brown, pale pink), simple flat shading.',
    'Plain soft cream background with a few tiny pixel hearts and sparkles.',
  ].join(' '),
  negativePrompt:
    'text, letters, watermark, signature, photorealistic, 3D render, blurry, gradients, extra limbs, extra animals, humans, changing the breed',
  postProcessType: 'pixelate' as const,
  pixelSize: 96,
  paletteSize: 48,
  inputFidelity: 'high' as const,
};

/** 레퍼런스 1장 — 저장에는 키를, 화면에는 URL 을 쓴다 */
export interface AiImageReferenceAsset {
  objectKey: string;
  previewUrl: string;
}

/** OpenAI 요청당 이미지 수 제한과 비용을 고려한 상한 (백엔드 검증과 동일) */
export const MAX_REFERENCE_IMAGES = 4;

/**
 * AI 필터 CRUD + 프롬프트 미리보기 훅.
 *
 * 썸네일·레퍼런스·미리보기 원본은 모두 presigned URL 로 버킷에 직접 올리고
 * 파일키만 폼에 들고 있는다. 서버가 이미지 바이트를 중계하지 않는다.
 */
export function useAiImageFilterCrud() {
  const fetchFilters = useCallback(() => aiImageApi.getFilters(), []);
  const { data: rawFilters, loading, error, refetch } = useListData<AiImageFilter>(fetchFilters, 'AI 필터');

  const filters = [...rawFilters].sort((a, b) => a.sortOrder - b.sortOrder);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingFilter, setEditingFilter] = useState<AiImageFilter | null>(null);
  const [form] = Form.useForm();

  // 애셋 상태 — 파일키는 저장에 쓰고, 미리보기 URL 은 화면 표시에만 쓴다
  const [uploadingPurpose, setUploadingPurpose] = useState<AiImageAssetPurpose | null>(null);
  const [thumbnailFileName, setThumbnailFileName] = useState<string>('');
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [references, setReferences] = useState<AiImageReferenceAsset[]>([]);

  // 프롬프트 시험 상태
  const [previewSourceKey, setPreviewSourceKey] = useState<string>('');
  const [previewSourcePreview, setPreviewSourcePreview] = useState<string>('');
  const [previewing, setPreviewing] = useState(false);
  const [previewResult, setPreviewResult] = useState<AiImagePreviewResult | null>(null);

  const resetAssetState = useCallback(() => {
    setThumbnailFileName('');
    setThumbnailPreview('');
    setReferences([]);
    setPreviewSourceKey('');
    setPreviewSourcePreview('');
    setPreviewResult(null);
  }, []);

  const openCreate = useCallback(() => {
    setEditingFilter(null);
    resetAssetState();
    form.resetFields();
    form.setFieldsValue({
      model: DEFAULT_MODEL,
      outputSize: DEFAULT_OUTPUT_SIZE,
      isActive: true,
      sortOrder: filters.length,
      ...PAWPONG_PIXEL_DEFAULTS,
    });
    setModalVisible(true);
  }, [form, filters.length, resetAssetState]);

  const openEdit = useCallback(
    (filter: AiImageFilter) => {
      setEditingFilter(filter);
      resetAssetState();
      setThumbnailFileName(filter.thumbnailFileName || '');
      setThumbnailPreview(filter.thumbnailUrl || '');
      setReferences(
        (filter.referenceImageObjectKeys || []).map((objectKey, index) => ({
          objectKey,
          previewUrl: filter.referenceImageUrls?.[index] ?? '',
        })),
      );
      form.setFieldsValue({
        name: filter.name,
        description: filter.description,
        prompt: filter.prompt,
        negativePrompt: filter.negativePrompt,
        model: filter.model,
        outputSize: filter.outputSize,
        isActive: filter.isActive,
        sortOrder: filter.sortOrder,
        // 설정 도입 전 필터는 응답에 값이 없을 수 있어 백엔드와 같은 기본값으로 채운다
        postProcessType: filter.postProcessType ?? PAWPONG_PIXEL_DEFAULTS.postProcessType,
        pixelSize: filter.pixelSize ?? PAWPONG_PIXEL_DEFAULTS.pixelSize,
        paletteSize: filter.paletteSize ?? PAWPONG_PIXEL_DEFAULTS.paletteSize,
        inputFidelity: filter.inputFidelity ?? PAWPONG_PIXEL_DEFAULTS.inputFidelity,
      });
      setModalVisible(true);
    },
    [form, resetAssetState],
  );

  const closeModal = useCallback(() => {
    setModalVisible(false);
    form.resetFields();
    resetAssetState();
  }, [form, resetAssetState]);

  /** 공통 업로드 — 용도에 따라 버킷 경로가 갈린다 */
  const uploadAsset = useCallback(
    async (file: File, purpose: AiImageAssetPurpose): Promise<string | null> => {
      try {
        setUploadingPurpose(purpose);
        return await aiImageApi.uploadAsset(file, purpose);
      } catch (error) {
        message.error('이미지 업로드에 실패했습니다');
        console.error(error);
        return null;
      } finally {
        setUploadingPurpose(null);
      }
    },
    [],
  );

  const handleThumbnailUpload = useCallback(
    async (file: File): Promise<false> => {
      const objectKey = await uploadAsset(file, 'thumbnail');
      if (objectKey) {
        setThumbnailFileName(objectKey);
        // 저장 전에는 서버 URL 이 없으므로 로컬 파일로 즉시 보여준다
        setThumbnailPreview(URL.createObjectURL(file));
        message.success('썸네일이 업로드되었습니다');
      }
      return false;
    },
    [uploadAsset],
  );

  const handleReferenceUpload = useCallback(
    async (file: File): Promise<false> => {
      if (references.length >= MAX_REFERENCE_IMAGES) {
        message.warning(`레퍼런스는 최대 ${MAX_REFERENCE_IMAGES}장까지 등록할 수 있습니다`);
        return false;
      }
      const objectKey = await uploadAsset(file, 'reference');
      if (objectKey) {
        setReferences((prev) => [...prev, { objectKey, previewUrl: URL.createObjectURL(file) }]);
        message.success('레퍼런스 이미지가 추가되었습니다');
      }
      return false;
    },
    [uploadAsset, references.length],
  );

  const handleRemoveReference = useCallback((objectKey: string) => {
    setReferences((prev) => prev.filter((reference) => reference.objectKey !== objectKey));
  }, []);

  const handlePreviewSourceUpload = useCallback(
    async (file: File): Promise<false> => {
      const objectKey = await uploadAsset(file, 'source');
      if (objectKey) {
        setPreviewSourceKey(objectKey);
        setPreviewSourcePreview(URL.createObjectURL(file));
        setPreviewResult(null);
      }
      return false;
    },
    [uploadAsset],
  );

  /**
   * 저장하지 않고 프롬프트만 시험한다.
   * 생성 실패는 200 + isSuccess=false 로 오므로 예외가 아니라 결과로 다룬다.
   */
  const handlePreview = useCallback(async () => {
    const prompt = form.getFieldValue('prompt');
    if (!prompt) {
      message.error('프롬프트를 먼저 입력해주세요');
      return;
    }
    if (!previewSourceKey) {
      message.error('시험할 원본 사진을 업로드해주세요');
      return;
    }

    try {
      setPreviewing(true);
      setPreviewResult(null);
      const result = await aiImageApi.generatePreview({
        prompt,
        negativePrompt: form.getFieldValue('negativePrompt') || undefined,
        inputObjectKey: previewSourceKey,
        model: form.getFieldValue('model') || DEFAULT_MODEL,
        outputSize: form.getFieldValue('outputSize') || DEFAULT_OUTPUT_SIZE,
        postProcessType: form.getFieldValue('postProcessType') || PAWPONG_PIXEL_DEFAULTS.postProcessType,
        pixelSize: form.getFieldValue('pixelSize') || PAWPONG_PIXEL_DEFAULTS.pixelSize,
        paletteSize: form.getFieldValue('paletteSize') || PAWPONG_PIXEL_DEFAULTS.paletteSize,
        inputFidelity: form.getFieldValue('inputFidelity') || PAWPONG_PIXEL_DEFAULTS.inputFidelity,
        // 저장될 필터와 같은 조건으로 시험해야 미리보기가 실제 사용자 결과를 대변한다
        referenceImageObjectKeys: references.map((reference) => reference.objectKey),
      });

      setPreviewResult(result);
      if (result.isSuccess) {
        message.success(`미리보기 생성 완료 (${(result.latencyMs / 1000).toFixed(1)}초)`);
      } else {
        message.warning(`생성 실패: ${result.errorCode ?? '알 수 없는 오류'}`);
      }
    } catch (error) {
      // 여기까지 오면 에이전트 자체에 닿지 못한 경우다(503)
      message.error('AI Agent에 연결할 수 없습니다. 에이전트 상태를 확인해주세요.');
      console.error(error);
    } finally {
      setPreviewing(false);
    }
  }, [form, previewSourceKey, references]);

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();

      const payload: AiImageFilterRequest = {
        name: values.name,
        description: values.description || undefined,
        thumbnailFileName: thumbnailFileName || undefined,
        prompt: values.prompt,
        negativePrompt: values.negativePrompt || undefined,
        model: values.model || DEFAULT_MODEL,
        outputSize: values.outputSize || DEFAULT_OUTPUT_SIZE,
        referenceImageObjectKeys: references.map((reference) => reference.objectKey),
        postProcessType: values.postProcessType,
        pixelSize: values.pixelSize,
        paletteSize: values.paletteSize,
        inputFidelity: values.inputFidelity,
        isActive: values.isActive,
        sortOrder: Number(values.sortOrder) || 0,
      };

      if (editingFilter) {
        await aiImageApi.updateFilter(editingFilter.filterId, payload);
        message.success('AI 필터가 수정되었습니다');
      } else {
        await aiImageApi.createFilter(payload);
        message.success('AI 필터가 생성되었습니다');
      }

      closeModal();
      refetch();
    } catch (error) {
      // validateFields 실패는 폼이 자체 표시하므로 저장 실패만 알린다
      if (error && typeof error === 'object' && 'errorFields' in error) return;
      message.error('AI 필터 저장에 실패했습니다');
      console.error(error);
    }
  }, [form, thumbnailFileName, references, editingFilter, closeModal, refetch]);

  const handleDelete = useCallback(
    async (filterId: string) => {
      try {
        await aiImageApi.deleteFilter(filterId);
        message.success('AI 필터가 삭제되었습니다');
        refetch();
      } catch (error) {
        message.error('AI 필터 삭제에 실패했습니다');
        console.error(error);
      }
    },
    [refetch],
  );

  /**
   * 노출 여부 토글.
   * 진행 중인 작업은 생성 시점 스냅샷으로 돌기 때문에 여기서 꺼도 결과가 바뀌지 않는다.
   */
  const handleToggleActive = useCallback(
    async (filter: AiImageFilter) => {
      try {
        await aiImageApi.updateFilter(filter.filterId, { isActive: !filter.isActive });
        message.success(`필터가 ${!filter.isActive ? '활성화' : '비활성화'}되었습니다`);
        refetch();
      } catch (error) {
        message.error('필터 상태 변경에 실패했습니다');
        console.error(error);
      }
    },
    [refetch],
  );

  return {
    filters,
    loading,
    error,
    refetch,
    modal: {
      modalVisible,
      editingFilter,
      form,
      openCreate,
      openEdit,
      closeModal,
      handleSubmit,
    },
    assets: {
      uploadingPurpose,
      thumbnailPreview,
      references,
      handleThumbnailUpload,
      handleReferenceUpload,
      handleRemoveReference,
    },
    preview: {
      previewing,
      previewResult,
      previewSourcePreview,
      handlePreviewSourceUpload,
      handlePreview,
    },
    handleDelete,
    handleToggleActive,
  };
}
