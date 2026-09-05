import {
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  FileTextOutlined,
  BellOutlined,
  SettingOutlined,
  BarChartOutlined,
} from '@ant-design/icons';

export const navigation = [
  {
    label: '워크스페이스',
    items: [
      { path: '/dashboard', label: '대시보드', icon: <DashboardOutlined /> },
      { path: '/statistics', label: '서비스 통계', icon: <BarChartOutlined /> },
    ],
  },
  {
    label: '사용자와 브리더',
    items: [
      { path: '/users', label: '전체 사용자', icon: <UserOutlined /> },
      { path: '/users/deleted', label: '탈퇴 사용자', icon: <UserOutlined /> },
      { path: '/breeders/verification', label: '브리더 신청', icon: <SafetyCertificateOutlined /> },
      { path: '/breeders/management', label: '브리더 관리', icon: <TeamOutlined /> },
      { path: '/breeders/applications', label: '상담 신청', icon: <FileTextOutlined /> },
    ],
  },
  {
    label: '신고와 심사',
    items: [
      { path: '/reports/breeders', label: '브리더 신고', icon: <SafetyCertificateOutlined /> },
      { path: '/reports/reviews', label: '후기 신고', icon: <SafetyCertificateOutlined /> },
      { path: '/reports/community', label: '커뮤니티 신고', icon: <SafetyCertificateOutlined /> },
      { path: '/contests/moderation', label: '콘테스트 항목', icon: <SafetyCertificateOutlined /> },
    ],
  },
  {
    label: '콘텐츠',
    items: [
      { path: '/content/banners', label: '메인 배너', icon: <FileTextOutlined /> },
      { path: '/content/profile', label: '프로필 배너', icon: <FileTextOutlined /> },
      { path: '/content/counsel', label: '상담 배너', icon: <FileTextOutlined /> },
      { path: '/content/notices', label: '공지사항', icon: <FileTextOutlined /> },
      { path: '/content/announcements', label: '팝업 공지', icon: <FileTextOutlined /> },
      { path: '/content/faqs', label: '자주 묻는 질문', icon: <FileTextOutlined /> },
      { path: '/content/questions', label: '표준 질문', icon: <FileTextOutlined /> },
      { path: '/content/ai-filters', label: 'AI 이미지 필터', icon: <FileTextOutlined /> },
      { path: '/content/ai-jobs', label: 'AI 생성 작업', icon: <FileTextOutlined /> },
      { path: '/content/storage', label: '파일 보관함', icon: <FileTextOutlined /> },
    ],
  },
  {
    label: '알림',
    items: [
      { path: '/notifications/push', label: '푸시 발송', icon: <BellOutlined /> },
      { path: '/notifications/history', label: '알림 이력', icon: <BellOutlined /> },
      { path: '/notifications/email', label: '이메일 템플릿', icon: <BellOutlined /> },
      { path: '/settings/alimtalk', label: '알림톡 템플릿', icon: <BellOutlined /> },
    ],
  },
  {
    label: '운영 설정',
    items: [
      { path: '/settings/keywords', label: '인기 검색어', icon: <SettingOutlined /> },
      { path: '/settings/breeds', label: '품종', icon: <SettingOutlined /> },
      { path: '/settings/districts', label: '지역', icon: <SettingOutlined /> },
      { path: '/settings/phone-whitelist', label: '전화번호 화이트리스트', icon: <SettingOutlined /> },
      { path: '/settings/app-version', label: '앱 버전', icon: <SettingOutlined /> },
      { path: '/settings/health', label: '시스템 상태', icon: <SettingOutlined /> },
    ],
  },
];
export const navigationItems = navigation.flatMap((group) =>
  group.items.map((item) => ({ ...item, group: group.label })),
);
