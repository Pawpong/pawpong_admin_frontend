import { useState, useEffect, useCallback } from 'react';
import { Form, message } from 'antd';

import { alimtalkApi } from '../api/alimtalkApi';
import type { AlimtalkTemplate, AlimtalkTemplateCreateRequest } from '../../../shared/types/api.types';

/**
 * 알림톡 템플릿 CRUD 비즈니스 로직 훅
 */
export function useAlimtalkCrud() {
  const [templates, setTemplates] = useState<AlimtalkTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /* 생성 모달 */
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createForm] = Form.useForm();

  /* 수정 모달 */
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();

  /* 상세/수정 대상 */
  const [selectedTemplate, setSelectedTemplate] = useState<AlimtalkTemplate | null>(null);

  /* 상세 모달 */
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const data = await alimtalkApi.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('템플릿 목록 조회 실패:', error);
      message.error('템플릿 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  /* 생성 */
  const openCreate = useCallback(() => {
    createForm.resetFields();
    createForm.setFieldsValue({ fallbackToSms: true, isActive: true, reviewStatus: 'approved', requiredVariables: [] });
    setCreateModalVisible(true);
  }, [createForm]);

  const handleCreate = useCallback(async (values: Record<string, unknown>) => {
    try {
      const createData: AlimtalkTemplateCreateRequest = {
        templateCode: values.templateCode as string,
        templateId: values.templateId as string,
        name: values.name as string,
        description: values.description as string | undefined,
        requiredVariables: (values.requiredVariables as string[]) || [],
        fallbackToSms: values.fallbackToSms as boolean,
        isActive: values.isActive as boolean,
        reviewStatus: values.reviewStatus as AlimtalkTemplateCreateRequest['reviewStatus'],
        memo: values.memo as string | undefined,
      };
      await alimtalkApi.createTemplate(createData);
      message.success('템플릿이 생성되었습니다.');
      setCreateModalVisible(false);
      createForm.resetFields();
      fetchTemplates();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || '템플릿 생성에 실패했습니다.');
    }
  }, [createForm, fetchTemplates]);

  const closeCreate = useCallback(() => {
    setCreateModalVisible(false);
    createForm.resetFields();
  }, [createForm]);

  /* 수정 */
  const openEdit = useCallback((template: AlimtalkTemplate) => {
    setSelectedTemplate(template);
    editForm.setFieldsValue({
      templateId: template.templateId,
      isActive: template.isActive,
      memo: template.memo || '',
      reviewStatus: template.reviewStatus,
    });
    setEditModalVisible(true);
  }, [editForm]);

  const handleUpdate = useCallback(async (values: Record<string, unknown>) => {
    if (!selectedTemplate) return;
    try {
      await alimtalkApi.updateTemplate(selectedTemplate.templateCode, {
        templateId: values.templateId as string,
        isActive: values.isActive as boolean,
        memo: values.memo as string,
        reviewStatus: values.reviewStatus as 'pending' | 'approved' | 'rejected' | 're_review',
      });
      message.success('템플릿이 수정되었습니다.');
      setEditModalVisible(false);
      editForm.resetFields();
      fetchTemplates();
    } catch (error) {
      console.error('템플릿 수정 실패:', error);
      message.error('템플릿 수정에 실패했습니다.');
    }
  }, [selectedTemplate, editForm, fetchTemplates]);

  const closeEdit = useCallback(() => {
    setEditModalVisible(false);
    editForm.resetFields();
  }, [editForm]);

  /* 상세 */
  const openDetail = useCallback(async (templateCode: string) => {
    try {
      const template = await alimtalkApi.getTemplateByCode(templateCode);
      setSelectedTemplate(template);
      setDetailModalVisible(true);
    } catch (error) {
      console.error('템플릿 상세 조회 실패:', error);
      message.error('템플릿 상세 정보를 불러오는데 실패했습니다.');
    }
  }, []);

  const closeDetail = useCallback(() => { setDetailModalVisible(false); }, []);

  /* 삭제 */
  const handleDelete = useCallback(async (templateCode: string) => {
    try {
      await alimtalkApi.deleteTemplate(templateCode);
      message.success('템플릿이 삭제되었습니다.');
      fetchTemplates();
    } catch (error) {
      console.error('템플릿 삭제 실패:', error);
      message.error('템플릿 삭제에 실패했습니다.');
    }
  }, [fetchTemplates]);

  /* 인라인 토글 */
  const handleToggleActive = useCallback(async (template: AlimtalkTemplate) => {
    try {
      await alimtalkApi.updateTemplate(template.templateCode, { isActive: !template.isActive });
      message.success(template.isActive ? '비활성화되었습니다.' : '활성화되었습니다.');
      fetchTemplates();
    } catch (error) {
      message.error('상태 변경에 실패했습니다.');
    }
  }, [fetchTemplates]);

  /* 캐시 새로고침 */
  const handleRefreshCache = useCallback(async () => {
    setRefreshing(true);
    try {
      await alimtalkApi.refreshCache();
      message.success('캐시가 새로고침되었습니다.');
      await fetchTemplates();
    } catch (error) {
      console.error('캐시 새로고침 실패:', error);
      message.error('캐시 새로고침에 실패했습니다.');
    } finally {
      setRefreshing(false);
    }
  }, [fetchTemplates]);

  return {
    templates, loading, refreshing, selectedTemplate,
    create: { visible: createModalVisible, form: createForm, open: openCreate, close: closeCreate, submit: handleCreate },
    edit: { visible: editModalVisible, form: editForm, open: openEdit, close: closeEdit, submit: handleUpdate },
    detail: { visible: detailModalVisible, open: openDetail, close: closeDetail },
    handleDelete, handleToggleActive, handleRefreshCache,
  };
}
