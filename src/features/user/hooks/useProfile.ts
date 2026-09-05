import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';

import { getAdminProfile, profileBannerApi, type ProfileBanner } from '../api/userApi';

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
  const [banners, setBanners] = useState<ProfileBanner[]>([]);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAdminProfile();
      setProfile(data);
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

  return { profile, loading, banners };
}
