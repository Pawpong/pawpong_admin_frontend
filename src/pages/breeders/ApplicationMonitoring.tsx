import React from 'react';
import { LoadError, PageHeading } from '../../shared/components/admin/PageHeading';
import { DatePicker, Input, Select, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
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
  const { dataSource, loading, loadError, stats, filters, fetchApplications, handleDateRangeChange, handleBreederSearch, handleStatusChange, handlePageChange, detail, handleRowClick } = useApplicationMonitoring();

  return (
    <div>
      <PageHeading
        title="상담 신청 현황"
        description="입양자가 브리더에게 넣은 상담 신청의 대상 반려동물, 신청일, 처리 상태를 조회합니다."
        action={<Button icon={<ReloadOutlined />} onClick={fetchApplications}>새로고침</Button>}
      />
      <LoadError error={loadError} retry={fetchApplications} />
      <ApplicationStats stats={stats} />

      <div className="filter-bar">
        <span>신청일</span>
        <RangePicker
          className="filter-control-range"
          onChange={(dates) => handleDateRangeChange(dates as [Dayjs | null, Dayjs | null] | null)}
          placeholder={['시작일', '종료일']}
        />
        <span>처리 상태</span>
        <Select
          placeholder="전체 상태"
          allowClear
          className="filter-control"
          onChange={handleStatusChange}
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
          className="filter-control-wide"
        />
      </div>
      <ApplicationTable
        dataSource={dataSource}
        loading={loading}
        currentPage={filters.page || 1}
        pageSize={filters.limit || 10}
        totalCount={stats.totalCount}
        onPageChange={handlePageChange}
        onRowClick={handleRowClick}
      />

      <ApplicationDetailModal visible={detail.isOpen} loading={detail.loading} application={detail.application} onClose={detail.close} />
    </div>
  );
};

export default ApplicationMonitoring;
