import React from 'react';
import { Card, Button, Space, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { useDistrictCrud } from '../../features/district/hooks/useDistrictCrud';
import { DistrictTable } from '../../features/district/ui/DistrictTable';
import { DistrictModal } from '../../features/district/ui/DistrictModal';

/**
 * 지역 관리 페이지
 * 시/도 및 시/군/구 지역 데이터를 관리합니다.
 */
const Districts: React.FC = () => {
  const { districts, loading, modal, handleDelete } = useDistrictCrud();

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <Space>
            <span style={{ fontSize: '18px', fontWeight: 600 }}>지역 관리</span>
            <Tag color="blue">{districts.length}개</Tag>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={modal.openCreate}>
            새 지역 추가
          </Button>
        }
      >
        <DistrictTable districts={districts} loading={loading} onEdit={modal.openEdit} onDelete={handleDelete} />
      </Card>

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
