import { Spin } from 'antd';

import { PageHeading } from '../shared/components/admin/PageHeading';
import { useProfile } from '../features/user/hooks/useProfile';
import { ProfileCard } from '../features/user/ui/ProfileCard';
import { ProfileInfo } from '../features/user/ui/ProfileInfo';

/**
 * 관리자 프로필 페이지
 */
export default function Profile() {
  const { profile, loading, banners } = useProfile();

  if (loading) return <div className="page-loading"><Spin size="large" /></div>;
  if (!profile) return <div>프로필을 불러올 수 없습니다.</div>;

  return (
    <div>
      <PageHeading
        title="관리자 프로필"
        description="로그인한 관리자 계정의 이메일, 관리자 등급, 계정 상태와 가입일을 확인합니다."
      />
      <div className="profile-columns">
        <ProfileCard name={profile.name} adminLevel={profile.adminLevel} banners={banners} />
        <ProfileInfo profile={profile} />
      </div>
    </div>
  );
}
