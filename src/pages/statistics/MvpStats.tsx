import { Spin } from 'antd';
import { PageHeading } from '../../shared/components/admin/PageHeading';

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

  if (loading) return <div className="page-loading"><Spin size="large" /></div>;
  if (!stats) return <div>데이터를 불러올 수 없습니다.</div>;

  return (
    <div>
      <PageHeading
        title="MVP 핵심 통계"
        description="최근 7·14·28일의 접속자와 상담 신청, 브리더 분포와 인증 재제출 지표를 확인합니다."
      />

      <div className="section-heading">
        <h2>활성 사용자 현황</h2>
      </div>
      <ActiveUserStats
        adopters7={stats.activeUserStats.adopters7Days} adopters14={stats.activeUserStats.adopters14Days} adopters28={stats.activeUserStats.adopters28Days}
        breeders7={stats.activeUserStats.breeders7Days} breeders14={stats.activeUserStats.breeders14Days} breeders28={stats.activeUserStats.breeders28Days}
      />

      <div className="section-heading">
        <h2>상담 신청 현황</h2>
      </div>
      <ConsultationStats days7={stats.consultationStats.consultations7Days} days14={stats.consultationStats.consultations14Days} days28={stats.consultationStats.consultations28Days} />

      <div className="section-heading">
        <h2>브리더 분포 현황</h2>
      </div>
      <FilterUsageStats topLocations={stats.filterUsageStats.topLocations} topBreeds={stats.filterUsageStats.topBreeds} />

      <div className="section-heading">
        <h2>브리더 인증 현황</h2>
      </div>
      <ResubmissionStats
        totalRejections={stats.breederResubmissionStats.totalRejections} resubmissions={stats.breederResubmissionStats.resubmissions}
        resubmissionRate={stats.breederResubmissionStats.resubmissionRate} resubmissionApprovalRate={stats.breederResubmissionStats.resubmissionApprovalRate}
      />
    </div>
  );
}
