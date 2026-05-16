import { Table, Tag, Button, Space } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { BreederReport } from '../../../shared/types/api.types';

/** 신고 유형 한글 매핑 */
const REPORT_TYPE_MAP: Record<string, string> = {
  no_contract: '계약 불이행',
  false_info: '허위 정보',
  inappropriate_content: '부적절한 콘텐츠',
  fraudulent_listing: '사기성 매물',
  other: '기타',
};

/** 신고 상태 태그 설정 */
const STATUS_CONFIG: Record<string, { color: string; text: string }> = {
  pending: { color: 'orange', text: '대기 중' },
  approved: { color: 'red', text: '승인됨' },
  rejected: { color: 'green', text: '반려됨' },
};

export function getReportTypeText(type: string): string {
  return REPORT_TYPE_MAP[type] || type;
}

export function getStatusTag(status: string) {
  const info = STATUS_CONFIG[status] || { color: 'default', text: status };
  return <Tag color={info.color}>{info.text}</Tag>;
}

interface BreederReportTableProps {
  reports: BreederReport[];
  loading: boolean;
  pagination: { page: number; limit: number; total: number };
  onPageChange: (page: number, pageSize: number) => void;
  onView: (report: BreederReport) => void;
  onAction: (report: BreederReport, type: 'resolve' | 'reject') => void;
}

export function BreederReportTable({ reports, loading, pagination, onPageChange, onView, onAction }: BreederReportTableProps) {
  const columns: ColumnsType<BreederReport> = [
    {
      title: '신고 대상', dataIndex: 'targetName', key: 'targetName', width: 150,
      render: (name: string) => <strong>{name}</strong>,
    },
    {
      title: '신고 사유', dataIndex: 'type', key: 'type', width: 200, ellipsis: true,
      render: (type: string) => getReportTypeText(type),
    },
    {
      title: '신고일', dataIndex: 'reportedAt', key: 'reportedAt', width: 150,
      render: (date: string) => new Date(date).toLocaleDateString('ko-KR'),
    },
    {
      title: '상태', dataIndex: 'status', key: 'status', width: 100,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '액션', key: 'action', width: 250,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" icon={<EyeOutlined />} onClick={() => onView(record)}>상세</Button>
          {record.status === 'pending' && (
            <>
              <Button danger icon={<CheckCircleOutlined />} onClick={() => onAction(record, 'resolve')} size="small">
                승인 (제재)
              </Button>
              <Button icon={<CloseCircleOutlined />} onClick={() => onAction(record, 'reject')} size="small">
                반려
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="overflow-x-auto -mx-3 sm:mx-0 mb-6">
      <Table
        columns={columns}
        dataSource={reports}
        rowKey={(record) => record.reportId}
        loading={loading}
        scroll={{ x: 800 }}
        pagination={{
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `총 ${total}건`,
          onChange: onPageChange,
          responsive: true,
        }}
      />
    </div>
  );
}
