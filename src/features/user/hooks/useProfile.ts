import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import type { RcFile } from 'antd/es/upload/interface';

import { getAdminProfile, uploadProfileImage, profileBannerApi, type ProfileBanner } from '../api/userApi';

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  status: string;
  adminLevel: string;
  createdAt: string;
}

/** 관리자 레벨 한글 매핑 */
export const ADMIN_LEVEL_MAP: Record<string, string> = {
  super_admin: '최고 관리자',
  breeder_admin: '브리더 관리자',
  report_admin: '신고 관리자',
  stats_admin: '통계 관리자',
};

/** 상태 한글 매핑 */
export const STATUS_MAP: Record<string, { text: string; className: string }> = {
  active: { text: '활성', className: 'bg-green-100 text-green-700' },
  suspended: { text: '정지', className: 'bg-red-100 text-red-700' },
  deleted: { text: '삭제됨', className: 'bg-gray-100 text-gray-700' },
};

/**
 * 관리자 프로필 비즈니스 로직 훅
 */
export function useProfile() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [banners, setBanners] = useState<ProfileBanner[]>([]);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAdminProfile();
      setProfile(data);
      setImageUrl(data.profileImage);
    } catch (error: unknown) {
      const err = error as { message?: string };
      message.error(err.message || '프로필 조회에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBanners = useCallback(async () => {
    try {
      const data = await profileBannerApi.getActiveBanners();
      setBanners(data.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('프로필 배너 조회 실패:', error);
    }
  }, []);

  useEffect(() => { fetchProfile(); fetchBanners(); }, [fetchProfile, fetchBanners]);

  const handleUpload = useCallback(async (file: RcFile): Promise<boolean> => {
    if (file.size > 5 * 1024 * 1024) { message.error('파일 크기는 5MB를 초과할 수 없습니다.'); return false; }
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) { message.error('이미지 파일만 업로드 가능합니다.'); return false; }

    try {
      setUploading(true);
      const result = await uploadProfileImage(file);
      message.success('프로필 이미지가 업로드되었습니다.');
      setImageUrl(result.profileImageUrl);
      await fetchProfile();
    } catch (error: unknown) {
      const err = error as { message?: string };
      message.error(err.message || '이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
    return false;
  }, [fetchProfile]);

  return { profile, loading, uploading, imageUrl, banners, handleUpload };
}
