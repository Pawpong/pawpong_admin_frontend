import { Drawer, Input } from 'antd';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { SearchOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { navigation } from './navigation';

interface Props {
  mobileMenuOpen: boolean;
  onMobileMenuClose: () => void;
}
function SidebarContent({ onNavigate }: { onNavigate: () => void }) {
  const [query, setQuery] = useState('');
  return (
    <div className="sidebar-inner">
      <NavLink to="/dashboard" className="brand-lockup" onClick={onNavigate}>
        <img src="/brand/pawpong-logo.svg" width={95.676} height={32} alt="Pawpong" />
        <span>ADMIN</span>
      </NavLink>
      <div className="workspace-label">
        <span className="workspace-symbol">P</span>
        <div>
          <strong>포퐁 운영 워크스페이스</strong>
          <small>함께 만드는 더 좋은 만남</small>
        </div>
      </div>
      <div className="sidebar-search">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          prefix={<SearchOutlined />}
          placeholder="메뉴 찾기"
          aria-label="메뉴 찾기"
          allowClear
        />
      </div>
      <nav aria-label="관리자 메뉴" className="sidebar-nav">
        {navigation.map((group) => {
          const items = group.items.filter((item) => item.label.includes(query.trim()));
          return (
            items.length > 0 && (
              <div className="nav-group" key={group.label}>
                <p>{group.label}</p>
                {items.map((item) => (
                  <NavLink
                    end
                    to={item.path}
                    key={item.path}
                    onClick={onNavigate}
                    className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            )
          );
        })}
        {query && !navigation.some((group) => group.items.some((item) => item.label.includes(query.trim()))) && (
          <p className="nav-empty">일치하는 메뉴가 없어요.</p>
        )}
      </nav>
      <a className="sidebar-footer" href="https://pawpong.kr" target="_blank" rel="noreferrer">
        포퐁 서비스 바로가기 <ArrowUpOutlined rotate={45} />
      </a>
    </div>
  );
}
export default function Sidebar({ mobileMenuOpen, onMobileMenuClose }: Props) {
  return (
    <>
      <aside className="admin-sidebar">
        <SidebarContent onNavigate={onMobileMenuClose} />
      </aside>
      <Drawer
        placement="left"
        width={260}
        open={mobileMenuOpen}
        onClose={onMobileMenuClose}
        closable
        title="메뉴"
        styles={{ body: { padding: 0 } }}
      >
        <SidebarContent onNavigate={onMobileMenuClose} />
      </Drawer>
    </>
  );
}
