import { useCallback } from 'react';

import { districtApi } from '../api/districtApi';
import type { District, DistrictCreateRequest, DistrictUpdateRequest } from '../../../shared/types/api.types';
import { useListData, useCrudModal, useDeleteConfirm } from '../../../shared/hooks';

/**
 * 지역 CRUD 비즈니스 로직 훅
 */
export function useDistrictCrud() {
  const fetchDistricts = useCallback(() => districtApi.getAllDistricts(), []);
  const { data: districts, loading, refetch } = useListData<District>(fetchDistricts, '지역');

  const modal = useCrudModal<District>({
    entityName: '지역',
    createFn: (values) => {
      const createData: DistrictCreateRequest = {
        city: values.city as string,
        districts: parseCommaSeparated(values.districts as string),
      };
      return districtApi.createDistrict(createData);
    },
    updateFn: (item, values) => {
      const updateData: DistrictUpdateRequest = {
        city: values.city as string,
        districts: parseCommaSeparated(values.districts as string),
      };
      return districtApi.updateDistrict(item.id, updateData);
    },
    onSuccess: refetch,
    getFormValues: (district) => ({
      city: district.city,
      districts: district.districts.join(', '),
    }),
  });

  const handleDelete = useDeleteConfirm({
    deleteFn: (id: string) => districtApi.deleteDistrict(id),
    entityName: '지역',
    onSuccess: refetch,
  });

  return { districts, loading, modal, handleDelete };
}

function parseCommaSeparated(str: string): string[] {
  return str.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
}
