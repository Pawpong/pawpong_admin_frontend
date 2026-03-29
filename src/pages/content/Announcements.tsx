import { Card, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { useAnnouncementCrud } from '../../features/home/hooks/useAnnouncementCrud';
import { AnnouncementTable } from '../../features/home/ui/AnnouncementTable';
import { AnnouncementModal } from '../../features/home/ui/AnnouncementModal';

/**
 * 팝업/배너 공지 관리 페이지
 */
const Announcements = () => {
  const { announcements, loading, modal, handleDelete } = useAnnouncementCrud();

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>공지사항 관리</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={modal.openCreate}>
          공지사항 추가
        </Button>
      </div>

      <Card>
        <AnnouncementTable announcements={announcements} loading={loading} onEdit={modal.openEdit} onDelete={handleDelete} />
      </Card>

      <AnnouncementModal
        visible={modal.modalVisible}
        editingAnnouncement={modal.editingItem}
        form={modal.form}
        submitting={modal.submitting}
        onOk={modal.handleSubmit}
        onCancel={modal.closeModal}
      />
    </div>
  );
};

export default Announcements;
