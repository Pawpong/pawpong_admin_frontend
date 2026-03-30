import React from 'react';
import { Card, DatePicker, Input, Select, Button } from 'antd';
import { FileTextOutlined, ReloadOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';

import { useApplicationMonitoring } from '../../features/adopter/hooks/useApplicationMonitoring';
import { ApplicationStats } from '../../features/adopter/ui/ApplicationStats';
import { ApplicationTable } from '../../features/adopter/ui/ApplicationTable';
import { ApplicationDetailModal } from '../../features/adopter/ui/ApplicationDetailModal';

const { RangePicker } = DatePicker;
const { Search } = Input;

/**
 * 상담 신청 모니터링 페이지
 */
const ApplicationMonitoring: React.FC = () => {
  const { dataSource, loading, stats, filters, fetchApplications, handleDateRangeChange, handleBreederSearch, handleStatusChange, handlePageChange, detail, handleRowClick } = useApplicationMonitoring();

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <FileTextOutlined className="text-2xl" style={{ color: 'var(--color-primary-500)' }} />
          <h1 className="text-2xl sm:text-3xl font-bold m-0" style={{ color: 'var(--color-primary-500)' }}>상담 신청 현황</h1>
        </div>
        <p className="text-sm sm:text-base" style={{ color: 'var(--color-gray-500)' }}>전체 상담 신청 현황을 조회하고 모니터링합니다</p>
      </div>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-gray-700)' }}>신청 현황 통계</h2>
        <ApplicationStats stats={stats} />
      </section>

      <section className="mb-6">
        <Card style={{ borderRadius: '8px', border: '1px solid var(--color-gray-200)' }}>
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 flex-1">
              <RangePicker onChange={(dates) => handleDateRangeChange(dates as [Dayjs | null, Dayjs | null] | null)} placeholder={['시작일', '종료일']} style={{ minWidth: '250px', flex: '1 1 auto' }} />
              <Select placeholder="상태 선택" allowClear style={{ minWidth: '150px', flex: '0 1 auto' }} onChange={handleStatusChange}
                options={[{ label: '상담 대기', value: 'consultation_pending' }, { label: '상담 완료', value: 'consultation_completed' }, { label: '입양 승인', value: 'adoption_approved' }, { label: '입양 거절', value: 'adoption_rejected' }]} />
              <Search placeholder="브리더 이름 검색" onSearch={handleBreederSearch} allowClear style={{ minWidth: '200px', flex: '1 1 auto' }} />
            </div>
            <Button type="primary" icon={<ReloadOutlined />} onClick={fetchApplications}>새로고침</Button>
          </div>
        </Card>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-gray-700)' }}>상담 신청 목록</h2>
        <Card style={{ borderRadius: '8px', border: '1px solid var(--color-gray-200)' }}>
          <ApplicationTable dataSource={dataSource} loading={loading} currentPage={filters.page || 1} pageSize={filters.limit || 10} totalCount={stats.totalCount} onPageChange={handlePageChange} onRowClick={handleRowClick} />
        </Card>
      </section>

      <ApplicationDetailModal visible={detail.isOpen} loading={detail.loading} application={detail.application} onClose={detail.close} />
    </div>
  );
};

export default ApplicationMonitoring;
