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
 * AI 필터 CRUD + 프롬프트 미리보기 훅.
 *
 * 썸네일·레퍼런스·미리보기 원본은 모두 presigned URL 로 버킷에 직접 올리고
 * 파일키만 폼에 들고 있는다. 서버가 이미지 바이트를 중계하지 않는다.
 */
export function useAiImageFilterCrud() {
  const fetchFilters = useCallback(() => aiImageApi.getFilters(), []);
  const { data: rawFilters, loading, refetch } = useListData<AiImageFilter>(fetchFilters, 'AI 필터');

  const filters = [...rawFilters].sort((a, b) => a.sortOrder - b.sortOrder);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingFilter, setEditingFilter] = useState<AiImageFilter | null>(null);
  const [form] = Form.useForm();

  // 애셋 상태 — 파일키는 저장에 쓰고, 미리보기 URL 은 화면 표시에만 쓴다
  const [uploadingPurpose, setUploadingPurpose] = useState<AiImageAssetPurpose | null>(null);
  const [thumbnailFileName, setThumbnailFileName] = useState<string>('');
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [referenceKeys, setReferenceKeys] = useState<string[]>([]);

  // 프롬프트 시험 상태
  const [previewSourceKey, setPreviewSourceKey] = useState<string>('');
  const [previewSourcePreview, setPreviewSourcePreview] = useState<string>('');
  const [previewing, setPreviewing] = useState(false);
  const [previewResult, setPreviewResult] = useState<AiImagePreviewResult | null>(null);

  const resetAssetState = useCallback(() => {
    setThumbnailFileName('');
    setThumbnailPreview('');
    setReferenceKeys([]);
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
      postProcessType: 'pixelate',
      pixelSize: 96,
      paletteSize: 48,
    });
    setModalVisible(true);
  }, [form, filters.length, resetAssetState]);

  const openEdit = useCallback(
    (filter: AiImageFilter) => {
      setEditingFilter(filter);
      resetAssetState();
      setThumbnailFileName(filter.thumbnailFileName || '');
      setThumbnailPreview(filter.thumbnailUrl || '');
      setReferenceKeys(filter.referenceImageObjectKeys || []);
      form.setFieldsValue({
        name: filter.name,
        description: filter.description,
        prompt: filter.prompt,
        negativePrompt: filter.negativePrompt,
        model: filter.model,
        outputSize: filter.outputSize,
        isActive: filter.isActive,
        sortOrder: filter.sortOrder,
        postProcessType: 'pixelate',
        pixelSize: 96,
        paletteSize: 48,
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
      const objectKey = await uploadAsset(file, 'reference');
      if (objectKey) {
        setReferenceKeys((prev) => [...prev, objectKey]);
        message.success('레퍼런스 이미지가 추가되었습니다');
      }
      return false;
    },
    [uploadAsset],
  );

  const handleRemoveReference = useCallback((objectKey: string) => {
    setReferenceKeys((prev) => prev.filter((key) => key !== objectKey));
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
        postProcessType: form.getFieldValue('postProcessType') || 'pixelate',
        pixelSize: form.getFieldValue('pixelSize') || 96,
        paletteSize: form.getFieldValue('paletteSize') || 48,
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
  }, [form, previewSourceKey]);

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
        referenceImageObjectKeys: referenceKeys,
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
  }, [form, thumbnailFileName, referenceKeys, editingFilter, closeModal, refetch]);

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
      referenceKeys,
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
