import { useCallback, useState } from 'react';
import { App, Form } from 'antd';
import { isAxiosError } from 'axios';
import { deepLinkApi, type DeepLink, type DeepLinkCreateRequest } from '../api/deepLinkApi';
import { usePaginatedData } from '../../../shared/hooks/usePaginatedData';

export function useDeepLinkCrud() {
  const { message } = App.useApp();
  const list = usePaginatedData(
    useCallback((page, limit) => deepLinkApi.getDeepLinks(page, limit), []),
    '딥링크',
  );
  const [form] = Form.useForm<DeepLinkCreateRequest>();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DeepLink | null>(null);
  const [saving, setSaving] = useState(false);
  const [changingId, setChangingId] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ targetPath: '/', description: '', imageUrl: '', isActive: true });
    setOpen(true);
  };
  const openEdit = (item: DeepLink) => {
    setEditing(item);
    form.resetFields();
    form.setFieldsValue(item);
    setOpen(true);
  };
  const showError = (error: unknown) => {
    const detail = isAxiosError(error) ? error.response?.data?.message : undefined;
    void message.error(
      Array.isArray(detail)
        ? detail.join(' / ')
        : typeof detail === 'string'
          ? detail
          : '딥링크 저장에 실패했습니다. 다시 시도해주세요.',
    );
  };
  const save = async () => {
    if (saving) return;
    let values: DeepLinkCreateRequest;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    setSaving(true);
    try {
      const payload: DeepLinkCreateRequest = {
        slug: values.slug?.trim() || undefined,
        title: values.title.trim(),
        description: values.description?.trim() || '',
        targetPath: values.targetPath.trim(),
        imageUrl: values.imageUrl?.trim() || '',
        isActive: values.isActive ?? true,
      };
      if (editing) await deepLinkApi.updateDeepLink(editing.id, payload);
      else await deepLinkApi.createDeepLink(payload);
      void message.success(`딥링크를 ${editing ? '수정' : '생성'}했습니다.`);
      setOpen(false);
      list.refetch();
    } catch (error) {
      showError(error);
    } finally {
      setSaving(false);
    }
  };
  const toggleActive = async (item: DeepLink) => {
    if (changingId) return;
    setChangingId(item.id);
    try {
      await deepLinkApi.updateDeepLink(item.id, { isActive: !item.isActive });
      void message.success(`딥링크를 ${item.isActive ? '비활성화' : '활성화'}했습니다.`);
      list.refetch();
    } catch (error) {
      showError(error);
    } finally {
      setChangingId(null);
    }
  };
  const remove = async (item: DeepLink) => {
    if (changingId) return;
    setChangingId(item.id);
    try {
      await deepLinkApi.deleteDeepLink(item.id);
      void message.success('딥링크를 삭제했습니다.');
      if (list.data.length === 1 && list.pagination.currentPage > 1) {
        list.onPageChange(list.pagination.currentPage - 1, list.pagination.pageSize);
      } else list.refetch();
    } catch (error) {
      showError(error);
    } finally {
      setChangingId(null);
    }
  };
  return {
    ...list,
    form,
    open,
    editing,
    saving,
    changingId,
    openCreate,
    openEdit,
    close: () => setOpen(false),
    save,
    toggleActive,
    remove,
  };
}
