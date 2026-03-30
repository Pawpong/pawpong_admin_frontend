import { Spin } from 'antd';
import { UserOutlined, TeamOutlined, FileTextOutlined, WarningOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

import { useDashboard } from '../features/platform/hooks/useDashboard';
import { StatsSection } from '../features/platform/ui/StatsSection';

/**
 * 대시보드 페이지
 */
export default function Dashboard() {
  const { stats, loading } = useDashboard();

  if (loading) return <div className="flex items-center justify-center h-96"><Spin size="large" /></div>;
  if (!stats) return <div>데이터를 불러올 수 없습니다.</div>;

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">대시보드</h1>
      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">전체 플랫폼 통계를 한눈에 확인합니다.</p>

      <StatsSection title="사용자 통계" items={[
        { title: '전체 입양자', value: stats.userStatistics.totalAdopterCount, icon: <UserOutlined />, color: '#3f8600' },
        { title: '전체 브리더', value: stats.userStatistics.totalBreederCount, icon: <TeamOutlined />, color: '#1677ff' },
        { title: '승인된 브리더', value: stats.userStatistics.approvedBreederCount, icon: <CheckCircleOutlined />, color: '#52c41a' },
        { title: '승인 대기 브리더', value: stats.userStatistics.pendingBreederCount, icon: <ClockCircleOutlined />, color: '#faad14' },
      ]} />

      <StatsSection title="입양 신청 통계" items={[
        { title: '전체 신청', value: stats.adoptionStatistics.totalApplicationCount, icon: <FileTextOutlined /> },
        { title: '대기 중', value: stats.adoptionStatistics.pendingApplicationCount, icon: <ClockCircleOutlined />, color: '#faad14' },
        { title: '완료됨', value: stats.adoptionStatistics.completedAdoptionCount, icon: <CheckCircleOutlined />, color: '#52c41a' },
        { title: '거절됨', value: stats.adoptionStatistics.rejectedApplicationCount, icon: <WarningOutlined />, color: '#ff4d4f' },
      ]} />

      <StatsSection title="신고 통계" items={[
        { title: '전체 신고', value: stats.reportStatistics.totalReportCount, icon: <WarningOutlined />, color: '#ff4d4f' },
        { title: '대기 중인 신고', value: stats.reportStatistics.pendingReportCount, icon: <ClockCircleOutlined />, color: '#faad14' },
        { title: '처리된 신고', value: stats.reportStatistics.resolvedReportCount, icon: <CheckCircleOutlined />, color: '#52c41a' },
        { title: '기각된 신고', value: stats.reportStatistics.dismissedReportCount, icon: <ClockCircleOutlined />, color: '#8c8c8c' },
      ]} />
    </div>
  );
}
