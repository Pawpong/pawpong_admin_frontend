import React from 'react';
import { LoadError, Metric, PageHeading } from '../../shared/components/admin/PageHeading';
import { Alert, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { usePhoneWhitelistCrud } from '../../features/user/hooks/usePhoneWhitelistCrud';
import { PhoneWhitelistTable } from '../../features/user/ui/PhoneWhitelistTable';
import { PhoneWhitelistModal } from '../../features/user/ui/PhoneWhitelistModal';

/**
 * 전화번호 화이트리스트 관리 페이지
 */
const PhoneWhitelistPage: React.FC = () => {
  const { whitelist, loading, loadError, refetch, modal, handleDelete, handleToggleActive } = usePhoneWhitelistCrud();

  return (
    <div>
      <PageHeading
        title="전화번호 화이트리스트"
        description="중복 가입을 허용할 전화번호와 등록 사유, 활성 상태를 관리합니다."
        action={
          <Button type="primary" icon={<PlusOutlined />} onClick={modal.openCreate}>
            새 번호 추가
          </Button>
        }
      />
      <LoadError error={loadError} retry={refetch} />
      <Alert
        type="info"
        showIcon
        message="화이트리스트에 등록된 전화번호는 중복 가입이 허용됩니다. 테스트 계정이나 개발 목적으로 사용됩니다."
      />
      <div className="metric-grid metric-grid-single">
        <Metric label="등록된 번호" value={`${whitelist.length.toLocaleString()}개`} />
      </div>
      <PhoneWhitelistTable
        whitelist={whitelist}
        loading={loading}
        onEdit={modal.openEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
      />

      <PhoneWhitelistModal
        visible={modal.modalVisible}
        editingItem={modal.editingItem}
        form={modal.form}
        submitting={modal.submitting}
        onOk={modal.handleSubmit}
        onCancel={modal.closeModal}
      />
    </div>
  );
};

export default PhoneWhitelistPage;
