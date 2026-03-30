import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import type { ApplicationData } from '../../../shared/types/api.types';

const STATUS_CONFIG: Record<string, { color: string; text: string }> = {
  consultation_pending: { color: 'default', text: '상담 대기' },
  consultation_completed: { color: 'processing', text: '상담 완료' },
  adoption_approved: { color: 'success', text: '입양 승인' },
  adoption_rejected: { color: 'error', text: '입양 거절' },
};

interface Props {
  dataSource: ApplicationData[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, pageSize: number) => void;
  onRowClick: (record: ApplicationData) => void;
}

export function ApplicationTable({ dataSource, loading, currentPage, pageSize, totalCount, onPageChange, onRowClick }: Props) {
  const columns: ColumnsType<ApplicationData> = [
    { title: '신청 ID', dataIndex: 'applicationId', key: 'applicationId', width: 120, ellipsis: true },
    { title: '입양자명', dataIndex: 'adopterName', key: 'adopterName', width: 120 },
    { title: '브리더명', dataIndex: 'breederName', key: 'breederName', width: 120 },
    { title: '반려동물', dataIndex: 'petName', key: 'petName', width: 120 },
    { title: '상태', dataIndex: 'status', key: 'status', width: 100, render: (s: string) => { const c = STATUS_CONFIG[s] || { color: 'default', text: s }; return <Tag color={c.color}>{c.text}</Tag>; } },
    { title: '신청일', dataIndex: 'appliedAt', key: 'appliedAt', width: 150, render: (d: string) => dayjs(d).format('YYYY-MM-DD HH:mm') },
    { title: '처리일시', dataIndex: 'processedAt', key: 'processedAt', width: 150, render: (d: string) => d ? dayjs(d).format('YYYY-MM-DD HH:mm') : '-' },
  ];

  return (
    <Table dataSource={dataSource} columns={columns} loading={loading} rowKey="applicationId" scroll={{ x: 1000 }}
      onRow={(record) => ({ onClick: () => onRowClick(record), style: { cursor: 'pointer' } })}
      pagination={{ current: currentPage, pageSize, total: totalCount, showSizeChanger: true, showTotal: (t) => `총 ${t}건`, onChange: onPageChange, pageSizeOptions: ['10', '20', '50', '100'] }} />
  );
}
