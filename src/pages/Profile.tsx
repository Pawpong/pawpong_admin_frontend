import { useState, useEffect } from 'react';
import { Card, Avatar, Button, Upload, message, Spin, Carousel } from 'antd';
import { UserOutlined, UploadOutlined, CameraOutlined } from '@ant-design/icons';
import type { UploadFile, RcFile } from 'antd/es/upload/interface';
import { getAdminProfile, uploadProfileImage, profileBannerApi, type ProfileBanner } from '../features/user/api/userApi';
import { useAuthStore } from '../features/auth/store/authStore';

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  status: string;
  adminLevel: string;
  createdAt: string;
}

export default function Profile() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [banners, setBanners] = useState<ProfileBanner[]>([]);
  const [bannersLoading, setBannersLoading] = useState(false);

  // 프로필 조회
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getAdminProfile();
      setProfile(data);
      setImageUrl(data.profileImage);
    } catch (error: any) {
      message.error(error.message || '프로필 조회에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 프로필 배너 조회
  const fetchBanners = async () => {
    try {
      setBannersLoading(true);
      const data = await profileBannerApi.getActiveBanners();
      // 순서대로 정렬 (이미 활성화된 배너만 조회됨)
      const sortedBanners = data.sort((a, b) => a.order - b.order);
      setBanners(sortedBanners);
    } catch (error) {
      console.error('프로필 배너 조회 실패:', error);
    } finally {
      setBannersLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchBanners();
  }, []);

  // 이미지 업로드 핸들러
  const handleUpload = async (file: RcFile): Promise<boolean> => {
    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      message.error('파일 크기는 5MB를 초과할 수 없습니다.');
      return false;
    }

    // 파일 타입 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      message.error('이미지 파일만 업로드 가능합니다. (jpg, jpeg, png, gif, webp)');
      return false;
    }

    try {
      setUploading(true);
      const result = await uploadProfileImage(file);
      message.success('프로필 이미지가 업로드되었습니다.');
      setImageUrl(result.profileImageUrl);
      // 프로필 다시 조회
      await fetchProfile();
    } catch (error: any) {
      message.error(error.message || '이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }

    return false; // Prevent default upload behavior
  };

  // 관리자 레벨 한글 변환
  const getAdminLevelText = (level: string) => {
    const levelMap: Record<string, string> = {
      super_admin: '최고 관리자',
      breeder_admin: '브리더 관리자',
      report_admin: '신고 관리자',
      stats_admin: '통계 관리자',
    };
    return levelMap[level] || level;
  };

  // 상태 한글 변환
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      active: '활성',
      suspended: '정지',
      deleted: '삭제됨',
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!profile) {
    return <div className="p-6">프로필을 불러올 수 없습니다.</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">관리자 프로필</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 왼쪽: 배너 + 프로필 이미지 */}
        <div className="md:col-span-1 space-y-4">
          {/* 배너 섹션 */}
          {banners.length > 0 && (
            <Card className="overflow-hidden p-0" style={{ borderRadius: '12px' }}>
              <Carousel autoplay autoplaySpeed={4000} effect="fade">
                {banners.map((banner) => (
                  <div key={banner.bannerId}>
                    <div
                      style={{
                        width: '100%',
                        height: '200px',
                        backgroundImage: `url(${banner.imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: '12px',
                        cursor: banner.linkUrl ? 'pointer' : 'default',
                      }}
                      onClick={() => {
                        if (banner.linkUrl) {
                          if (banner.linkType === 'external') {
                            window.open(banner.linkUrl, '_blank');
                          } else {
                            window.location.href = banner.linkUrl;
                          }
                        }
                      }}
                    />
                  </div>
                ))}
              </Carousel>
            </Card>
          )}

          {/* 프로필 이미지 카드 */}
          <Card className="text-center">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <Avatar
                  size={150}
                  src={imageUrl}
                  icon={!imageUrl && <UserOutlined />}
                  className="border-4 border-gray-100"
                />
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={handleUpload}
                  disabled={uploading}
                >
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<CameraOutlined />}
                    loading={uploading}
                    className="absolute bottom-0 right-0"
                    size="large"
                  />
                </Upload>
              </div>

              <h3 className="text-xl font-semibold mb-2">{profile.name}</h3>
              <p className="text-gray-500 mb-4">{getAdminLevelText(profile.adminLevel)}</p>

              <Upload accept="image/*" showUploadList={false} beforeUpload={handleUpload} disabled={uploading}>
                <Button icon={<UploadOutlined />} loading={uploading} block>
                  프로필 이미지 변경
                </Button>
              </Upload>
            </div>
          </Card>
        </div>

        {/* 오른쪽: 프로필 정보 */}
        <div className="md:col-span-2">
          <Card title="기본 정보">
            <div className="space-y-4">
              <div className="flex border-b pb-3">
                <div className="w-32 font-medium text-gray-600">이메일</div>
                <div className="flex-1">{profile.email}</div>
              </div>

              <div className="flex border-b pb-3">
                <div className="w-32 font-medium text-gray-600">이름</div>
                <div className="flex-1">{profile.name}</div>
              </div>

              <div className="flex border-b pb-3">
                <div className="w-32 font-medium text-gray-600">관리자 등급</div>
                <div className="flex-1">{getAdminLevelText(profile.adminLevel)}</div>
              </div>

              <div className="flex border-b pb-3">
                <div className="w-32 font-medium text-gray-600">계정 상태</div>
                <div className="flex-1">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      profile.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : profile.status === 'suspended'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {getStatusText(profile.status)}
                  </span>
                </div>
              </div>

              <div className="flex">
                <div className="w-32 font-medium text-gray-600">가입일</div>
                <div className="flex-1">{new Date(profile.createdAt).toLocaleDateString('ko-KR')}</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
