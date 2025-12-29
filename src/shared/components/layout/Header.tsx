import { Layout, Button, Dropdown, Avatar, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { MenuOutlined, UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';

import { useAuthStore } from '../../../features/auth/store/authStore';
import { authApi } from '../../../features/auth/api/authApi';

const { Header: AntHeader } = Layout;

interface HeaderProps {
    onMobileMenuToggle: () => void;
}

/**
 * 어드민 헤더 컴포넌트
 * 사용자 정보, 로그아웃 기능을 제공합니다
 * 모바일: 햄버거 메뉴로 사이드바 토글
 */
export default function Header({ onMobileMenuToggle }: HeaderProps) {
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
            className="flex items-center justify-between px-3 sm:px-6"
            style={{
                background: '#fff',
                padding: '0 24px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                position: 'sticky',
                top: 0,
                zIndex: 10,
            }}
        >
            <div className="flex items-center gap-3">
                {/* 모바일 햄버거 메뉴 버튼 - md 미만에서만 표시 */}
                <div className="block md:hidden">
                    <Button
                        type="text"
                        icon={<MenuOutlined />}
                        onClick={onMobileMenuToggle}
                        style={{
                            fontSize: '16px',
                            width: 48,
                            height: 48,
                        }}
                    />
                </div>

                {/* 모바일에서 로고 표시 */}
                <h1 className="block md:hidden text-lg font-bold" style={{ color: 'var(--color-primary-500)' }}>
                    🐾 Pawpong
                </h1>
            </div>

            <Dropdown menu={{ items: menuItems }} placement="bottomRight">
                <Space className="cursor-pointer">
                    <Avatar icon={<UserOutlined />} style={{ backgroundColor: 'var(--color-primary-500)' }} />
                    <span className="hidden sm:inline text-sm font-medium">{user?.name || '관리자'}</span>
                </Space>
            </Dropdown>
        </AntHeader>
    );
}
