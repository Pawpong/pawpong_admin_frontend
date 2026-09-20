import React from 'react';
import { LoadError, Metric, PageHeading } from '../../shared/components/admin/PageHeading';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { useDistrictCrud } from '../../features/district/hooks/useDistrictCrud';
import { DistrictTable } from '../../features/district/ui/DistrictTable';
import { DistrictModal } from '../../features/district/ui/DistrictModal';

/**
 * 지역 관리 페이지
 * 시/도 및 시/군/구 지역 데이터를 관리합니다.
 */
const Districts: React.FC = () => {
  const { districts, loading, error, refetch, modal, handleDelete } = useDistrictCrud();

  return (
    <div>
      <PageHeading
        title="지역 관리"
        description="브리더 검색에 쓰는 시·도와 그 아래 시·군·구 목록을 관리합니다."
        action={
          <Button type="primary" icon={<PlusOutlined />} onClick={modal.openCreate}>
            새 지역 추가
          </Button>
        }
      />
      <LoadError error={error} retry={refetch} />
      <div className="metric-grid metric-grid-single">
        <Metric label="등록된 시·도" value={`${districts.length.toLocaleString()}개`} />
      </div>
      <DistrictTable districts={districts} loading={loading} onEdit={modal.openEdit} onDelete={handleDelete} />

      <DistrictModal
        visible={modal.modalVisible}
        editingDistrict={modal.editingItem}
        form={modal.form}
        submitting={modal.submitting}
        onOk={modal.handleSubmit}
        onCancel={modal.closeModal}
      />
    </div>
  );
};

export default Districts;
