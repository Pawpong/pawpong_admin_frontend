import React from 'react';
import { LoadError, Metric, PageHeading } from '../../shared/components/admin/PageHeading';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { useAppVersionCrud } from '../../features/app-version/hooks/useAppVersionCrud';
import { AppVersionTable } from '../../features/app-version/ui/AppVersionTable';
import { AppVersionModal } from '../../features/app-version/ui/AppVersionModal';

/**
 * 앱 버전 관리 페이지
 * iOS/Android 앱 강제/권장 업데이트 버전 정보를 관리합니다.
 */
const AppVersion: React.FC = () => {
  const { versions, loading, error, refetch, pagination, onPageChange, modal, handleDelete, handleToggleActive } = useAppVersionCrud();

  return (
    <div>
      <PageHeading
        title="앱 버전 관리"
        description="iOS·Android 플랫폼별 최신 버전과 최소 요구 버전, 활성 상태를 관리합니다."
        action={
          <Button type="primary" icon={<PlusOutlined />} onClick={modal.openCreate}>
            새 버전 추가
          </Button>
        }
      />
      <LoadError error={error} retry={refetch} />
      <div className="metric-grid metric-grid-single">
        <Metric label="등록된 버전" value={`${pagination.totalItems.toLocaleString()}개`} />
      </div>
      <AppVersionTable
        versions={versions}
        loading={loading}
        pagination={pagination}
        onPageChange={onPageChange}
        onEdit={modal.openEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
      />

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
