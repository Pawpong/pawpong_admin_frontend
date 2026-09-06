import { lazy } from 'react';
import { PageBoundary } from '../shared/components/admin/PageBoundary';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import { adminTheme } from '../shared/theme/theme';
import koKR from 'antd/locale/ko_KR';

import AdminLayout from '../shared/components/layout/AdminLayout';
import { useAuthStore } from '../features/auth/store/authStore';

const Support = lazy(() => import('../pages/Support'));
const CommunityReports = lazy(() => import('../pages/reports/CommunityReports'));
const PopularKeywords = lazy(() => import('../pages/settings/PopularKeywords'));
const SystemHealth = lazy(() => import('../pages/settings/SystemHealth'));
const NotificationHistory = lazy(() => import('../pages/notifications/NotificationHistory'));
const EmailTemplates = lazy(() => import('../pages/notifications/EmailTemplates'));
const ContestModeration = lazy(() => import('../pages/contests/ContestModeration'));
const Login = lazy(() => import('../pages/Login'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Profile = lazy(() => import('../pages/Profile'));
const MvpStatsPage = lazy(() => import('../pages/statistics/MvpStats'));
const BreederVerification = lazy(() => import('../pages/breeders/BreederVerification'));
const BreederManagement = lazy(() => import('../pages/breeders/BreederManagement'));
const ApplicationMonitoring = lazy(() => import('../pages/breeders/ApplicationMonitoring'));
const BreederReports = lazy(() => import('../pages/reports/BreederReports'));
const ReviewReports = lazy(() => import('../pages/reports/ReviewReports'));
const Users = lazy(() => import('../pages/users/Users'));
const DeletedUsers = lazy(() => import('../pages/users/DeletedUsers'));
const Banners = lazy(() => import('../pages/content/Banners'));
const ProfileBanners = lazy(() => import('../pages/content/ProfileBanners'));
const CounselBanners = lazy(() => import('../pages/content/CounselBanners'));
const Faqs = lazy(() => import('../pages/content/Faqs'));
const Announcements = lazy(() => import('../pages/content/Announcements'));
const Notices = lazy(() => import('../pages/content/Notices'));
const StandardQuestions = lazy(() => import('../pages/content/StandardQuestions'));
const StorageManager = lazy(() => import('../pages/content/StorageManager'));
const AiImageFilters = lazy(() => import('../pages/content/AiImageFilters'));
const AiImageJobs = lazy(() => import('../pages/content/AiImageJobs'));
const Breeds = lazy(() => import('../pages/settings/Breeds'));
const Districts = lazy(() => import('../pages/settings/Districts'));
const PhoneWhitelist = lazy(() => import('../pages/settings/PhoneWhitelist'));
const AlimtalkTemplates = lazy(() => import('../pages/settings/AlimtalkTemplates'));
const AppVersion = lazy(() => import('../pages/settings/AppVersion'));
const PushSend = lazy(() => import('../pages/notifications/PushSend'));

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
    <ConfigProvider locale={koKR} theme={adminTheme}>
      <AntdApp>
        <BrowserRouter>
          <PageBoundary>
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
                <Route path="support" element={<Support />} />
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
          </PageBoundary>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
