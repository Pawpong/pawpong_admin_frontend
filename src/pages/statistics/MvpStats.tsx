import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin, message, Table, Tabs } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  PhoneOutlined,
  FilterOutlined,
  FileTextOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';

import { platformApi } from '../../features/platform/api/platformApi';
import type { MvpStats } from '../../shared/types/api.types';

const { TabPane } = Tabs;

export default function MvpStatsPage() {
  const [stats, setStats] = useState<MvpStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await platformApi.getMvpStats();
      setStats(data);
    } catch (error: unknown) {
      console.error('Failed to fetch MVP stats:', error);
      message.error('MVP 통계 데이터를 불러올 수 없습니다.');
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

  // 필터 사용 통계 테이블 컬럼
  const filterColumns = [
    {
      title: '순위',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: '필터 값',
      dataIndex: 'filterValue',
      key: 'filterValue',
    },
    {
      title: '사용 횟수',
      dataIndex: 'usageCount',
      key: 'usageCount',
      render: (count: number) => count.toLocaleString(),
    },
  ];

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">MVP 핵심 통계</h1>
      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
        서비스의 핵심 지표와 사용자 활동 데이터를 확인합니다.
      </p>

      {/* 활성 사용자 통계 */}
      <section className="mb-6 sm:mb-8">
        <h2 className="text-lg font-semibold mb-4">활성 사용자 통계</h2>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="입양자 접속 현황" bordered={false}>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="최근 7일"
                    value={stats.activeUserStats.adopters7Days}
                    prefix={<UserOutlined />}
                    suffix="명"
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="최근 14일"
                    value={stats.activeUserStats.adopters14Days}
                    prefix={<UserOutlined />}
                    suffix="명"
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="최근 28일"
                    value={stats.activeUserStats.adopters28Days}
                    prefix={<UserOutlined />}
                    suffix="명"
                    valueStyle={{ color: '#73d13d' }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="브리더 접속 현황" bordered={false}>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="최근 7일"
                    value={stats.activeUserStats.breeders7Days}
                    prefix={<TeamOutlined />}
                    suffix="명"
                    valueStyle={{ color: '#1677ff' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="최근 14일"
                    value={stats.activeUserStats.breeders14Days}
                    prefix={<TeamOutlined />}
                    suffix="명"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="최근 28일"
                    value={stats.activeUserStats.breeders28Days}
                    prefix={<TeamOutlined />}
                    suffix="명"
                    valueStyle={{ color: '#40a9ff' }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </section>

      {/* 상담/입양 신청 통계 */}
      <section className="mb-6 sm:mb-8">
        <h2 className="text-lg font-semibold mb-4">상담/입양 신청 통계</h2>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="상담 신청 현황" bordered={false}>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="최근 7일"
                    value={stats.consultationStats.consultations7Days}
                    prefix={<PhoneOutlined />}
                    suffix="건"
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="최근 14일"
                    value={stats.consultationStats.consultations14Days}
                    prefix={<PhoneOutlined />}
                    suffix="건"
                    valueStyle={{ color: '#9254de' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="최근 28일"
                    value={stats.consultationStats.consultations28Days}
                    prefix={<PhoneOutlined />}
                    suffix="건"
                    valueStyle={{ color: '#b37feb' }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="입양 신청 현황" bordered={false}>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="최근 7일"
                    value={stats.consultationStats.adoptions7Days}
                    prefix={<FileTextOutlined />}
                    suffix="건"
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="최근 14일"
                    value={stats.consultationStats.adoptions14Days}
                    prefix={<FileTextOutlined />}
                    suffix="건"
                    valueStyle={{ color: '#ffa940' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="최근 28일"
                    value={stats.consultationStats.adoptions28Days}
                    prefix={<FileTextOutlined />}
                    suffix="건"
                    valueStyle={{ color: '#ffc069' }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </section>

      {/* 필터 사용 통계 */}
      <section className="mb-6 sm:mb-8">
        <h2 className="text-lg font-semibold mb-4">인기 검색 필터</h2>
        <Card>
          <Tabs defaultActiveKey="locations">
            <TabPane
              tab={
                <span>
                  <EnvironmentOutlined />
                  지역 필터
                </span>
              }
              key="locations"
            >
              <Table
                dataSource={stats.filterUsageStats.topLocations}
                columns={filterColumns}
                rowKey="filterValue"
                pagination={false}
                size="small"
              />
            </TabPane>
            <TabPane
              tab={
                <span>
                  <FilterOutlined />
                  품종 필터
                </span>
              }
              key="breeds"
            >
              <Table
                dataSource={stats.filterUsageStats.topBreeds}
                columns={filterColumns}
                rowKey="filterValue"
                pagination={false}
                size="small"
              />
            </TabPane>
          </Tabs>
        </Card>
      </section>

      {/* 브리더 서류 재제출 통계 */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">브리더 서류 재제출 통계</h2>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="총 반려 건수"
                value={stats.breederResubmissionStats.totalRejections}
                suffix="건"
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="재제출 건수"
                value={stats.breederResubmissionStats.resubmissions}
                suffix="건"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="재제출 비율"
                value={stats.breederResubmissionStats.resubmissionRate}
                suffix="%"
                precision={0}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="재제출 후 승인율"
                value={stats.breederResubmissionStats.resubmissionApprovalRate}
                suffix="%"
                precision={0}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>
      </section>
    </div>
  );
}
