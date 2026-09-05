import { Card, Avatar, Carousel } from 'antd';
import { UserOutlined } from '@ant-design/icons';

import type { ProfileBanner } from '../api/userApi';
import { ADMIN_LEVEL_MAP } from '../hooks/useProfile';

interface ProfileCardProps {
  name: string;
  adminLevel: string;
  banners: ProfileBanner[];
}

/**
 * 프로필 이미지 + 배너 카드
 */
export function ProfileCard({ name, adminLevel, banners }: ProfileCardProps) {
  return (
    <div className="space-y-4">
      {banners.length > 0 && (
        <Card className="overflow-hidden p-0" style={{ borderRadius: '12px' }}>
          <Carousel autoplay autoplaySpeed={4000} effect="fade">
            {banners.map((banner) => (
              <div key={banner.bannerId}>
                <div
                  style={{ width: '100%', height: '200px', backgroundImage: `url(${banner.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '12px', cursor: banner.linkUrl ? 'pointer' : 'default' }}
                  onClick={() => { if (banner.linkUrl) { if (banner.linkType === 'external') window.open(banner.linkUrl, '_blank'); else window.location.href = banner.linkUrl; } }}
                />
              </div>
            ))}
          </Carousel>
        </Card>
      )}

      <Card className="text-center">
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <Avatar size={150} icon={<UserOutlined />} className="border-4 border-gray-100" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{name}</h3>
          <p className="text-gray-500 mb-4">{ADMIN_LEVEL_MAP[adminLevel] || adminLevel}</p>
        </div>
      </Card>
    </div>
  );
}
