import { Card } from 'antd';

import { ADMIN_LEVEL_MAP, STATUS_MAP } from '../hooks/useProfile';
import type { AdminProfile } from '../hooks/useProfile';

interface ProfileInfoProps {
  profile: AdminProfile;
}

const INFO_ITEMS = (profile: AdminProfile) => [
  { label: '이메일', value: profile.email },
  { label: '이름', value: profile.name },
  { label: '관리자 등급', value: ADMIN_LEVEL_MAP[profile.adminLevel] || profile.adminLevel },
  {
    label: '계정 상태',
    value: null,
    render: () => {
      const s = STATUS_MAP[profile.status] || { text: profile.status, className: 'bg-gray-100 text-gray-700' };
      return <span className={`px-3 py-1 rounded-full text-sm ${s.className}`}>{s.text}</span>;
    },
  },
  { label: '가입일', value: new Date(profile.createdAt).toLocaleDateString('ko-KR') },
];

/**
 * 프로필 기본 정보 카드
 */
export function ProfileInfo({ profile }: ProfileInfoProps) {
  const items = INFO_ITEMS(profile);

  return (
    <Card title="기본 정보">
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={item.label} className={`flex ${i < items.length - 1 ? 'border-b pb-3' : ''}`}>
            <div className="w-32 font-medium text-gray-600">{item.label}</div>
            <div className="flex-1">{item.render ? item.render() : item.value}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
