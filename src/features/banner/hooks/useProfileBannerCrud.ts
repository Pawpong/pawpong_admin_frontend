import { useState, useCallback } from 'react';
import { Form, message } from 'antd';

import { profileBannerApi, type ProfileBanner, type ProfileBannerRequest } from '../../user/api/userApi';
import { uploadApi } from '../../upload/api/uploadApi';
import { useListData } from '../../../shared/hooks';

/**
 * 프로필 배너 CRUD 비즈니스 로직 훅
 * 로그인/회원가입 페이지 배너의 생성/수정/삭제/활성화 토글 기능을 제공합니다.
 */
export function useProfileBannerCrud() {
  const fetchBanners = useCallback(() => profileBannerApi.getAllBanners(), []);
  const { data: rawBanners, loading, refetch } = useListData<ProfileBanner>(fetchBanners, '프로필 배너');

  // order 기준 정렬
  const banners = [...rawBanners].sort((a, b) => a.order - b.order);

  // 모달 상태
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBanner, setEditingBanner] = useState<ProfileBanner | null>(null);
  const [form] = Form.useForm();

  // 이미지 업로드 상태
  const [uploading, setUploading] = useState(false);
  const [imageFileName, setImageFileName] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string>('');

  const resetImageState = useCallback(() => {
    setImageFileName('');
    setPreviewImage('');
  }, []);

  const openCreate = useCallback(() => {
    setEditingBanner(null);
    resetImageState();
    form.resetFields();
    form.setFieldsValue({
      bannerType: 'login',
      isActive: true,
      order: banners.length,
    });
    setModalVisible(true);
  }, [form, banners.length, resetImageState]);

  const openEdit = useCallback(
    (banner: ProfileBanner) => {
      setEditingBanner(banner);
      setImageFileName(banner.imageFileName);
      setPreviewImage(banner.imageUrl || '');
      form.setFieldsValue({
        bannerType: banner.bannerType || 'login',
        title: banner.title,
        description: banner.description,
        linkType: banner.linkType,
        linkUrl: banner.linkUrl,
        order: banner.order,
        isActive: banner.isActive !== false,
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

  const handleUpload = useCallback(async (file: File): Promise<false> => {
    try {
      setUploading(true);
      const result = await uploadApi.uploadSingle(file, 'profile-banners');
      setImageFileName(result.fileName);
      setPreviewImage(result.cdnUrl);
      message.success('이미지가 업로드되었습니다');
    } catch (error) {
      message.error('이미지 업로드 실패');
      console.error(error);
    } finally {
      setUploading(false);
    }
    return false;
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();

      if (!imageFileName) {
        message.error('배너 이미지를 업로드해주세요');
        return;
      }

      // 빈 값 제거 (linkType, linkUrl이 빈 문자열이면 제거)
      const cleanedValues = Object.fromEntries(
        Object.entries(values).filter(([_, value]) => value !== '' && value !== null && value !== undefined),
      );

      if (editingBanner) {
        const updateData: Partial<ProfileBannerRequest> = {
          ...cleanedValues,
          imageFileName,
        };
        await profileBannerApi.updateBanner(editingBanner.bannerId, updateData);
        message.success('프로필 배너가 수정되었습니다');
      } else {
        const createData: ProfileBannerRequest = {
          ...cleanedValues,
          imageFileName,
        } as ProfileBannerRequest;
        await profileBannerApi.createBanner(createData);
        message.success('프로필 배너가 생성되었습니다');
      }

      closeModal();
      refetch();
    } catch (error) {
      message.error('프로필 배너 저장 실패');
      console.error(error);
    }
  }, [form, imageFileName, editingBanner, closeModal, refetch]);

  const handleDelete = useCallback(
    async (bannerId: string) => {
      try {
        await profileBannerApi.deleteBanner(bannerId);
        message.success('프로필 배너가 삭제되었습니다');
        refetch();
      } catch (error) {
        message.error('프로필 배너 삭제 실패');
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

        await profileBannerApi.updateBanner(bannerId, {
          ...banner,
          isActive: !currentStatus,
        });
        message.success(`프로필 배너가 ${!currentStatus ? '활성화' : '비활성화'}되었습니다`);
        refetch();
      } catch (error) {
        message.error('프로필 배너 상태 변경 실패');
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
      previewImage,
      handleUpload,
    },
    handleDelete,
    handleToggleActive,
  };
}
