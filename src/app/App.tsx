import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import { adminTheme } from '../shared/theme/theme';
import CommunityReports from '../pages/reports/CommunityReports';
import PopularKeywords from '../pages/settings/PopularKeywords';
import SystemHealth from '../pages/settings/SystemHealth';
import NotificationHistory from '../pages/notifications/NotificationHistory';
import EmailTemplates from '../pages/notifications/EmailTemplates';
import ContestModeration from '../pages/contests/ContestModeration';
import koKR from 'antd/locale/ko_KR';

import AdminLayout from '../shared/components/layout/AdminLayout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import MvpStatsPage from '../pages/statistics/MvpStats';
import BreederVerification from '../pages/breeders/BreederVerification';
import BreederManagement from '../pages/breeders/BreederManagement';
import ApplicationMonitoring from '../pages/breeders/ApplicationMonitoring';
import BreederReports from '../pages/reports/BreederReports';
import ReviewReports from '../pages/reports/ReviewReports';
import Users from '../pages/users/Users';
import DeletedUsers from '../pages/users/DeletedUsers';
import Banners from '../pages/content/Banners';
import ProfileBanners from '../pages/content/ProfileBanners';
import CounselBanners from '../pages/content/CounselBanners';
import Faqs from '../pages/content/Faqs';
import Announcements from '../pages/content/Announcements';
import Notices from '../pages/content/Notices';
import StandardQuestions from '../pages/content/StandardQuestions';
import StorageManager from '../pages/content/StorageManager';
import AiImageFilters from '../pages/content/AiImageFilters';
import AiImageJobs from '../pages/content/AiImageJobs';
import Breeds from '../pages/settings/Breeds';
import Districts from '../pages/settings/Districts';
import PhoneWhitelist from '../pages/settings/PhoneWhitelist';
import AlimtalkTemplates from '../pages/settings/AlimtalkTemplates';
import AppVersion from '../pages/settings/AppVersion';
import PushSend from '../pages/notifications/PushSend';
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
      theme={adminTheme}
    >
      <AntdApp>
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
              <Route path="reports/community" element={<CommunityReports />} />
              <Route path="settings/keywords" element={<PopularKeywords />} />
              <Route path="settings/health" element={<SystemHealth />} />
              <Route path="notifications/history" element={<NotificationHistory />} />
              <Route path="notifications/email" element={<EmailTemplates />} />
              <Route path="contests/moderation" element={<ContestModeration />} />
              {/* 대시보드 */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />

              {/* MVP 통계 */}
              <Route path="statistics" element={<MvpStatsPage />} />

              {/* 사용자 관리 */}
              <Route path="users" element={<Users />} />
              <Route path="users/deleted" element={<DeletedUsers />} />

              {/* 브리더 관리 */}
              <Route path="breeders">
                <Route path="verification" element={<BreederVerification />} />
                <Route path="management" element={<BreederManagement />} />
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
                <Route path="profile" element={<ProfileBanners />} />
                <Route path="counsel" element={<CounselBanners />} />
                <Route path="faqs" element={<Faqs />} />
                <Route path="announcements" element={<Announcements />} />
                <Route path="notices" element={<Notices />} />
                <Route path="questions" element={<StandardQuestions />} />
                <Route path="storage" element={<StorageManager />} />
                <Route path="ai-filters" element={<AiImageFilters />} />
                <Route path="ai-jobs" element={<AiImageJobs />} />
              </Route>

              {/* 시스템 설정 */}
              <Route path="settings">
                <Route path="breeds" element={<Breeds />} />
                <Route path="districts" element={<Districts />} />
                <Route path="phone-whitelist" element={<PhoneWhitelist />} />
                <Route path="alimtalk" element={<AlimtalkTemplates />} />
                <Route path="app-version" element={<AppVersion />} />
              </Route>

              {/* 알림 발송 */}
              <Route path="notifications">
                <Route path="push" element={<PushSend />} />
              </Route>

              {/* 표준 질문 관리 (deprecated - 위 content/questions로 이동됨) */}
              <Route path="questions" element={<Navigate to="/content/questions" replace />} />

              {/* 프로필 */}
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
