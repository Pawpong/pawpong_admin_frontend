import { Layout, Menu } from 'antd';
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
  collapsed: boolean;
}

/**
 * 어드민 사이드바 컴포넌트
 * 메뉴 네비게이션을 제공합니다
 */
export default function Sidebar({ collapsed }: SidebarProps) {
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
      key: '/users',
      icon: <UserOutlined />,
      label: '사용자 관리',
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
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      trigger={null}
      width={240}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div className="flex items-center justify-center h-16 border-b" style={{ borderColor: 'var(--color-gray-100)' }}>
        {collapsed ? (
          <span className="text-2xl">🐾</span>
        ) : (
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-primary-500)' }}>
            🐾 Pawpong
          </h1>
        )}
      </div>

      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={['breeders', 'reports', 'content', 'settings']}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ borderRight: 0 }}
      />
    </Sider>
  );
}
