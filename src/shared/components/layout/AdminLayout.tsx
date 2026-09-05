import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div className="admin-shell">
      <a className="skip-link" href="#main-content">
        본문으로 이동
      </a>
      <Sidebar mobileMenuOpen={mobileMenuOpen} onMobileMenuClose={() => setMobileMenuOpen(false)} />
      <div className="admin-main">
        <Header onMobileMenuToggle={() => setMobileMenuOpen((value) => !value)} />
        <main id="main-content" className="admin-content">
          <Outlet />
        </main>
        <footer className="workspace-footer">
          © {new Date().getFullYear()} PAWPONG <span>좋은 만남의 시작, 포퐁</span>
        </footer>
      </div>
    </div>
  );
}
