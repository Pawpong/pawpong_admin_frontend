import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin, message, Table, Tabs, Tooltip, Typography } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  FilterOutlined,
  EnvironmentOutlined,
  FormOutlined,
  InfoCircleOutlined,
  HeartOutlined,
  FileSearchOutlined,
} from '@ant-design/icons';

import { platformApi } from '../../features/platform/api/platformApi';
import type { MvpStats } from '../../shared/types/api.types';

const { TabPane } = Tabs;
const { Text } = Typography;

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
      render: (_: unknown, __: unknown, index: number) => (
        <span className="font-semibold text-gray-600">{index + 1}</span>
      ),
    },
    {
      title: '필터 값',
      dataIndex: 'filterValue',
      key: 'filterValue',
      render: (value: string) => <span className="font-medium">{value || '-'}</span>,
    },
    {
      title: '브리더 수',
      dataIndex: 'usageCount',
      key: 'usageCount',
      render: (count: number) => <span className="text-blue-600 font-semibold">{count.toLocaleString()}명</span>,
    },
  ];

  // 카드 제목에 툴팁을 추가하는 헬퍼
  const CardTitleWithTooltip = ({ title, tooltip }: { title: string; tooltip: string }) => (
    <div className="flex items-center gap-2">
      <span>{title}</span>
      <Tooltip title={tooltip}>
        <InfoCircleOutlined className="text-gray-400 cursor-help" />
      </Tooltip>
    </div>
  );

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">MVP 핵심 통계</h1>
        <p className="text-sm sm:text-base text-gray-600">포퐁 서비스의 핵심 지표와 사용자 활동 데이터를 확인합니다.</p>
      </div>

      {/* 활성 사용자 통계 */}
      <section className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 mb-4">
          <UserOutlined className="text-xl text-blue-500" />
          <h2 className="text-lg font-semibold m-0">활성 사용자 현황</h2>
        </div>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card
              title={<CardTitleWithTooltip title="입양자 접속 현황" tooltip="해당 기간 내 로그인한 입양자 수" />}
              bordered={false}
              className="shadow-sm hover:shadow-md transition-shadow"
            >
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="최근 7일"
                    value={stats.activeUserStats.adopters7Days}
                    prefix={<UserOutlined />}
                    suffix="명"
                    valueStyle={{ color: '#3f8600', fontSize: '24px' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="최근 14일"
                    value={stats.activeUserStats.adopters14Days}
                    prefix={<UserOutlined />}
                    suffix="명"
                    valueStyle={{ color: '#52c41a', fontSize: '24px' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="최근 28일"
                    value={stats.activeUserStats.adopters28Days}
                    prefix={<UserOutlined />}
                    suffix="명"
                    valueStyle={{ color: '#73d13d', fontSize: '24px' }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title={<CardTitleWithTooltip title="브리더 접속 현황" tooltip="해당 기간 내 로그인한 브리더 수" />}
              bordered={false}
              className="shadow-sm hover:shadow-md transition-shadow"
            >
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="최근 7일"
                    value={stats.activeUserStats.breeders7Days}
                    prefix={<TeamOutlined />}
                    suffix="명"
                    valueStyle={{ color: '#1677ff', fontSize: '24px' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="최근 14일"
                    value={stats.activeUserStats.breeders14Days}
                    prefix={<TeamOutlined />}
                    suffix="명"
                    valueStyle={{ color: '#1890ff', fontSize: '24px' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="최근 28일"
                    value={stats.activeUserStats.breeders28Days}
                    prefix={<TeamOutlined />}
                    suffix="명"
                    valueStyle={{ color: '#40a9ff', fontSize: '24px' }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </section>

      {/* 상담 신청 통계 */}
      <section className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 mb-4">
          <HeartOutlined className="text-xl text-pink-500" />
          <h2 className="text-lg font-semibold m-0">상담 신청 현황</h2>
        </div>
        <Card
          title={
            <CardTitleWithTooltip
              title="상담 신청 현황"
              tooltip="입양자가 브리더에게 제출한 상담 신청서 총 건수 (모든 신청은 상담 신청으로 시작)"
            />
          }
          bordered={false}
          className="shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="mb-3">
            <Text type="secondary" className="text-xs">
              포퐁에서 입양자가 제출한 전체 상담 신청 건수입니다.
            </Text>
          </div>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Statistic
                title="최근 7일"
                value={stats.consultationStats.consultations7Days}
                prefix={<FormOutlined />}
                suffix="건"
                valueStyle={{ color: '#722ed1', fontSize: '24px' }}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title="최근 14일"
                value={stats.consultationStats.consultations14Days}
                prefix={<FormOutlined />}
                suffix="건"
                valueStyle={{ color: '#9254de', fontSize: '24px' }}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title="최근 28일"
                value={stats.consultationStats.consultations28Days}
                prefix={<FormOutlined />}
                suffix="건"
                valueStyle={{ color: '#b37feb', fontSize: '24px' }}
              />
            </Col>
          </Row>
        </Card>
      </section>

      {/* 필터 사용 통계 */}
      <section className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 mb-4">
          <FileSearchOutlined className="text-xl text-cyan-500" />
          <h2 className="text-lg font-semibold m-0">브리더 분포 현황</h2>
        </div>
        <Card className="shadow-sm">
          <div className="mb-3">
            <Text type="secondary" className="text-xs">
              승인된 브리더들의 지역 및 품종별 분포입니다. (검색 필터링 시 참고 데이터)
            </Text>
          </div>
          <Tabs defaultActiveKey="locations">
            <TabPane
              tab={
                <span className="flex items-center gap-1">
                  <EnvironmentOutlined />
                  지역별 브리더
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
                locale={{ emptyText: '데이터가 없습니다.' }}
              />
            </TabPane>
            <TabPane
              tab={
                <span className="flex items-center gap-1">
                  <FilterOutlined />
                  품종별 분양 개체
                </span>
              }
              key="breeds"
            >
              <Table
                dataSource={stats.filterUsageStats.topBreeds}
                columns={[
                  ...filterColumns.slice(0, 2),
                  {
                    title: '분양 개체 수',
                    dataIndex: 'usageCount',
                    key: 'usageCount',
                    render: (count: number) => (
                      <span className="text-purple-600 font-semibold">{count.toLocaleString()}마리</span>
                    ),
                  },
                ]}
                rowKey="filterValue"
                pagination={false}
                size="small"
                locale={{ emptyText: '데이터가 없습니다.' }}
              />
            </TabPane>
          </Tabs>
        </Card>
      </section>

      {/* 브리더 서류 재제출 통계 */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <TeamOutlined className="text-xl text-orange-500" />
          <h2 className="text-lg font-semibold m-0">브리더 인증 현황</h2>
        </div>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow text-center">
              <Statistic
                title={
                  <Tooltip title="인증 심사에서 반려된 총 건수">
                    <span className="cursor-help">총 반려 건수</span>
                  </Tooltip>
                }
                value={stats.breederResubmissionStats.totalRejections}
                suffix="건"
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow text-center">
              <Statistic
                title={
                  <Tooltip title="반려 후 서류를 다시 제출한 건수">
                    <span className="cursor-help">재제출 건수</span>
                  </Tooltip>
                }
                value={stats.breederResubmissionStats.resubmissions}
                suffix="건"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow text-center">
              <Statistic
                title={
                  <Tooltip title="반려 건 중 재제출한 비율">
                    <span className="cursor-help">재제출 비율</span>
                  </Tooltip>
                }
                value={stats.breederResubmissionStats.resubmissionRate}
                suffix="%"
                precision={0}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow text-center">
              <Statistic
                title={
                  <Tooltip title="재제출 후 최종 승인된 비율">
                    <span className="cursor-help">재제출 후 승인율</span>
                  </Tooltip>
                }
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
