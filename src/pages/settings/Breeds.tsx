import React from 'react';
import { LoadError, Metric, PageHeading } from '../../shared/components/admin/PageHeading';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { useBreedCrud } from '../../features/breed/hooks/useBreedCrud';
import { BreedTable } from '../../features/breed/ui/BreedTable';
import { BreedModal } from '../../features/breed/ui/BreedModal';

/**
 * 품종 관리 페이지
 * 강아지/고양이 품종 카테고리를 관리합니다.
 */
const Breeds: React.FC = () => {
  const { breeds, loading, error, refetch, modal, handleDelete } = useBreedCrud();

  return (
    <div>
      <PageHeading
        title="품종 관리"
        description="강아지·고양이 품종 카테고리와 카테고리에 속한 품종 목록을 관리합니다."
        action={
          <Button type="primary" icon={<PlusOutlined />} onClick={modal.openCreate}>
            새 품종 추가
          </Button>
        }
      />
      <LoadError error={error} retry={refetch} />
      <div className="metric-grid metric-grid-single">
        <Metric label="등록된 카테고리" value={`${breeds.length.toLocaleString()}개`} />
      </div>
      <BreedTable breeds={breeds} loading={loading} onEdit={modal.openEdit} onDelete={handleDelete} />

      <BreedModal
        visible={modal.modalVisible}
        editingBreed={modal.editingItem}
        form={modal.form}
        submitting={modal.submitting}
        onOk={modal.handleSubmit}
        onCancel={modal.closeModal}
      />
    </div>
  );
};

export default Breeds;
