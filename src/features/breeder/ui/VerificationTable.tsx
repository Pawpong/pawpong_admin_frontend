import { Table, Tag, Space, Button } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import type { BreederVerification } from '../../../shared/types/api.types';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: '대기 중', color: 'default' },
  reviewing: { label: '검토 중', color: 'processing' },
  approved: { label: '승인됨', color: 'success' },
  rejected: { label: '반려됨', color: 'error' },
};

interface VerificationTableProps {
  dataSource: BreederVerification[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  selectedBreeders: string[];
  onSelectChange: (keys: string[]) => void;
  onPageChange: (page: number, pageSize: number) => void;
  onViewDetails: (record: BreederVerification) => void;
  onMarkAsReviewing: (breederId: string) => void;
  onApprove: (breederId: string, level: 'new' | 'elite') => void;
  onReject: (record: BreederVerification) => void;
}

export function VerificationTable({
  dataSource, loading, currentPage, pageSize, totalCount,
  selectedBreeders, onSelectChange, onPageChange,
  onViewDetails, onMarkAsReviewing, onApprove, onReject,
}: VerificationTableProps) {
  const columns: ColumnsType<BreederVerification> = [
    { title: '브리더명', dataIndex: 'breederName', key: 'breederName', width: 150 },
    { title: '이메일', dataIndex: 'emailAddress', key: 'emailAddress', width: 200 },
    { title: '전화번호', dataIndex: 'phoneNumber', key: 'phoneNumber', width: 130, render: (p: string) => p || '-' },
    {
      title: '요금제', dataIndex: ['verificationInfo', 'subscriptionPlan'], key: 'subscriptionPlan', width: 120,
      render: (plan: string) => <Tag color={plan === 'premium' ? 'gold' : 'blue'}>{plan === 'premium' ? '프리미엄' : '베이직'}</Tag>,
    },
    {
      title: '신청 레벨', dataIndex: ['verificationInfo', 'level'], key: 'level', width: 100,
      render: (level: string) => (
        <Tag style={{ backgroundColor: level === 'elite' ? 'var(--color-level-elite-100)' : 'var(--color-level-new-100)', color: level === 'elite' ? 'var(--color-level-elite-500)' : 'var(--color-level-new-500)', borderColor: level === 'elite' ? 'var(--color-level-elite-500)' : 'var(--color-level-new-500)', fontWeight: 500 }}>
          {level === 'elite' ? '엘리트' : '뉴'}
        </Tag>
      ),
    },
    {
      title: '신청일', dataIndex: ['verificationInfo', 'submittedAt'], key: 'submittedAt', width: 150,
      render: (date: string) => date ? new Date(date).toLocaleDateString('ko-KR') : '-',
    },
    {
      title: '상태', dataIndex: ['verificationInfo', 'verificationStatus'], key: 'verificationStatus', width: 120,
      render: (s: string) => { const c = STATUS_MAP[s] || { label: s, color: 'default' }; return <Tag color={c.color}>{c.label}</Tag>; },
    },
    {
      title: '액션', key: 'action', width: 400,
      render: (_, record) => {
        const level = record.verificationInfo?.level || 'new';
        return (
          <Space size="small" onClick={(e) => e.stopPropagation()}>
            <Button type="link" icon={<EyeOutlined />} onClick={() => onViewDetails(record)}>상세 보기</Button>
            <Button onClick={() => onMarkAsReviewing(record.breederId)} size="small" style={{ backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#f59e0b', fontWeight: 500 }}>리뷰 완료</Button>
            {level === 'elite' && (
              <Button icon={<CheckCircleOutlined />} onClick={() => onApprove(record.breederId, 'elite')} size="small" style={{ backgroundColor: 'var(--color-level-elite-100)', color: 'var(--color-level-elite-500)', borderColor: 'var(--color-level-elite-500)', fontWeight: 500 }}>엘리트 승인</Button>
            )}
            {level === 'new' && (
              <Button icon={<CheckCircleOutlined />} onClick={() => onApprove(record.breederId, 'new')} size="small" style={{ backgroundColor: 'var(--color-level-new-100)', color: 'var(--color-level-new-500)', borderColor: 'var(--color-level-new-500)', fontWeight: 500 }}>뉴 승인</Button>
            )}
            <Button danger icon={<CloseCircleOutlined />} onClick={() => onReject(record)} size="small">반려</Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="overflow-x-auto -mx-3 sm:mx-0">
      <Table
        columns={columns} dataSource={dataSource} rowKey="breederId" loading={loading} scroll={{ x: 800 }}
        rowSelection={{ selectedRowKeys: selectedBreeders, onChange: (keys) => onSelectChange(keys as string[]) }}
        pagination={{ current: currentPage, pageSize, total: totalCount, showSizeChanger: true, showTotal: (t) => `총 ${t}건`, responsive: true, onChange: onPageChange }}
      />
    </div>
  );
}
