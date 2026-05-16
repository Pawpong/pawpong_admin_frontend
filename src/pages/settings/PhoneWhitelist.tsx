import React from 'react';
import { Card, Button, Space, Tag } from 'antd';
import { PlusOutlined, PhoneOutlined } from '@ant-design/icons';

import { usePhoneWhitelistCrud } from '../../features/user/hooks/usePhoneWhitelistCrud';
import { PhoneWhitelistTable } from '../../features/user/ui/PhoneWhitelistTable';
import { PhoneWhitelistModal } from '../../features/user/ui/PhoneWhitelistModal';

/**
 * 전화번호 화이트리스트 관리 페이지
 */
const PhoneWhitelistPage: React.FC = () => {
  const { whitelist, loading, modal, handleDelete, handleToggleActive } = usePhoneWhitelistCrud();

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <Card
        title={
          <Space wrap>
            <PhoneOutlined style={{ fontSize: '18px' }} />
            <span className="text-base sm:text-lg font-semibold">전화번호 화이트리스트</span>
            <Tag color="blue">{whitelist.length}개</Tag>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={modal.openCreate} className="text-xs sm:text-sm">
            새 번호 추가
          </Button>
        }
        styles={{ header: { flexWrap: 'wrap', gap: '8px' } }}
      >
        <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#f6f8fa' }}>
          <p className="m-0 text-xs sm:text-sm text-gray-600">
            화이트리스트에 등록된 전화번호는 <strong>중복 가입이 허용</strong>됩니다. 테스트 계정이나 개발 목적으로 사용됩니다.
          </p>
        </div>

        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <PhoneWhitelistTable
            whitelist={whitelist}
            loading={loading}
            onEdit={modal.openEdit}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
          />
        </div>
      </Card>

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
