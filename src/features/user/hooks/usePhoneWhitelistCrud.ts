import { useCallback, useState, useEffect } from 'react';
import { message } from 'antd';

import { userApi } from '../api/userApi';
import type { PhoneWhitelist, PhoneWhitelistCreateRequest, PhoneWhitelistUpdateRequest } from '../../../shared/types/api.types';
import { useCrudModal, useDeleteConfirm } from '../../../shared/hooks';

/**
 * 전화번호 화이트리스트 CRUD 비즈니스 로직 훅
 */
export function usePhoneWhitelistCrud() {
  const [whitelist, setWhitelist] = useState<PhoneWhitelist[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWhitelist = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userApi.getPhoneWhitelist();
      if (data && Array.isArray(data.items)) {
        setWhitelist(data.items);
      } else {
        setWhitelist([]);
        message.warning('화이트리스트 데이터 형식이 올바르지 않습니다.');
      }
    } catch (error: unknown) {
      console.error('Failed to fetch phone whitelist:', error);
      setWhitelist([]);
      message.error('화이트리스트를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWhitelist(); }, [fetchWhitelist]);

  const modal = useCrudModal<PhoneWhitelist>({
    entityName: '화이트리스트',
    createFn: (values) => {
      const data: PhoneWhitelistCreateRequest = {
        phoneNumber: (values.phoneNumber as string).replace(/-/g, ''),
        description: values.description as string,
      };
      return userApi.addPhoneWhitelist(data);
    },
    updateFn: (item, values) => {
      const data: PhoneWhitelistUpdateRequest = {
        description: values.description as string,
        isActive: values.isActive as boolean,
      };
      return userApi.updatePhoneWhitelist(item.id, data);
    },
    onSuccess: fetchWhitelist,
    getFormValues: (item) => ({
      phoneNumber: item.phoneNumber,
      description: item.description,
      isActive: item.isActive,
    }),
  });

  const handleDelete = useDeleteConfirm({
    deleteFn: (id: string) => userApi.deletePhoneWhitelist(id),
    entityName: '화이트리스트',
    onSuccess: fetchWhitelist,
  });

  const handleToggleActive = useCallback(async (item: PhoneWhitelist) => {
    try {
      await userApi.updatePhoneWhitelist(item.id, { isActive: !item.isActive });
      message.success(item.isActive ? '비활성화되었습니다.' : '활성화되었습니다.');
      fetchWhitelist();
    } catch (error: unknown) {
      console.error('Failed to toggle active status:', error);
      message.error('상태 변경에 실패했습니다.');
    }
  }, [fetchWhitelist]);

  return { whitelist, loading, modal, handleDelete, handleToggleActive };
}

/** 전화번호 포맷팅 (010-1234-5678 형식) */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}
