import { Layout, Menu, Drawer } from 'antd';
import type { MenuProps } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  BarChartOutlined,
  UserOutlined,
  TeamOutlined,
  WarningOutlined,
  FileTextOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

interface SidebarProps {
  mobileMenuOpen: boolean;
  onMobileMenuClose: () => void;
}

interface SidebarContentProps {
  pathname: string;
  menuItems: MenuProps['items'];
  onMenuClick: ({ key }: { key: string }) => void;
}

/**
 * 사이드바 콘텐츠 컴포넌트 (데스크탑/모바일 공통)
 */
function SidebarContent({ pathname, menuItems, onMenuClick }: SidebarContentProps) {
  return (
    <>
      <div className="flex items-center justify-center h-16 border-b" style={{ borderColor: 'var(--color-gray-100)' }}>
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-primary-500)' }}>
          🐾 Pawpong
        </h1>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[pathname]}
        defaultOpenKeys={['users', 'breeders', 'reports', 'content', 'settings']}
        items={menuItems}
        onClick={onMenuClick}
        style={{ borderRight: 0 }}
      />
    </>
  );
}

/**
 * 어드민 사이드바 컴포넌트
 * 메뉴 네비게이션을 제공합니다
 * 모바일: Drawer로 표시, 데스크탑: 항상 펼쳐진 고정 사이드바
 */
export default function Sidebar({ mobileMenuOpen, onMobileMenuClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '대시보드',
    },
    {
      key: '/statistics',
      icon: <BarChartOutlined />,
      label: 'MVP 통계',
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: '사용자 관리',
      children: [
        {
          key: '/users',
          label: '전체 사용자',
        },
        {
          key: '/users/deleted',
          label: '탈퇴 사용자',
        },
      ],
    },
    {
      key: 'breeders',
      icon: <TeamOutlined />,
      label: '브리더 관리',
      children: [
        {
          key: '/breeders/verification',
          label: '인증 관리',
        },
        {
          key: '/breeders/management',
          label: '브리더 관리',
        },
        {
          key: '/breeders/applications',
          label: '입양 신청 모니터링',
        },
      ],
    },
    {
      key: 'reports',
      icon: <WarningOutlined />,
      label: '신고 관리',
      children: [
        {
          key: '/reports/breeders',
          label: '브리더 신고',
        },
        {
          key: '/reports/reviews',
          label: '후기 신고',
        },
      ],
    },
    {
      key: 'content',
      icon: <FileTextOutlined />,
      label: '콘텐츠 관리',
      children: [
        {
          key: '/content/banners',
          label: '메인 배너',
        },
        {
          key: '/content/profile',
          label: '프로필 배너',
        },
        {
          key: '/content/counsel',
          label: '상담 배너',
        },
        {
          key: '/content/faqs',
          label: 'FAQ',
        },
        {
          key: '/content/questions',
          label: '표준 질문',
        },
      ],
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '시스템 설정',
      children: [
        {
          key: '/settings/breeds',
          label: '품종 관리',
        },
        {
          key: '/settings/districts',
          label: '지역 관리',
        },
      ],
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
    // 모바일에서 메뉴 클릭 시 Drawer 닫기
    onMobileMenuClose();
  };

  return (
    <>
      {/* 데스크탑 사이드바 - md 이상에서만 표시, 항상 펼쳐진 상태 */}
      <Sider
        width={240}
        className="hidden md:block"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <SidebarContent pathname={location.pathname} menuItems={menuItems} onMenuClick={handleMenuClick} />
      </Sider>

      {/* 모바일 Drawer - md 미만에서만 표시 */}
      <Drawer
        placement="left"
        onClose={onMobileMenuClose}
        open={mobileMenuOpen}
        closable={false}
        width={240}
        styles={{
          body: { padding: 0 },
          header: { display: 'none' },
        }}
        className="md:hidden"
      >
        <SidebarContent pathname={location.pathname} menuItems={menuItems} onMenuClick={handleMenuClick} />
      </Drawer>
    </>
  );
}
