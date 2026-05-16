import { Spin } from 'antd';

import { useProfile } from '../features/user/hooks/useProfile';
import { ProfileCard } from '../features/user/ui/ProfileCard';
import { ProfileInfo } from '../features/user/ui/ProfileInfo';

/**
 * 관리자 프로필 페이지
 */
export default function Profile() {
  const { profile, loading, uploading, imageUrl, banners, handleUpload } = useProfile();

  if (loading) return <div className="flex items-center justify-center h-96"><Spin size="large" /></div>;
  if (!profile) return <div className="p-6">프로필을 불러올 수 없습니다.</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">관리자 프로필</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <ProfileCard name={profile.name} adminLevel={profile.adminLevel} imageUrl={imageUrl} uploading={uploading} banners={banners} onUpload={handleUpload} />
        </div>
        <div className="md:col-span-2">
          <ProfileInfo profile={profile} />
        </div>
      </div>
    </div>
  );
}
