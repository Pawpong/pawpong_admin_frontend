import { useCallback } from 'react';
import { message } from 'antd';

import { appVersionApi } from '../api/appVersionApi';
import type { AppVersion, AppVersionCreateRequest, AppVersionUpdateRequest } from '../api/appVersionApi';
import { usePaginatedData, useCrudModal, useDeleteConfirm } from '../../../shared/hooks';

/**
 * 앱 버전 CRUD 비즈니스 로직 훅
 */
export function useAppVersionCrud() {
  const fetchVersions = useCallback(
    (page: number, pageSize: number) => appVersionApi.getAppVersions(page, pageSize),
    [],
  );

  const { data: versions, loading, pagination, onPageChange, refetch } = usePaginatedData<AppVersion>(
    fetchVersions,
    '앱 버전',
  );

  const modal = useCrudModal<AppVersion>({
    entityName: '앱 버전',
    createDefaults: { platform: 'ios', isActive: true },
    createFn: (values) => {
      const createData: AppVersionCreateRequest = {
        platform: values.platform as 'ios' | 'android',
        latestVersion: values.latestVersion as string,
        minRequiredVersion: values.minRequiredVersion as string,
        forceUpdateMessage: values.forceUpdateMessage as string,
        recommendUpdateMessage: values.recommendUpdateMessage as string,
        iosStoreUrl: values.iosStoreUrl as string,
        androidStoreUrl: values.androidStoreUrl as string,
        isActive: values.isActive as boolean ?? true,
      };
      return appVersionApi.createAppVersion(createData);
    },
    updateFn: (item, values) => {
      const updateData: AppVersionUpdateRequest = {
        latestVersion: values.latestVersion as string,
        minRequiredVersion: values.minRequiredVersion as string,
        forceUpdateMessage: values.forceUpdateMessage as string,
        recommendUpdateMessage: values.recommendUpdateMessage as string,
        iosStoreUrl: values.iosStoreUrl as string,
        androidStoreUrl: values.androidStoreUrl as string,
        isActive: values.isActive as boolean,
      };
      return appVersionApi.updateAppVersion(item.appVersionId, updateData);
    },
    onSuccess: refetch,
    getFormValues: (item) => ({
      platform: item.platform,
      latestVersion: item.latestVersion,
      minRequiredVersion: item.minRequiredVersion,
      forceUpdateMessage: item.forceUpdateMessage,
      recommendUpdateMessage: item.recommendUpdateMessage,
      iosStoreUrl: item.iosStoreUrl,
      androidStoreUrl: item.androidStoreUrl,
      isActive: item.isActive,
    }),
  });

  const handleDelete = useDeleteConfirm({
    deleteFn: (id: string) => appVersionApi.deleteAppVersion(id),
    entityName: '앱 버전',
    onSuccess: refetch,
  });

  const handleToggleActive = useCallback(
    async (record: AppVersion) => {
      try {
        await appVersionApi.updateAppVersion(record.appVersionId, { isActive: !record.isActive });
        message.success(`앱 버전이 ${!record.isActive ? '활성화' : '비활성화'}되었습니다.`);
        refetch();
      } catch (error: unknown) {
        console.error('Failed to toggle app version:', error);
        message.error('상태 변경에 실패했습니다.');
      }
    },
    [refetch],
  );

  return { versions, loading, pagination, onPageChange, modal, handleDelete, handleToggleActive };
}
