import React from 'react';
import { Card, Button, Space, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { useBreedCrud } from '../../features/breed/hooks/useBreedCrud';
import { BreedTable } from '../../features/breed/ui/BreedTable';
import { BreedModal } from '../../features/breed/ui/BreedModal';

/**
 * 품종 관리 페이지
 * 강아지/고양이 품종 카테고리를 관리합니다.
 */
const Breeds: React.FC = () => {
  const { breeds, loading, modal, handleDelete } = useBreedCrud();

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <Space>
            <span style={{ fontSize: '18px', fontWeight: 600 }}>품종 관리</span>
            <Tag color="blue">{breeds.length}개</Tag>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={modal.openCreate}>
            새 품종 추가
          </Button>
        }
      >
        <BreedTable breeds={breeds} loading={loading} onEdit={modal.openEdit} onDelete={handleDelete} />
      </Card>

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
