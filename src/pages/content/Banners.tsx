import { Button } from 'antd';
import { LoadError, PageHeading } from '../../shared/components/admin/PageHeading';
import { PlusOutlined } from '@ant-design/icons';

import { useBannerCrud } from '../../features/home/hooks/useBannerCrud';
import { BannerTable } from '../../features/home/ui/BannerTable';
import { BannerModal } from '../../features/home/ui/BannerModal';

/**
 * 메인 배너 관리 페이지
 * 메인 화면에 표시될 배너를 관리합니다.
 */
const Banners = () => {
  const { banners, loading, error, refetch, modal, upload, handleDelete, handleToggleActive } = useBannerCrud();

  return (
    <div>
      <PageHeading
        title="메인 배너 관리"
        description="서비스 홈 배너의 이미지, 제목, 이동 링크, 표시 대상과 노출 순서를 관리합니다."
        action={
          <Button type="primary" icon={<PlusOutlined />} onClick={modal.openCreate}>
            배너 추가
          </Button>
        }
      />
      <LoadError error={error} retry={refetch} />
      <BannerTable
        banners={banners}
        loading={loading}
        onEdit={modal.openEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
      />

      <BannerModal
        visible={modal.modalVisible}
        editingBanner={modal.editingBanner}
        form={modal.form}
        onOk={modal.handleSubmit}
        onCancel={modal.closeModal}
        uploading={upload.uploading}
        uploadingMobile={upload.uploadingMobile}
        desktopPreviewImage={upload.desktopPreviewImage}
        mobilePreviewImage={upload.mobilePreviewImage}
        onUploadDesktop={upload.handleUploadDesktop}
        onUploadMobile={upload.handleUploadMobile}
      />
    </div>
  );
};

export default Banners;
