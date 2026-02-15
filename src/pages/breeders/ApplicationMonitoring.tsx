import React, { useEffect, useState, useCallback } from 'react';
import { Table, Card, Tag, Button, message, DatePicker, Input, Select, Modal, Descriptions, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import { FileTextOutlined, ReloadOutlined } from '@ant-design/icons';

import { adopterApi } from '../../features/adopter/api/adopterApi';
import type {
  ApplicationData,
  ApplicationMonitoringRequest,
  ApplicationDetailData,
} from '../../shared/types/api.types';

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
    page: 1,
    limit: 10,
  });

  // 상세 모달 상태
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationDetailData | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adopterApi.getApplicationList(filters);
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
    } catch (error: unknown) {
      console.error('Failed to fetch applications:', error);
      setDataSource([]);
      message.error('입양 신청 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      consultation_pending: { color: 'default', text: '상담 대기' },
      consultation_completed: { color: 'processing', text: '상담 완료' },
      adoption_approved: { color: 'success', text: '입양 승인' },
      adoption_rejected: { color: 'error', text: '입양 거절' },
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { startDate, endDate, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleBreederSearch = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      breederName: value || undefined,
    }));
  };

  /**
   * 테이블 행 클릭 시 상세 조회
   */
  const handleRowClick = async (record: ApplicationData) => {
    setIsDetailModalOpen(true);
    setDetailLoading(true);
    setSelectedApplication(null);
    try {
      const detail = await adopterApi.getApplicationDetail(record.applicationId);
      setSelectedApplication(detail);
    } catch (error: unknown) {
      console.error('Failed to fetch application detail:', error);
      message.error('신청 상세 정보를 불러올 수 없습니다.');
      setIsDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
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
      title: '처리일시',
      dataIndex: 'processedAt',
      key: 'processedAt',
      width: 150,
      render: (date: string) => (date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'),
    },
  ];

  return (
    <div className="p-3 sm:p-4 md:p-6">
      {/* 페이지 헤더 */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <FileTextOutlined className="text-2xl" style={{ color: 'var(--color-primary-500)' }} />
          <h1 className="text-2xl sm:text-3xl font-bold m-0" style={{ color: 'var(--color-primary-500)' }}>
            상담 신청 현황
          </h1>
        </div>
        <p className="text-sm sm:text-base" style={{ color: 'var(--color-gray-500)' }}>
          전체 상담 신청 현황을 조회하고 모니터링합니다
        </p>
      </div>

      {/* 통계 섹션 */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-gray-700)' }}>
          신청 현황 통계
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card
            style={{
              borderRadius: '8px',
              border: '1px solid var(--color-gray-200)',
            }}
          >
            <p className="text-sm mb-1" style={{ color: 'var(--color-gray-500)' }}>
              전체 신청
            </p>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-primary-500)' }}>
              {stats.totalCount}건
            </p>
          </Card>

          <Card
            style={{
              borderRadius: '8px',
              border: '1px solid var(--color-gray-200)',
            }}
          >
            <p className="text-sm mb-1" style={{ color: 'var(--color-gray-500)' }}>
              상담 대기
            </p>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-gray-600)' }}>
              {stats.pendingCount}건
            </p>
          </Card>

          <Card
            style={{
              borderRadius: '8px',
              border: '1px solid var(--color-gray-200)',
            }}
          >
            <p className="text-sm mb-1" style={{ color: 'var(--color-gray-500)' }}>
              상담 완료
            </p>
            <p className="text-2xl font-bold" style={{ color: '#1890ff' }}>
              {stats.completedCount}건
            </p>
          </Card>

          <Card
            style={{
              borderRadius: '8px',
              border: '1px solid var(--color-gray-200)',
            }}
          >
            <p className="text-sm mb-1" style={{ color: 'var(--color-gray-500)' }}>
              입양 승인
            </p>
            <p className="text-2xl font-bold" style={{ color: '#52c41a' }}>
              {stats.approvedCount}건
            </p>
          </Card>

          <Card
            style={{
              borderRadius: '8px',
              border: '1px solid var(--color-gray-200)',
            }}
          >
            <p className="text-sm mb-1" style={{ color: 'var(--color-gray-500)' }}>
              입양 거절
            </p>
            <p className="text-2xl font-bold" style={{ color: '#ff4d4f' }}>
              {stats.rejectedCount}건
            </p>
          </Card>
        </div>
      </section>

      {/* 필터 섹션 */}
      <section className="mb-6">
        <Card
          style={{
            borderRadius: '8px',
            border: '1px solid var(--color-gray-200)',
          }}
        >
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 flex-1">
              <RangePicker
                onChange={handleDateRangeChange}
                placeholder={['시작일', '종료일']}
                style={{ minWidth: '250px', flex: '1 1 auto' }}
              />
              <Select
                placeholder="상태 선택"
                allowClear
                style={{ minWidth: '150px', flex: '0 1 auto' }}
                onChange={(value) => {
                  setFilters((prev) => ({
                    ...prev,
                    status: value,
                  }));
                }}
                options={[
                  { label: '상담 대기', value: 'consultation_pending' },
                  { label: '상담 완료', value: 'consultation_completed' },
                  { label: '입양 승인', value: 'adoption_approved' },
                  { label: '입양 거절', value: 'adoption_rejected' },
                ]}
              />
              <Search
                placeholder="브리더 이름 검색"
                onSearch={handleBreederSearch}
                allowClear
                style={{ minWidth: '200px', flex: '1 1 auto' }}
              />
            </div>
            <Button type="primary" icon={<ReloadOutlined />} onClick={fetchApplications}>
              새로고침
            </Button>
          </div>
        </Card>
      </section>

      {/* 신청 목록 테이블 */}
      <section>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-gray-700)' }}>
          상담 신청 목록
        </h2>
        <Card
          style={{
            borderRadius: '8px',
            border: '1px solid var(--color-gray-200)',
          }}
        >
          <Table
            dataSource={dataSource}
            columns={columns}
            loading={loading}
            rowKey="applicationId"
            scroll={{ x: 1000 }}
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
              style: { cursor: 'pointer' },
            })}
            pagination={{
              current: filters.page,
              pageSize: filters.limit,
              total: stats.totalCount,
              showSizeChanger: true,
              showTotal: (total) => `총 ${total}건`,
              onChange: (page, pageSize) => {
                setFilters((prev) => ({
                  ...prev,
                  page: page,
                  limit: pageSize,
                }));
              },
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
          />
        </Card>
      </section>

      {/* 신청 상세 모달 */}
      <Modal
        title="상담 신청 상세"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            닫기
          </Button>,
        ]}
        width="100%"
        style={{ maxWidth: '800px', top: 20 }}
        styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' } }}
      >
        {detailLoading ? (
          <div className="flex justify-center items-center py-12">
            <Spin size="large" />
          </div>
        ) : selectedApplication ? (
          <div className="flex flex-col gap-6">
            {/* 기본 정보 */}
            <Descriptions title="기본 정보" bordered column={{ xs: 1, sm: 2 }} size="small">
              <Descriptions.Item label="신청 ID" span={2}>
                {selectedApplication.applicationId}
              </Descriptions.Item>
              <Descriptions.Item label="상태">{getStatusTag(selectedApplication.status)}</Descriptions.Item>
              <Descriptions.Item label="반려동물">{selectedApplication.petName || '-'}</Descriptions.Item>
              <Descriptions.Item label="입양자명">{selectedApplication.adopterName}</Descriptions.Item>
              <Descriptions.Item label="이메일">{selectedApplication.adopterEmail}</Descriptions.Item>
              <Descriptions.Item label="전화번호">{selectedApplication.adopterPhone}</Descriptions.Item>
              <Descriptions.Item label="브리더명">{selectedApplication.breederName}</Descriptions.Item>
              <Descriptions.Item label="신청일">
                {dayjs(selectedApplication.appliedAt).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="처리일시">
                {selectedApplication.processedAt
                  ? dayjs(selectedApplication.processedAt).format('YYYY-MM-DD HH:mm')
                  : '-'}
              </Descriptions.Item>
            </Descriptions>

            {/* 신청서 내용 */}
            <Descriptions title="신청서 내용" bordered column={1} size="small">
              <Descriptions.Item label="개인정보 수집 동의">
                <Tag color={selectedApplication.standardResponses.privacyConsent ? 'success' : 'error'}>
                  {selectedApplication.standardResponses.privacyConsent ? '동의' : '미동의'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="자기소개">
                <div style={{ whiteSpace: 'pre-wrap' }}>{selectedApplication.standardResponses.selfIntroduction}</div>
              </Descriptions.Item>
              <Descriptions.Item label="가족 구성원">
                {selectedApplication.standardResponses.familyMembers}
              </Descriptions.Item>
              <Descriptions.Item label="가족 전원 동의">
                <Tag color={selectedApplication.standardResponses.allFamilyConsent ? 'success' : 'error'}>
                  {selectedApplication.standardResponses.allFamilyConsent ? '동의' : '미동의'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="알러지 검사 정보">
                {selectedApplication.standardResponses.allergyTestInfo}
              </Descriptions.Item>
              <Descriptions.Item label="집을 비우는 시간">
                {selectedApplication.standardResponses.timeAwayFromHome}
              </Descriptions.Item>
              <Descriptions.Item label="주거 공간 소개">
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedApplication.standardResponses.livingSpaceDescription}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="반려동물 경험">
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedApplication.standardResponses.previousPetExperience}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="기본 케어 가능">
                <Tag color={selectedApplication.standardResponses.canProvideBasicCare ? 'success' : 'error'}>
                  {selectedApplication.standardResponses.canProvideBasicCare ? '가능' : '불가'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="치료비 감당 가능">
                <Tag color={selectedApplication.standardResponses.canAffordMedicalExpenses ? 'success' : 'error'}>
                  {selectedApplication.standardResponses.canAffordMedicalExpenses ? '가능' : '불가'}
                </Tag>
              </Descriptions.Item>
              {selectedApplication.standardResponses.preferredPetDescription && (
                <Descriptions.Item label="관심 동물 특징">
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {selectedApplication.standardResponses.preferredPetDescription}
                  </div>
                </Descriptions.Item>
              )}
              {selectedApplication.standardResponses.desiredAdoptionTiming && (
                <Descriptions.Item label="희망 입양 시기">
                  {selectedApplication.standardResponses.desiredAdoptionTiming}
                </Descriptions.Item>
              )}
              {selectedApplication.standardResponses.additionalNotes && (
                <Descriptions.Item label="추가 메시지">
                  <div style={{ whiteSpace: 'pre-wrap' }}>{selectedApplication.standardResponses.additionalNotes}</div>
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* 커스텀 질문 응답 */}
            {selectedApplication.customResponses.length > 0 && (
              <Descriptions title="추가 질문 응답" bordered column={1} size="small">
                {selectedApplication.customResponses.map((cr) => (
                  <Descriptions.Item key={cr.questionId} label={cr.questionLabel}>
                    {Array.isArray(cr.answer) ? cr.answer.join(', ') : String(cr.answer)}
                  </Descriptions.Item>
                ))}
              </Descriptions>
            )}

            {/* 브리더 메모 */}
            {selectedApplication.breederNotes && (
              <Descriptions title="브리더 메모" bordered column={1} size="small">
                <Descriptions.Item label="메모 내용">
                  <div style={{ whiteSpace: 'pre-wrap' }}>{selectedApplication.breederNotes}</div>
                </Descriptions.Item>
              </Descriptions>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default ApplicationMonitoring;
