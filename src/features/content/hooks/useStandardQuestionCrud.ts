import { useState, useCallback } from 'react';
import { Form, message } from 'antd';

import { standardQuestionApi } from '../api/standardQuestionApi';
import type {
  StandardQuestion,
  StandardQuestionUpdateRequest,
} from '../../../shared/types/api.types';
import { useListData } from '../../../shared/hooks';

/**
 * 표준 질문 CRUD 비즈니스 로직 훅
 * 질문 수정, 활성화 토글, 순서 변경, 초기화 기능을 제공합니다.
 */
export function useStandardQuestionCrud() {
  const fetchQuestions = useCallback(() => standardQuestionApi.getAllQuestions(), []);
  const { data: rawQuestions, loading, refetch } = useListData<StandardQuestion>(fetchQuestions, '표준 질문');

  // order 기준 정렬
  const questions = [...rawQuestions].sort((a, b) => a.order - b.order);

  // 수정 모달 상태
  const [modalVisible, setModalVisible] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<StandardQuestion | null>(null);
  const [form] = Form.useForm();

  // 순서 변경 모달 상태
  const [reorderModalVisible, setReorderModalVisible] = useState(false);
  const [reorderForm] = Form.useForm();

  const openEdit = useCallback(
    (question: StandardQuestion) => {
      setEditingQuestion(question);
      form.setFieldsValue({
        type: question.type,
        label: question.label,
        required: question.required,
        options: question.options?.join(', ') || '',
        placeholder: question.placeholder || '',
        description: question.description || '',
      });
      setModalVisible(true);
    },
    [form],
  );

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setEditingQuestion(null);
    form.resetFields();
  }, [form]);

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();

      if (!editingQuestion) {
        message.error('수정할 질문이 선택되지 않았습니다.');
        return;
      }

      const updateData: StandardQuestionUpdateRequest = {
        type: values.type as 'text' | 'textarea' | 'checkbox' | 'radio' | 'select',
        label: values.label as string,
        required: values.required as boolean,
        placeholder: (values.placeholder as string) || undefined,
        description: (values.description as string) || undefined,
      };

      // options 처리: select, radio, checkbox 타입일 때만
      if (['select', 'radio', 'checkbox'].includes(values.type)) {
        if (values.options && (values.options as string).trim()) {
          updateData.options = (values.options as string)
            .split(',')
            .map((opt: string) => opt.trim())
            .filter((opt: string) => opt.length > 0);
        }
      }

      await standardQuestionApi.updateQuestion(editingQuestion.id, updateData);
      message.success('질문이 수정되었습니다.');
      closeModal();
      refetch();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'errorFields' in error) {
        message.error('모든 필드를 올바르게 입력해주세요.');
      } else {
        console.error('Failed to update question:', error);
        message.error('질문 수정에 실패했습니다.');
      }
    }
  }, [form, editingQuestion, closeModal, refetch]);

  const handleToggleStatus = useCallback(
    async (question: StandardQuestion) => {
      try {
        await standardQuestionApi.toggleQuestionStatus(question.id, {
          isActive: !question.isActive,
        });
        message.success(`질문이 ${!question.isActive ? '활성화' : '비활성화'}되었습니다.`);
        refetch();
      } catch (error: unknown) {
        console.error('Failed to toggle question status:', error);
        message.error('질문 상태 변경에 실패했습니다.');
      }
    },
    [refetch],
  );

  // 순서 변경 모달
  const openReorder = useCallback(() => {
    const initialValues: Record<string, number> = {};
    questions.forEach((q) => {
      initialValues[q.id] = q.order;
    });
    reorderForm.setFieldsValue(initialValues);
    setReorderModalVisible(true);
  }, [questions, reorderForm]);

  const closeReorder = useCallback(() => {
    setReorderModalVisible(false);
  }, []);

  const handleReorderSubmit = useCallback(async () => {
    try {
      const values = await reorderForm.validateFields();
      const reorderData = Object.entries(values).map(([id, order]) => ({
        id,
        order: order as number,
      }));

      await standardQuestionApi.reorderQuestions({ reorderData });
      message.success('질문 순서가 변경되었습니다.');
      setReorderModalVisible(false);
      refetch();
    } catch (error: unknown) {
      console.error('Failed to reorder questions:', error);
      message.error('질문 순서 변경에 실패했습니다.');
    }
  }, [reorderForm, refetch]);

  // 초기화
  const handleReseed = useCallback(async () => {
    try {
      await standardQuestionApi.reseedQuestions();
      message.success('표준 질문이 초기화되었습니다.');
      refetch();
    } catch (error: unknown) {
      console.error('Failed to reseed questions:', error);
      message.error('표준 질문 초기화에 실패했습니다.');
    }
  }, [refetch]);

  return {
    questions,
    loading,
    // 수정 모달
    modal: {
      modalVisible,
      editingQuestion,
      form,
      openEdit,
      closeModal,
      handleSubmit,
    },
    // 순서 변경 모달
    reorder: {
      reorderModalVisible,
      reorderForm,
      openReorder,
      closeReorder,
      handleReorderSubmit,
    },
    handleToggleStatus,
    handleReseed,
  };
}
