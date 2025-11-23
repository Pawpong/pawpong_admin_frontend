import React, { useEffect, useState } from 'react';
import { Table, Card, Tag, Space, Button, message, Row, Col, Statistic, DatePicker, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import { breederApi } from '../../features/breeder/api/breederApi';
import type { ApplicationData, ApplicationMonitoringRequest } from '../../shared/types/api.types';

const { RangePicker } = DatePicker;
const { Search } = Input;

/**
 * 입양 신청 모니터링 페이지
 * 전체 입양 신청 현황을 모니터링합니다.
 */
const ApplicationMonitoring: React.FC = () => {
  const [dataSource, setDataSource] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalCount: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    completedCount: 0,
  });
  const [filters, setFilters] = useState<ApplicationMonitoringRequest>({
    pageNumber: 1,
    itemsPerPage: 10,
  });

  useEffect(() => {
    fetchApplications();
  }, [filters]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await breederApi.getApplications(filters);
      // 데이터 검증
      if (data && Array.isArray(data.applications)) {
        setDataSource(data.applications);
        setStats({
          totalCount: data.totalCount || 0,
          pendingCount: data.pendingCount || 0,
          approvedCount: data.approvedCount || 0,
          rejectedCount: data.rejectedCount || 0,
          completedCount: data.completedCount || 0,
        });
      } else {
        console.error('Invalid data format:', data);
        setDataSource([]);
        message.warning('데이터 형식이 올바르지 않습니다.');
      }
    } catch (error: any) {
      console.error('Failed to fetch applications:', error);
      setDataSource([]);
      message.error('입양 신청 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      pending: { color: 'default', text: '대기 중' },
      reviewed: { color: 'processing', text: '검토 중' },
      approved: { color: 'success', text: '승인됨' },
      rejected: { color: 'error', text: '거절됨' },
      completed: { color: 'blue', text: '완료됨' },
    };
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      setFilters((prev) => ({
        ...prev,
        startDate: dates[0]!.format('YYYY-MM-DD'),
        endDate: dates[1]!.format('YYYY-MM-DD'),
      }));
    } else {
      setFilters((prev) => {
        const { startDate, endDate, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleBreederSearch = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      targetBreederId: value || undefined,
    }));
  };

  const columns: ColumnsType<ApplicationData> = [
    {
      title: '신청 ID',
      dataIndex: 'applicationId',
      key: 'applicationId',
      width: 120,
      ellipsis: true,
    },
    {
      title: '입양자명',
      dataIndex: 'adopterName',
      key: 'adopterName',
      width: 120,
    },
    {
      title: '브리더명',
      dataIndex: 'breederName',
      key: 'breederName',
      width: 120,
    },
    {
      title: '반려동물',
      dataIndex: 'petName',
      key: 'petName',
      width: 120,
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '신청일',
      dataIndex: 'appliedAt',
      key: 'appliedAt',
      width: 150,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '최근 업데이트',
      dataIndex: 'lastUpdatedAt',
      key: 'lastUpdatedAt',
      width: 150,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px' }}>
        입양 신청 모니터링
      </h1>

      {/* 통계 카드 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={4}>
          <Card>
            <Statistic
              title="전체 신청"
              value={stats.totalCount}
              valueStyle={{ color: '#4f3b2e' }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="대기 중"
              value={stats.pendingCount}
              valueStyle={{ color: '#8c8c8c' }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="승인됨"
              value={stats.approvedCount}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="거절됨"
              value={stats.rejectedCount}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="완료됨"
              value={stats.completedCount}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 필터 */}
      <Card style={{ marginBottom: '24px' }}>
        <Space size="middle">
          <RangePicker
            onChange={handleDateRangeChange}
            placeholder={['시작일', '종료일']}
            style={{ width: 280 }}
          />
          <Search
            placeholder="브리더 ID로 검색"
            onSearch={handleBreederSearch}
            allowClear
            style={{ width: 280 }}
          />
          <Button onClick={fetchApplications}>새로고침</Button>
        </Space>
      </Card>

      {/* 신청 목록 테이블 */}
      <Card>
        <Table
          dataSource={dataSource}
          columns={columns}
          loading={loading}
          rowKey="applicationId"
          pagination={{
            current: filters.pageNumber,
            pageSize: filters.itemsPerPage,
            showSizeChanger: true,
            showTotal: (total) => `총 ${total}개`,
            onChange: (page, pageSize) => {
              setFilters((prev) => ({
                ...prev,
                pageNumber: page,
                itemsPerPage: pageSize,
              }));
            },
          }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default ApplicationMonitoring;
