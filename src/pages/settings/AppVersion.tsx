import React from 'react';
import { Card, Button, Space, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { useAppVersionCrud } from '../../features/app-version/hooks/useAppVersionCrud';
import { AppVersionTable } from '../../features/app-version/ui/AppVersionTable';
import { AppVersionModal } from '../../features/app-version/ui/AppVersionModal';

/**
 * 앱 버전 관리 페이지
 * iOS/Android 앱 강제/권장 업데이트 버전 정보를 관리합니다.
 */
const AppVersion: React.FC = () => {
  const { versions, loading, pagination, onPageChange, modal, handleDelete, handleToggleActive } = useAppVersionCrud();

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <Space>
            <span style={{ fontSize: '18px', fontWeight: 600 }}>앱 버전 관리</span>
            <Tag color="blue">{pagination.totalItems}개</Tag>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={modal.openCreate}>
            새 버전 추가
          </Button>
        }
      >
        <AppVersionTable
          versions={versions}
          loading={loading}
          pagination={pagination}
          onPageChange={onPageChange}
          onEdit={modal.openEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
        />
      </Card>

      <AppVersionModal
        visible={modal.modalVisible}
        editingVersion={modal.editingItem}
        form={modal.form}
        submitting={modal.submitting}
        onOk={modal.handleSubmit}
        onCancel={modal.closeModal}
      />
    </div>
  );
};

export default AppVersion;
