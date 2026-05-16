import { useState, useCallback } from 'react';
import { Form, message } from 'antd';
import dayjs from 'dayjs';

import { noticeApi } from '../api/noticeApi';
import type { Notice, NoticeCreateRequest, NoticeUpdateRequest } from '../api/noticeApi';
import { useDeleteConfirm } from '../../../shared/hooks';

/**
 * 공지사항 CRUD 비즈니스 로직 훅
 * 서버 페이지네이션 + 상태 필터 + 상세 보기 모달 지원
 */
export function useNoticeCrud() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState<'published' | 'draft' | 'archived' | undefined>(undefined);
  const limit = 10;

  /* 생성/수정 모달 */
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [form] = Form.useForm();

  /* 상세 보기 모달 */
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [viewingNotice, setViewingNotice] = useState<Notice | null>(null);

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await noticeApi.getNotices(currentPage, limit, statusFilter);
      setNotices(response.data.items);
      setTotalItems(response.data.pagination.totalItems);
    } catch (error) {
      message.error('공지사항 목록 조회 실패');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter]);

  const openCreate = useCallback(() => {
    setEditingNotice(null);
    form.resetFields();
    form.setFieldsValue({ status: 'published', isPinned: false });
    setModalVisible(true);
  }, [form]);

  const openEdit = useCallback((notice: Notice) => {
    setEditingNotice(notice);
    form.setFieldsValue({
      title: notice.title,
      content: notice.content,
      status: notice.status,
      isPinned: notice.isPinned,
      publishedAt: notice.publishedAt ? dayjs(notice.publishedAt) : null,
      expiredAt: notice.expiredAt ? dayjs(notice.expiredAt) : null,
    });
    setModalVisible(true);
  }, [form]);

  const openDetail = useCallback((notice: Notice) => {
    setViewingNotice(notice);
    setDetailModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    form.resetFields();
    setEditingNotice(null);
  }, [form]);

  const closeDetail = useCallback(() => {
    setDetailModalVisible(false);
    setViewingNotice(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      const submitData = {
        title: values.title,
        content: values.content,
        status: values.status || 'published',
        isPinned: values.isPinned || false,
        publishedAt: values.publishedAt ? values.publishedAt.toISOString() : undefined,
        expiredAt: values.expiredAt ? values.expiredAt.toISOString() : undefined,
      };

      if (editingNotice) {
        await noticeApi.updateNotice(editingNotice.noticeId, submitData as NoticeUpdateRequest);
        message.success('공지사항이 수정되었습니다');
      } else {
        await noticeApi.createNotice(submitData as NoticeCreateRequest);
        message.success('공지사항이 생성되었습니다');
      }

      closeModal();
      fetchNotices();
    } catch (error) {
      message.error(editingNotice ? '공지사항 수정 실패' : '공지사항 생성 실패');
      console.error(error);
    }
  }, [form, editingNotice, closeModal, fetchNotices]);

  const handleDelete = useDeleteConfirm({
    deleteFn: (id: string) => noticeApi.deleteNotice(id),
    entityName: '공지사항',
    onSuccess: fetchNotices,
  });

  const handleFilterChange = useCallback((value: 'published' | 'draft' | 'archived' | undefined) => {
    setStatusFilter(value);
    setCurrentPage(1);
  }, []);

  return {
    notices,
    loading,
    currentPage,
    totalItems,
    limit,
    statusFilter,
    setCurrentPage,
    handleFilterChange,
    fetchNotices,
    /* 생성/수정 모달 */
    modal: { modalVisible, editingNotice, form, openCreate, openEdit, closeModal, handleSubmit },
    /* 상세 보기 모달 */
    detail: { detailModalVisible, viewingNotice, openDetail, closeDetail },
    handleDelete,
  };
}
