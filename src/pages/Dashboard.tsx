import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Skeleton, Table, Tag } from 'antd';
import { ArrowRightOutlined, ReloadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { platformApi } from '../features/platform/api/platformApi';
import { useRemoteData } from '../shared/hooks/useRemoteData';
import { LoadError, Metric, PageHeading } from '../shared/components/admin/PageHeading';
import { useAuthStore } from '../features/auth/store/authStore';

export default function Dashboard() {
  const state = useRemoteData(useCallback(() => platformApi.getStats(), []));
  const user = useAuthStore((value) => value.user);
  const stats = state.data;
  const tasks = [
    {
      title: '브리더 입점 신청',
      detail: '새로운 브리더가 심사를 기다리고 있어요.',
      value: stats?.userStatistics.pendingBreederCount,
      path: '/breeders/verification',
    },
    {
      title: '상담 신청',
      detail: '브리더와 입양자의 만남을 확인하세요.',
      value: stats?.adoptionStatistics.pendingApplicationCount,
      path: '/breeders/applications',
    },
    {
      title: '미처리 신고',
      detail: '안전한 포퐁을 위해 접수된 신고를 살펴보세요.',
      value: stats?.reportStatistics.pendingReportCount,
      path: '/reports/breeders',
    },
  ];
  return (
    <div className="dashboard-page">
      <PageHeading
        title="대시보드"
        description="포퐁의 오늘을 한눈에 확인하세요."
        action={
          <Button icon={<ReloadOutlined />} onClick={state.reload} loading={state.loading}>
            새로고침
          </Button>
        }
      />
      <section className="welcome-banner">
        <div>
          <span className="welcome-label">좋은 만남을 만드는 공간</span>
          <h2>{user?.name || '관리자'}님, 반가워요.</h2>
          <p>
            작은 확인 하나가 더 좋은 만남으로 이어져요.
            <br />
            오늘도 포퐁의 새로운 시작을 함께해주세요.
          </p>
          <Link to="/breeders/verification">
            <Button type="primary">
              입점 신청 확인 <ArrowRightOutlined />
            </Button>
          </Link>
        </div>
        <div className="welcome-art">
          <img src="/brand/pawpong-dog.svg" width={155} height={155} alt="포퐁 픽셀 강아지" />
          <span>HELLO, PAWPONG!</span>
        </div>
      </section>
      <LoadError error={state.error} retry={state.reload} />
      <div className="section-heading">
        <h2>플랫폼 한눈에 보기</h2>
        <span>현재 누적 현황</span>
      </div>
      <div className="metric-grid">
        <Metric
          label="전체 입양자"
          value={stats?.userStatistics.totalAdopterCount ?? '—'}
          note={`신규 ${stats?.userStatistics.newAdopterCount ?? '—'}명`}
        />
        <Metric
          label="전체 브리더"
          value={stats?.userStatistics.totalBreederCount ?? '—'}
          note={`승인 ${stats?.userStatistics.approvedBreederCount ?? '—'}명`}
        />
        <Metric
          label="누적 상담 신청"
          value={stats?.adoptionStatistics.totalApplicationCount ?? '—'}
          note={`신규 ${stats?.adoptionStatistics.newApplicationCount ?? '—'}건`}
        />
        <Metric
          label="완료된 입양"
          value={stats?.adoptionStatistics.completedAdoptionCount ?? '—'}
          note="소중한 가족이 된 만남"
        />
      </div>
      <div className="dashboard-columns">
        <Card title="확인이 필요한 일" extra={<Tag className="soft-tag">운영 체크</Tag>}>
          <div className="task-list">
            {tasks.map((task) => (
              <Link to={task.path} key={task.path}>
                <div>
                  <strong>{task.title}</strong>
                  <p>{task.detail}</p>
                </div>
                <span className="task-count">
                  {task.value ?? '—'}
                  <small>건</small>
                </span>
                <ArrowRightOutlined />
              </Link>
            ))}
          </div>
        </Card>
        <Card title="운영 바로가기">
          <div className="quick-links">
            {[
              { title: '콘텐츠 업데이트', sub: '메인 배너와 공지사항 관리', path: '/content/banners' },
              { title: '알림 보내기', sub: '사용자에게 전할 새로운 소식', path: '/notifications/push' },
              { title: '시스템 상태', sub: '서비스 연결 및 오류 현황', path: '/settings/health' },
            ].map((item) => (
              <Link to={item.path} key={item.path}>
                <CheckCircleOutlined />
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.sub}</p>
                </div>
                <ArrowRightOutlined />
              </Link>
            ))}
          </div>
        </Card>
      </div>
      <div className="section-heading">
        <h2>인기 품종과 브리더</h2>
        <Link to="/statistics">
          전체 통계 보기 <ArrowRightOutlined />
        </Link>
      </div>
      {state.loading ? (
        <Skeleton active />
      ) : (
        <div className="dashboard-columns">
          <Card title="상담이 많은 품종">
            <Table
              size="small"
              pagination={false}
              rowKey={(row) => `${row.petType}-${row.breedName}`}
              dataSource={stats?.popularBreeds.slice(0, 5)}
              columns={[
                { title: '품종', dataIndex: 'breedName' },
                { title: '상담 신청', dataIndex: 'applicationCount', align: 'right' },
                { title: '입양 완료', dataIndex: 'completedAdoptionCount', align: 'right' },
              ]}
            />
          </Card>
          <Card title="브리더 활동 현황">
            <Table
              size="small"
              pagination={false}
              rowKey="breederId"
              dataSource={stats?.breederPerformanceRanking.slice(0, 5)}
              columns={[
                { title: '브리더', dataIndex: 'breederName' },
                { title: '지역', dataIndex: 'cityName' },
                { title: '상담 신청', dataIndex: 'applicationCount', align: 'right' },
              ]}
            />
          </Card>
        </div>
      )}
    </div>
  );
}
