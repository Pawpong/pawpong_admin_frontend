import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import koKR from 'antd/locale/ko_KR';
import AdminLayout from '../shared/components/layout/AdminLayout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import BreederVerification from '../pages/breeders/BreederVerification';
import ApplicationMonitoring from '../pages/breeders/ApplicationMonitoring';
import BreederReports from '../pages/reports/BreederReports';
import ReviewReports from '../pages/reports/ReviewReports';
import Users from '../pages/users/Users';
import Banners from '../pages/content/Banners';
import Faqs from '../pages/content/Faqs';
import StandardQuestions from '../pages/content/StandardQuestions';
import Breeds from '../pages/settings/Breeds';
import Districts from '../pages/settings/Districts';
import { useAuthStore } from '../features/auth/store/authStore';

// Protected Route 컴포넌트
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <ConfigProvider
      locale={koKR}
      theme={{
        token: {
          // Pawpong 브랜드 컬러 적용
          colorPrimary: '#4f3b2e',         // 따뜻한 브라운
          colorSuccess: '#005df9',          // 블루
          colorWarning: '#d97706',          // 오렌지
          colorError: '#dc2626',            // 레드
          colorInfo: '#a0c8f4',             // 세컨더리 블루

          // Border Radius - 부드러운 느낌
          borderRadius: 8,
          borderRadiusLG: 12,
          borderRadiusSM: 4,

          // 폰트 설정
          fontSize: 14,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',

          // 배경색
          colorBgContainer: '#ffffff',
          colorBgLayout: '#f5f5f5',

          // 그레이스케일
          colorTextBase: '#3c3c3c',
          colorTextSecondary: '#888',
          colorBorder: '#e1e1e1',
          colorBorderSecondary: '#f5f5f5',
        },
        components: {
          Button: {
            controlHeight: 38,
            controlHeightLG: 44,
            fontWeight: 500,
            primaryShadow: 'none',
          },
          Table: {
            borderRadius: 8,
            headerBg: '#fafafa',
            headerColor: '#3c3c3c',
            headerSplitColor: '#f0f0f0',
          },
          Card: {
            borderRadiusLG: 12,
            boxShadowTertiary: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          },
          Input: {
            controlHeight: 38,
            borderRadius: 8,
          },
          Select: {
            controlHeight: 38,
            borderRadius: 8,
          },
          Menu: {
            itemBg: 'transparent',
            itemSelectedBg: '#f6f6ea',
            itemSelectedColor: '#4f3b2e',
            itemActiveBg: '#eeebde',
            itemHoverBg: '#f6f6ea',
            iconSize: 18,
            fontSize: 14,
          },
          Layout: {
            siderBg: '#ffffff',
            headerBg: '#ffffff',
            bodyBg: '#f5f5f5',
            triggerBg: '#4f3b2e',
            triggerColor: '#ffffff',
          },
          Tag: {
            borderRadiusSM: 6,
          },
          Modal: {
            borderRadiusLG: 12,
          },
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          {/* 로그인 페이지 */}
          <Route path="/login" element={<Login />} />

          {/* 어드민 레이아웃 (인증 필요) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* 대시보드 */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* 사용자 관리 */}
            <Route path="users" element={<Users />} />

            {/* 브리더 관리 */}
            <Route path="breeders">
              <Route path="verification" element={<BreederVerification />} />
              <Route path="applications" element={<ApplicationMonitoring />} />
            </Route>

            {/* 신고 관리 */}
            <Route path="reports">
              <Route path="breeders" element={<BreederReports />} />
              <Route path="reviews" element={<ReviewReports />} />
            </Route>

            {/* 콘텐츠 관리 */}
            <Route path="content">
              <Route path="banners" element={<Banners />} />
              <Route path="faqs" element={<Faqs />} />
              <Route path="questions" element={<StandardQuestions />} />
            </Route>

            {/* 시스템 설정 */}
            <Route path="settings">
              <Route path="breeds" element={<Breeds />} />
              <Route path="districts" element={<Districts />} />
            </Route>

            {/* 표준 질문 관리 (deprecated - 위 content/questions로 이동됨) */}
            <Route path="questions" element={<Navigate to="/content/questions" replace />} />

            {/* 프로필 */}
            <Route path="profile" element={<div className="p-6"><h2 className="text-2xl font-semibold">관리자 프로필 (준비 중)</h2></div>} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
