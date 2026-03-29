import { useState, useCallback } from 'react';
import { Form, message } from 'antd';

import {
  homeApi,
  type Banner,
  type BannerCreateRequest,
  type BannerUpdateRequest,
} from '../api/homeApi';
import { uploadApi } from '../../upload/api/uploadApi';
import { useListData } from '../../../shared/hooks';

/**
 * 메인 배너 CRUD 비즈니스 로직 훅
 * 배너 생성/수정/삭제/활성화 토글 기능을 제공합니다.
 */
export function useBannerCrud() {
  const fetchBanners = useCallback(() => homeApi.getBanners(), []);
  const { data: rawBanners, loading, refetch } = useListData<Banner>(fetchBanners, '배너');

  // order 기준 정렬
  const banners = [...rawBanners].sort((a, b) => a.order - b.order);

  // 모달 상태
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [form] = Form.useForm();

  // 이미지 업로드 상태
  const [uploading, setUploading] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);
  const [desktopImageFileName, setDesktopImageFileName] = useState<string>('');
  const [mobileImageFileName, setMobileImageFileName] = useState<string>('');
  const [desktopPreviewImage, setDesktopPreviewImage] = useState<string>('');
  const [mobilePreviewImage, setMobilePreviewImage] = useState<string>('');

  const resetImageState = useCallback(() => {
    setDesktopImageFileName('');
    setMobileImageFileName('');
    setDesktopPreviewImage('');
    setMobilePreviewImage('');
  }, []);

  const openCreate = useCallback(() => {
    setEditingBanner(null);
    resetImageState();
    form.resetFields();
    form.setFieldsValue({
      linkType: 'internal',
      isActive: true,
      order: banners.length,
      targetAudience: ['guest', 'adopter', 'breeder'],
    });
    setModalVisible(true);
  }, [form, banners.length, resetImageState]);

  const openEdit = useCallback(
    (banner: Banner) => {
      setEditingBanner(banner);
      setDesktopImageFileName(banner.desktopImageFileName);
      setMobileImageFileName(banner.mobileImageFileName);
      setDesktopPreviewImage(banner.desktopImageUrl || '');
      setMobilePreviewImage(banner.mobileImageUrl || '');
      form.setFieldsValue({
        title: banner.title,
        description: banner.description,
        linkType: banner.linkType,
        linkUrl: banner.linkUrl,
        order: banner.order,
        isActive: banner.isActive !== false,
        targetAudience: banner.targetAudience || [],
      });
      setModalVisible(true);
    },
    [form],
  );

  const closeModal = useCallback(() => {
    setModalVisible(false);
    form.resetFields();
    resetImageState();
  }, [form, resetImageState]);

  const handleUploadDesktop = useCallback(async (file: File): Promise<false> => {
    try {
      setUploading(true);
      const result = await uploadApi.uploadSingle(file, 'banners');
      setDesktopImageFileName(result.fileName);
      setDesktopPreviewImage(result.cdnUrl);
      message.success('PC/Pad 이미지가 업로드되었습니다');
    } catch (error) {
      message.error('PC/Pad 이미지 업로드 실패');
      console.error(error);
    } finally {
      setUploading(false);
    }
    return false;
  }, []);

  const handleUploadMobile = useCallback(async (file: File): Promise<false> => {
    try {
      setUploadingMobile(true);
      const result = await uploadApi.uploadSingle(file, 'banners');
      setMobileImageFileName(result.fileName);
      setMobilePreviewImage(result.cdnUrl);
      message.success('모바일 이미지가 업로드되었습니다');
    } catch (error) {
      message.error('모바일 이미지 업로드 실패');
      console.error(error);
    } finally {
      setUploadingMobile(false);
    }
    return false;
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();

      if (!desktopImageFileName) {
        message.error('PC/Pad 배너 이미지를 업로드해주세요');
        return;
      }

      if (!mobileImageFileName) {
        message.error('모바일 배너 이미지를 업로드해주세요');
        return;
      }

      if (editingBanner) {
        const updateData: BannerUpdateRequest = {
          ...values,
          desktopImageFileName,
          mobileImageFileName,
        };
        await homeApi.updateBanner(editingBanner.bannerId, updateData);
        message.success('배너가 수정되었습니다');
      } else {
        const createData: BannerCreateRequest = {
          ...values,
          desktopImageFileName,
          mobileImageFileName,
        };
        await homeApi.createBanner(createData);
        message.success('배너가 생성되었습니다');
      }

      closeModal();
      refetch();
    } catch (error) {
      message.error('배너 저장 실패');
      console.error(error);
    }
  }, [form, desktopImageFileName, mobileImageFileName, editingBanner, closeModal, refetch]);

  const handleDelete = useCallback(
    async (bannerId: string) => {
      try {
        await homeApi.deleteBanner(bannerId);
        message.success('배너가 삭제되었습니다');
        refetch();
      } catch (error) {
        message.error('배너 삭제 실패');
        console.error(error);
      }
    },
    [refetch],
  );

  const handleToggleActive = useCallback(
    async (bannerId: string, currentStatus: boolean) => {
      try {
        const banner = banners.find((b) => b.bannerId === bannerId);
        if (!banner) return;

        await homeApi.updateBanner(bannerId, {
          ...banner,
          isActive: !currentStatus,
        });
        message.success(`배너가 ${!currentStatus ? '활성화' : '비활성화'}되었습니다`);
        refetch();
      } catch (error) {
        message.error('배너 상태 변경 실패');
        console.error(error);
      }
    },
    [banners, refetch],
  );

  return {
    banners,
    loading,
    modal: {
      modalVisible,
      editingBanner,
      form,
      openCreate,
      openEdit,
      closeModal,
      handleSubmit,
    },
    upload: {
      uploading,
      uploadingMobile,
      desktopPreviewImage,
      mobilePreviewImage,
      handleUploadDesktop,
      handleUploadMobile,
    },
    handleDelete,
    handleToggleActive,
  };
}
