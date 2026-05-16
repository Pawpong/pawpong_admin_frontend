import { Table, Tag, Space, Button, Typography, Popconfirm } from 'antd';
import { DeleteOutlined, EyeOutlined, WarningOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { ReviewReportItem } from '../../../shared/types/api.types';

const { Text } = Typography;

/** 신고 사유 한글 매핑 */
const REASON_MAP: Record<string, string> = {
  inappropriate_content: '부적절한 내용',
  spam: '스팸',
  fake_review: '허위 후기',
  offensive_language: '욕설/비방',
  other: '기타',
};

export function getReasonLabel(reason: string): string {
  return REASON_MAP[reason] || reason;
}

interface ReviewReportTableProps {
  reports: ReviewReportItem[];
  loading: boolean;
  pagination: { current: number; pageSize: number; total: number };
  onPageChange: (page: number, pageSize: number) => void;
  onView: (report: ReviewReportItem) => void;
  onDelete: (breederId: string, reviewId: string) => void;
}

export function ReviewReportTable({ reports, loading, pagination, onPageChange, onView, onDelete }: ReviewReportTableProps) {
  const columns: ColumnsType<ReviewReportItem> = [
    {
      title: '브리더', dataIndex: 'breederName', key: 'breederName', width: 150,
      render: (name: string) => <span style={{ fontWeight: 500 }}>{name}</span>,
    },
    {
      title: '후기 내용', dataIndex: 'content', key: 'content', ellipsis: true,
      render: (content: string) => (
        <div style={{ maxWidth: '300px' }}>
          <Text ellipsis={{ tooltip: content }}>{content}</Text>
        </div>
      ),
    },
    { title: '작성자', dataIndex: 'authorName', key: 'authorName', width: 120 },
    { title: '신고자', dataIndex: 'reporterName', key: 'reporterName', width: 120 },
    {
      title: '신고 사유', dataIndex: 'reportReason', key: 'reportReason', width: 130,
      render: (reason: string) => (
        <Tag color="red" icon={<WarningOutlined />}>{getReasonLabel(reason)}</Tag>
      ),
    },
    {
      title: '신고 일시', dataIndex: 'reportedAt', key: 'reportedAt', width: 150,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
      sorter: (a, b) => dayjs(a.reportedAt).unix() - dayjs(b.reportedAt).unix(),
    },
    {
      title: '공개 여부', dataIndex: 'isVisible', key: 'isVisible', width: 100,
      render: (isVisible: boolean) => isVisible ? <Tag color="green">공개</Tag> : <Tag color="default">비공개</Tag>,
    },
    {
      title: '작업', key: 'action', width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" icon={<EyeOutlined />} onClick={() => onView(record)}>상세</Button>
          <Popconfirm
            title="후기 삭제"
            description="이 후기를 삭제하시겠습니까?"
            onConfirm={() => onDelete(record.breederId, record.reviewId)}
            okText="삭제"
            cancelText="취소"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>삭제</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="overflow-x-auto -mx-3 sm:mx-0 mb-6">
      <Table
        columns={columns}
        dataSource={reports}
        rowKey="reviewId"
        loading={loading}
        scroll={{ x: 800 }}
        pagination={{
          ...pagination,
          showTotal: (total) => `총 ${total}건`,
          showSizeChanger: true,
          onChange: onPageChange,
          responsive: true,
        }}
      />
    </div>
  );
}
