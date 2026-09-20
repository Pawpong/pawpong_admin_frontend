import { Button } from 'antd';
import { LoadError, PageHeading } from '../../shared/components/admin/PageHeading';
import { PlusOutlined } from '@ant-design/icons';

import { useCounselBannerCrud } from '../../features/banner/hooks/useCounselBannerCrud';
import { CounselBannerTable } from '../../features/banner/ui/CounselBannerTable';
import { CounselBannerModal } from '../../features/banner/ui/CounselBannerModal';

/**
 * 상담 배너 관리 페이지
 * 상담 신청 페이지에 표시될 배너를 관리합니다.
 */
const CounselBanners = () => {
  const { banners, loading, error, refetch, modal, upload, handleDelete, handleToggleActive } = useCounselBannerCrud();

  return (
    <div>
      <PageHeading
        title="상담 배너 관리"
        description="상담 신청 화면 배너의 이미지, 제목, 이동 링크와 노출 순서를 관리합니다."
        action={
          <Button type="primary" icon={<PlusOutlined />} onClick={modal.openCreate}>
            배너 추가
          </Button>
        }
      />
      <LoadError error={error} retry={refetch} />
      <CounselBannerTable
        banners={banners}
        loading={loading}
        onEdit={modal.openEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
      />

      <CounselBannerModal
        visible={modal.modalVisible}
        editingBanner={modal.editingBanner}
        form={modal.form}
        onOk={modal.handleSubmit}
        onCancel={modal.closeModal}
        uploading={upload.uploading}
        previewImage={upload.previewImage}
        onUpload={upload.handleUpload}
      />
    </div>
  );
};

export default CounselBanners;
