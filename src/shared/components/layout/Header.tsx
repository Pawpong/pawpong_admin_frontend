import { Button, Dropdown, Avatar, Breadcrumb, Tooltip } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MenuOutlined, UserOutlined, LogoutOutlined, DownOutlined, BellOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../../features/auth/store/authStore';
import { authApi } from '../../../features/auth/api/authApi';
import { navigationItems } from './navigation';

export default function Header({ onMobileMenuToggle }: { onMobileMenuToggle: () => void }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = useAuthStore((state) => state.user);
  const current = navigationItems.find((item) => item.path === pathname);
  const menuItems = [
    { key: 'profile', icon: <UserOutlined />, label: '내 프로필', onClick: () => navigate('/profile') },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '로그아웃',
      danger: true,
      onClick: async () => {
        try {
          await authApi.logout();
        } catch {
          /* Local session is cleared even when logout fails. */
        } finally {
          navigate('/login');
        }
      },
    },
  ];
  return (
    <header className="admin-header">
      <div className="header-leading">
        <Button
          className="mobile-menu-button"
          type="text"
          icon={<MenuOutlined />}
          aria-label="메뉴 열기"
          onClick={onMobileMenuToggle}
        />
        <Breadcrumb
          items={[{ title: <Link to="/dashboard">워크스페이스</Link> }, { title: current?.label || '내 프로필' }]}
        />
      </div>
      <div className="header-trailing">
        <Tooltip title="알림 이력">
          <Button
            type="text"
            aria-label="알림 이력"
            icon={<BellOutlined />}
            onClick={() => navigate('/notifications/history')}
          />
        </Tooltip>
        <div className="header-divider" />
        <Dropdown menu={{ items: menuItems }} trigger={['click']}>
          <button className="profile-menu">
            <Avatar size={32} icon={<UserOutlined />} />
            <span>{user?.name || '관리자'}</span>
            <DownOutlined />
          </button>
        </Dropdown>
      </div>
    </header>
  );
}
