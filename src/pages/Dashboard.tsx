import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin, message } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';

import { platformApi } from '../features/platform/api/platformApi';
import type { PlatformStats } from '../shared/types/api.types';

export default function Dashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await platformApi.getStats();
      setStats(data);
    } catch (error: unknown) {
      console.error('Failed to fetch stats:', error);
      message.error('통계 데이터를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!stats) {
    return <div>데이터를 불러올 수 없습니다.</div>;
  }

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">대시보드</h1>
      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
        전체 플랫폼 통계를 한눈에 확인합니다.
      </p>

      {/* 사용자 통계 */}
      <section className="mb-6 sm:mb-8">
        <h2 className="text-lg font-semibold mb-4">사용자 통계</h2>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="전체 입양자"
                value={stats.userStatistics.totalAdopterCount}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="전체 브리더"
                value={stats.userStatistics.totalBreederCount}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1677ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="승인된 브리더"
                value={stats.userStatistics.approvedBreederCount}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="승인 대기 브리더"
                value={stats.userStatistics.pendingBreederCount}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>
      </section>

      {/* 입양 신청 통계 */}
      <section className="mb-6 sm:mb-8">
        <h2 className="text-lg font-semibold mb-4">입양 신청 통계</h2>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="전체 신청"
                value={stats.adoptionStatistics.totalApplicationCount}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="대기 중"
                value={stats.adoptionStatistics.pendingApplicationCount}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="완료됨"
                value={stats.adoptionStatistics.completedAdoptionCount}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="거절됨"
                value={stats.adoptionStatistics.rejectedApplicationCount}
                prefix={<WarningOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>
      </section>

      {/* 신고 통계 */}
      <section>
        <h2 className="text-lg font-semibold mb-4">신고 통계</h2>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="전체 신고"
                value={stats.reportStatistics.totalReportCount}
                prefix={<WarningOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="대기 중인 신고"
                value={stats.reportStatistics.pendingReportCount}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="처리된 신고"
                value={stats.reportStatistics.resolvedReportCount}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="기각된 신고"
                value={stats.reportStatistics.dismissedReportCount}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#8c8c8c' }}
              />
            </Card>
          </Col>
        </Row>
      </section>
    </div>
  );
}
