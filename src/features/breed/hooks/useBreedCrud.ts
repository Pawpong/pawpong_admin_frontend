import { useCallback } from 'react';

import { breedApi } from '../api/breedApi';
import type { BreedCreateRequest, BreedUpdateRequest } from '../../../shared/types/api.types';
import { useListData, useCrudModal, useDeleteConfirm } from '../../../shared/hooks';
import type { Breed } from '../../../shared/types/api.types';

/**
 * 품종 CRUD 비즈니스 로직 훅
 * 페이지에서 사용할 모든 상태와 핸들러를 제공합니다.
 */
export function useBreedCrud() {
  const fetchBreeds = useCallback(() => breedApi.getAllBreeds(), []);
  const { data: breeds, loading, refetch } = useListData<Breed>(fetchBreeds, '품종');

  const modal = useCrudModal<Breed>({
    entityName: '품종',
    createDefaults: { petType: 'dog' },
    createFn: (values) => {
      const breedsArray = parseBreedsString(values.breeds as string);
      const createData: BreedCreateRequest = {
        petType: values.petType as 'dog' | 'cat',
        category: values.category as string,
        categoryDescription: (values.categoryDescription as string) || undefined,
        breeds: breedsArray,
      };
      return breedApi.createBreed(createData);
    },
    updateFn: (item, values) => {
      const breedsArray = parseBreedsString(values.breeds as string);
      const updateData: BreedUpdateRequest = {
        category: values.category as string,
        categoryDescription: (values.categoryDescription as string) || undefined,
        breeds: breedsArray,
      };
      return breedApi.updateBreed(item.id, updateData);
    },
    onSuccess: refetch,
    getFormValues: (breed) => ({
      petType: breed.petType,
      category: breed.category,
      categoryDescription: breed.categoryDescription || '',
      breeds: breed.breeds.join(', '),
    }),
  });

  const handleDelete = useDeleteConfirm({
    deleteFn: (id: string) => breedApi.deleteBreed(id),
    entityName: '품종',
    onSuccess: refetch,
  });

  return { breeds, loading, modal, handleDelete };
}

/** 쉼표로 구분된 문자열을 배열로 변환 */
function parseBreedsString(str: string): string[] {
  return str
    .split(',')
    .map((b) => b.trim())
    .filter((b) => b.length > 0);
}
