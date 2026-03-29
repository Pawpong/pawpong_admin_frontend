import { useCallback } from 'react';

import { announcementApi } from '../api/announcementApi';
import type { Announcement, AnnouncementCreateRequest, AnnouncementUpdateRequest } from '../api/announcementApi';
import { useListData, useCrudModal, useDeleteConfirm } from '../../../shared/hooks';

/**
 * 팝업/배너 공지 CRUD 비즈니스 로직 훅
 */
export function useAnnouncementCrud() {
  const fetchAnnouncements = useCallback(async () => {
    const data = await announcementApi.getAnnouncements();
    return data.sort((a: Announcement, b: Announcement) => a.order - b.order);
  }, []);

  const { data: announcements, loading, refetch } = useListData<Announcement>(fetchAnnouncements, '공지사항');

  const modal = useCrudModal<Announcement>({
    entityName: '공지사항',
    createDefaults: { isActive: true, order: 0 },
    createFn: (values) => {
      const data: AnnouncementCreateRequest = { ...values } as AnnouncementCreateRequest;
      return announcementApi.createAnnouncement(data);
    },
    updateFn: (item, values) => {
      const data: AnnouncementUpdateRequest = { ...values } as AnnouncementUpdateRequest;
      return announcementApi.updateAnnouncement(item.announcementId, data);
    },
    onSuccess: refetch,
    getFormValues: (a) => ({
      title: a.title,
      content: a.content,
      order: a.order,
      isActive: a.isActive,
    }),
  });

  const handleDelete = useDeleteConfirm({
    deleteFn: (id: string) => announcementApi.deleteAnnouncement(id),
    entityName: '공지사항',
    onSuccess: refetch,
  });

  return { announcements, loading, modal, handleDelete };
}
