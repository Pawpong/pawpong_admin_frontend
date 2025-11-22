import { Layout, Button, Dropdown, Avatar, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../../features/auth/store/authStore';
import { authApi } from '../../../features/auth/api/authApi';

const { Header: AntHeader } = Layout;

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

/**
 * 어드민 헤더 컴포넌트
 * 사이드바 토글, 사용자 정보, 로그아웃 기능을 제공합니다
 */
export default function Header({ collapsed, onToggle }: HeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // 에러가 나도 로컬 로그아웃은 진행
      logout();
      navigate('/login');
    }
  };

  const menuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '프로필',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '설정',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '로그아웃',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <AntHeader
      className="flex items-center justify-between px-6"
      style={{
        background: '#fff',
        padding: '0 24px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onToggle}
        style={{
          fontSize: '16px',
          width: 48,
          height: 48,
        }}
      />

      <Dropdown menu={{ items: menuItems }} placement="bottomRight">
        <Space className="cursor-pointer">
          <Avatar
            icon={<UserOutlined />}
            style={{ backgroundColor: 'var(--color-primary-500)' }}
          />
          <span className="text-sm font-medium">{user?.name || '관리자'}</span>
        </Space>
      </Dropdown>
    </AntHeader>
  );
}
