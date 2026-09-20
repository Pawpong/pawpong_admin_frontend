import { Button, Space } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { PageHeading } from '../../shared/components/admin/PageHeading';

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
    <div>
      <PageHeading
        title="알림톡 템플릿 관리"
        description="알림톡 템플릿의 코드, 솔라피 ID, 검수 상태와 활성 여부를 관리합니다."
        action={
          <Space>
            <Button icon={<PlusOutlined />} onClick={create.open}>템플릿 등록</Button>
            <Button type="primary" icon={<ReloadOutlined />} onClick={handleRefreshCache} loading={refreshing}>
              새로고침
            </Button>
          </Space>
        }
      />

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
