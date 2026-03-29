import { useCallback } from 'react';

import { contentApi } from '../api/contentApi';
import type { FAQ, FaqCreateRequest, FaqUpdateRequest } from '../../../shared/types/api.types';
import { useListData, useCrudModal, useDeleteConfirm } from '../../../shared/hooks';

/**
 * FAQ CRUD 비즈니스 로직 훅
 */
export function useFaqCrud() {
  const fetchFaqs = useCallback(async () => {
    const data = await contentApi.getFaqs();
    return data.sort((a: FAQ, b: FAQ) => a.order - b.order);
  }, []);

  const { data: faqs, loading, refetch } = useListData<FAQ>(fetchFaqs, 'FAQ');

  const modal = useCrudModal<FAQ>({
    entityName: 'FAQ',
    createDefaults: { isActive: true, order: 0, userType: 'both' },
    createFn: (values) => {
      const data: FaqCreateRequest = {
        question: values.question as string,
        answer: values.answer as string,
        category: values.category as FaqCreateRequest['category'],
        userType: values.userType as FaqCreateRequest['userType'],
        order: values.order as number,
        isActive: values.isActive as boolean,
      };
      return contentApi.createFaq(data);
    },
    updateFn: (item, values) => {
      const data: FaqUpdateRequest = {
        question: values.question as string,
        answer: values.answer as string,
        category: values.category as FaqUpdateRequest['category'],
        userType: values.userType as FaqUpdateRequest['userType'],
        order: values.order as number,
        isActive: values.isActive as boolean,
      };
      return contentApi.updateFaq(item.faqId, data);
    },
    onSuccess: refetch,
    getFormValues: (faq) => ({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      userType: faq.userType,
      order: faq.order,
      isActive: faq.isActive !== false,
    }),
  });

  const handleDelete = useDeleteConfirm({
    deleteFn: (id: string) => contentApi.deleteFaq(id),
    entityName: 'FAQ',
    onSuccess: refetch,
  });

  return { faqs, loading, modal, handleDelete };
}
