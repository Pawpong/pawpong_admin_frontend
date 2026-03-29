import { Button, Space } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';

import { useAlimtalkCrud } from '../../features/alimtalk/hooks/useAlimtalkCrud';
import { AlimtalkTable } from '../../features/alimtalk/ui/AlimtalkTable';
import { AlimtalkCreateModal } from '../../features/alimtalk/ui/AlimtalkCreateModal';
import { AlimtalkEditModal } from '../../features/alimtalk/ui/AlimtalkEditModal';
import { AlimtalkDetailModal } from '../../features/alimtalk/ui/AlimtalkDetailModal';

/**
 * 알림톡 템플릿 관리 페이지
 */
export default function AlimtalkTemplates() {
  const { templates, loading, refreshing, selectedTemplate, create, edit, detail, handleDelete, handleToggleActive, handleRefreshCache } = useAlimtalkCrud();

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>알림톡 템플릿 관리</h1>
          <p style={{ color: '#666', marginTop: '8px' }}>CoolSMS에서 검수 받은 알림톡 템플릿을 등록하고 관리합니다.</p>
        </div>
        <Space>
          <Button icon={<PlusOutlined />} onClick={create.open}>템플릿 등록</Button>
          <Button type="primary" icon={<ReloadOutlined />} onClick={handleRefreshCache} loading={refreshing}>새로고침</Button>
        </Space>
      </div>

      <AlimtalkTable
        templates={templates}
        loading={loading}
        onView={detail.open}
        onEdit={edit.open}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
      />

      <AlimtalkCreateModal
        visible={create.visible}
        form={create.form}
        onOk={() => create.form.submit()}
        onCancel={create.close}
      />

      <AlimtalkEditModal
        visible={edit.visible}
        form={edit.form}
        selectedTemplate={selectedTemplate}
        onOk={() => edit.form.submit()}
        onCancel={edit.close}
      />

      <AlimtalkDetailModal
        visible={detail.visible}
        template={selectedTemplate}
        onClose={detail.close}
      />
    </div>
  );
}
