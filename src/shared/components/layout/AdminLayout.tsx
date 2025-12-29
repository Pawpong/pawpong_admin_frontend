import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import Sidebar from './Sidebar';
import Header from './Header';

const { Content } = Layout;

export default function AdminLayout() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <Layout className="min-h-screen">
            <Sidebar mobileMenuOpen={mobileMenuOpen} onMobileMenuClose={() => setMobileMenuOpen(false)} />
            <Layout className="ml-0 md:ml-60 transition-[margin-left] duration-200">
                <Header onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
                <Content
                    className="m-3 sm:m-4 md:m-6 p-0"
                    style={{
                        background: '#fff',
                        borderRadius: '8px',
                        minHeight: 'calc(100vh - 112px)',
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
}
