import { Button, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { useCounselBannerCrud } from '../../features/banner/hooks/useCounselBannerCrud';
import { CounselBannerTable } from '../../features/banner/ui/CounselBannerTable';
import { CounselBannerModal } from '../../features/banner/ui/CounselBannerModal';

/**
 * 상담 배너 관리 페이지
 * 상담 신청 페이지에 표시될 배너를 관리합니다.
 */
const CounselBanners = () => {
  const { banners, loading, modal, upload, handleDelete, handleToggleActive } = useCounselBannerCrud();

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--color-primary-500)' }}>
            상담 배너 관리
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">상담 신청 페이지에 표시될 배너를 관리합니다</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={modal.openCreate}
          className="w-full sm:w-auto"
          style={{ backgroundColor: 'var(--color-primary-500)', borderColor: 'var(--color-primary-500)' }}
        >
          배너 추가
        </Button>
      </div>

      <div className="overflow-x-auto -mx-3 sm:mx-0 mb-6">
        <Card style={{ borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
          <CounselBannerTable
            banners={banners}
            loading={loading}
            onEdit={modal.openEdit}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
          />
        </Card>
      </div>

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
