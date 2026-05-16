import { useCallback } from 'react';
import { message } from 'antd';

/**
 * 삭제 처리 훅
 *
 * Popconfirm의 onConfirm에 바로 전달 가능한 삭제 핸들러를 생성합니다.
 *
 * @example
 * const handleDelete = useDeleteConfirm({
 *   deleteFn: (id) => breedApi.deleteBreed(id),
 *   entityName: '품종',
 *   onSuccess: refetch,
 * });
 *
 * // Popconfirm에서:
 * <Popconfirm onConfirm={() => handleDelete(record.id)}>삭제</Popconfirm>
 */
export function useDeleteConfirm<IdType = string>({
  deleteFn,
  entityName,
  onSuccess,
}: {
  deleteFn: (id: IdType) => Promise<void>;
  entityName: string;
  onSuccess: () => void;
}) {
  return useCallback(
    async (id: IdType) => {
      try {
        await deleteFn(id);
        message.success(`${entityName}이(가) 삭제되었습니다.`);
        onSuccess();
      } catch (error: unknown) {
        console.error(`Failed to delete ${entityName}:`, error);
        message.error(`${entityName} 삭제에 실패했습니다.`);
      }
    },
    [deleteFn, entityName, onSuccess],
  );
}
