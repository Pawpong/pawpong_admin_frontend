import { Spin } from 'antd';
import { UserOutlined, HeartOutlined, FileSearchOutlined, TeamOutlined } from '@ant-design/icons';

import { useMvpStats } from '../../features/platform/hooks/useMvpStats';
import { ActiveUserStats } from '../../features/platform/ui/ActiveUserStats';
import { ConsultationStats } from '../../features/platform/ui/ConsultationStats';
import { FilterUsageStats } from '../../features/platform/ui/FilterUsageStats';
import { ResubmissionStats } from '../../features/platform/ui/ResubmissionStats';

/**
 * MVP 핵심 통계 페이지
 */
export default function MvpStatsPage() {
  const { stats, loading } = useMvpStats();

  if (loading) return <div className="flex items-center justify-center h-96"><Spin size="large" /></div>;
  if (!stats) return <div>데이터를 불러올 수 없습니다.</div>;

  const SectionTitle = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
    <div className="flex items-center gap-2 mb-4">{icon}<h2 className="text-lg font-semibold m-0">{title}</h2></div>
  );

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">MVP 핵심 통계</h1>
        <p className="text-sm sm:text-base text-gray-600">포퐁 서비스의 핵심 지표와 사용자 활동 데이터를 확인합니다.</p>
      </div>

      <section className="mb-6 sm:mb-8">
        <SectionTitle icon={<UserOutlined className="text-xl text-blue-500" />} title="활성 사용자 현황" />
        <ActiveUserStats
          adopters7={stats.activeUserStats.adopters7Days} adopters14={stats.activeUserStats.adopters14Days} adopters28={stats.activeUserStats.adopters28Days}
          breeders7={stats.activeUserStats.breeders7Days} breeders14={stats.activeUserStats.breeders14Days} breeders28={stats.activeUserStats.breeders28Days}
        />
      </section>

      <section className="mb-6 sm:mb-8">
        <SectionTitle icon={<HeartOutlined className="text-xl text-pink-500" />} title="상담 신청 현황" />
        <ConsultationStats days7={stats.consultationStats.consultations7Days} days14={stats.consultationStats.consultations14Days} days28={stats.consultationStats.consultations28Days} />
      </section>

      <section className="mb-6 sm:mb-8">
        <SectionTitle icon={<FileSearchOutlined className="text-xl text-cyan-500" />} title="브리더 분포 현황" />
        <FilterUsageStats topLocations={stats.filterUsageStats.topLocations} topBreeds={stats.filterUsageStats.topBreeds} />
      </section>

      <section className="mb-8">
        <SectionTitle icon={<TeamOutlined className="text-xl text-orange-500" />} title="브리더 인증 현황" />
        <ResubmissionStats
          totalRejections={stats.breederResubmissionStats.totalRejections} resubmissions={stats.breederResubmissionStats.resubmissions}
          resubmissionRate={stats.breederResubmissionStats.resubmissionRate} resubmissionApprovalRate={stats.breederResubmissionStats.resubmissionApprovalRate}
        />
      </section>
    </div>
  );
}
