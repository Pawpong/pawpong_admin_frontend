import { Button } from 'antd';
import { LoadError, PageHeading } from '../../shared/components/admin/PageHeading';
import { PlusOutlined } from '@ant-design/icons';

import { useAnnouncementCrud } from '../../features/home/hooks/useAnnouncementCrud';
import { AnnouncementTable } from '../../features/home/ui/AnnouncementTable';
import { AnnouncementModal } from '../../features/home/ui/AnnouncementModal';

/**
 * 팝업/배너 공지 관리 페이지
 */
const Announcements = () => {
  const { announcements, loading, error, refetch, modal, handleDelete } = useAnnouncementCrud();

  return (
    <div>
      <PageHeading
        title="팝업 공지 관리"
        description="서비스 홈 팝업으로 띄울 공지의 제목, 내용, 노출 순서와 활성 상태를 관리합니다."
        action={
          <Button type="primary" icon={<PlusOutlined />} onClick={modal.openCreate}>
            팝업 공지 추가
          </Button>
        }
      />
      <LoadError error={error} retry={refetch} />
      <AnnouncementTable announcements={announcements} loading={loading} onEdit={modal.openEdit} onDelete={handleDelete} />

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
