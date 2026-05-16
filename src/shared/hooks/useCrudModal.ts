import { useState, useCallback } from 'react';
import { Form, message } from 'antd';

/**
 * CRUD 모달 상태 관리 훅
 *
 * 생성/수정 모달의 공통 패턴을 추상화합니다.
 * - 모달 열기/닫기
 * - 폼 초기값 설정 (생성/수정 분기)
 * - 제출 처리 (API 호출 + 성공/실패 메시지)
 *
 * @example
 * const { modalVisible, editingItem, form, openCreate, openEdit, closeModal, handleSubmit } =
 *   useCrudModal<Breed>({
 *     entityName: '품종',
 *     createFn: (data) => breedApi.createBreed(data),
 *     updateFn: (item, data) => breedApi.updateBreed(item.id, data),
 *     onSuccess: refetch,
 *     createDefaults: { petType: 'dog' },
 *   });
 */
export interface UseCrudModalOptions<T> {
  /** 엔티티 이름 (메시지용) */
  entityName: string;
  /** 생성 API 호출 함수 */
  createFn: (data: Record<string, unknown>) => Promise<unknown>;
  /** 수정 API 호출 함수 */
  updateFn: (item: T, data: Record<string, unknown>) => Promise<unknown>;
  /** 성공 시 콜백 (보통 refetch) */
  onSuccess: () => void;
  /** 생성 모달 기본값 */
  createDefaults?: Record<string, unknown>;
  /** 수정 모달에서 폼에 설정할 값 추출 함수 */
  getFormValues?: (item: T) => Record<string, unknown>;
  /** 폼 제출 전 데이터 변환 함수 */
  transformSubmitData?: (values: Record<string, unknown>) => Record<string, unknown>;
}

export function useCrudModal<T>({
  entityName,
  createFn,
  updateFn,
  onSuccess,
  createDefaults = {},
  getFormValues,
  transformSubmitData,
}: UseCrudModalOptions<T>) {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const openCreate = useCallback(() => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue(createDefaults);
    setModalVisible(true);
  }, [form, createDefaults]);

  const openEdit = useCallback(
    (item: T) => {
      setEditingItem(item);
      const formValues = getFormValues ? getFormValues(item) : (item as Record<string, unknown>);
      form.setFieldsValue(formValues);
      setModalVisible(true);
    },
    [form, getFormValues],
  );

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setEditingItem(null);
    form.resetFields();
  }, [form]);

  const handleSubmit = useCallback(async () => {
    try {
      let values = await form.validateFields();
      if (transformSubmitData) {
        values = transformSubmitData(values);
      }

      setSubmitting(true);

      if (editingItem) {
        await updateFn(editingItem, values);
        message.success(`${entityName}이(가) 수정되었습니다.`);
      } else {
        await createFn(values);
        message.success(`${entityName}이(가) 생성되었습니다.`);
      }

      closeModal();
      onSuccess();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'errorFields' in error) {
        message.error('모든 필드를 올바르게 입력해주세요.');
      } else {
        console.error(`Failed to save ${entityName}:`, error);
        message.error(`${entityName} 저장에 실패했습니다.`);
      }
    } finally {
      setSubmitting(false);
    }
  }, [form, editingItem, entityName, createFn, updateFn, closeModal, onSuccess, transformSubmitData]);

  return {
    modalVisible,
    editingItem,
    submitting,
    form,
    openCreate,
    openEdit,
    closeModal,
    handleSubmit,
  };
}
