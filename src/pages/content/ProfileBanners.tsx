import { Button } from 'antd';
import { LoadError, PageHeading } from '../../shared/components/admin/PageHeading';
import { PlusOutlined } from '@ant-design/icons';

import { useProfileBannerCrud } from '../../features/banner/hooks/useProfileBannerCrud';
import { ProfileBannerTable } from '../../features/banner/ui/ProfileBannerTable';
import { ProfileBannerModal } from '../../features/banner/ui/ProfileBannerModal';

/**
 * 프로필 배너 관리 페이지
 * 로그인/회원가입 페이지에 표시될 배너를 관리합니다.
 */
const ProfileBanners = () => {
  const { banners, loading, error, refetch, modal, upload, handleDelete, handleToggleActive } = useProfileBannerCrud();

  return (
    <div>
      <PageHeading
        title="프로필 배너 관리"
        description="로그인·회원가입 화면 배너의 배너 타입, 이미지, 이동 링크와 노출 순서를 관리합니다."
        action={
          <Button type="primary" icon={<PlusOutlined />} onClick={modal.openCreate}>
            배너 추가
          </Button>
        }
      />
      <LoadError error={error} retry={refetch} />
      <ProfileBannerTable
        banners={banners}
        loading={loading}
        onEdit={modal.openEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
      />

      <ProfileBannerModal
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

export default ProfileBanners;
