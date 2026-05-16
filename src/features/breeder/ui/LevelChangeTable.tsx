import { Table, Tag, Space, Button } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, ArrowRightOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import type { BreederVerification } from '../../../shared/types/api.types';

const getLevelTag = (level: string) => level === 'elite' ? <Tag color="purple">Elite</Tag> : <Tag color="blue">New</Tag>;

interface Props {
  dataSource: BreederVerification[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
  onViewDetails: (r: BreederVerification) => void;
  onApprove: (breederId: string, level: string) => void;
  onReject: (r: BreederVerification) => void;
}

export function LevelChangeTable({ dataSource, loading, currentPage, pageSize, totalCount, onPageChange, onViewDetails, onApprove, onReject }: Props) {
  const columns: ColumnsType<BreederVerification> = [
    { title: '브리더명', dataIndex: 'breederName', key: 'breederName', width: 120 },
    { title: '이메일', dataIndex: 'emailAddress', key: 'emailAddress', width: 200, responsive: ['md'] },
    { title: '전화번호', dataIndex: 'phoneNumber', key: 'phoneNumber', width: 140, responsive: ['lg'] },
    {
      title: '레벨 변경', key: 'levelChange', width: 180,
      render: (_, r) => <Space>{getLevelTag(r.verificationInfo.previousLevel || 'new')}<ArrowRightOutlined style={{ color: '#999' }} />{getLevelTag(r.verificationInfo.level)}</Space>,
    },
    { title: '신청일', dataIndex: ['verificationInfo', 'submittedAt'], key: 'submittedAt', width: 120, responsive: ['md'], render: (d: string) => d ? new Date(d).toLocaleDateString('ko-KR') : '-' },
    {
      title: '작업', key: 'actions', width: 280, fixed: 'right' as const,
      render: (_, r) => (
        <Space size="small" wrap>
          <Button type="link" icon={<EyeOutlined />} onClick={() => onViewDetails(r)} size="small">상세</Button>
          <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => onApprove(r.breederId, r.verificationInfo.level)} size="small" style={{ backgroundColor: 'var(--color-primary-500)', borderColor: 'var(--color-primary-500)' }}>승인</Button>
          <Button danger icon={<CloseCircleOutlined />} onClick={() => onReject(r)} size="small">거절</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="overflow-x-auto -mx-3 sm:mx-0">
      <Table columns={columns} dataSource={dataSource} rowKey="breederId" loading={loading} scroll={{ x: 800 }}
        pagination={{ current: currentPage, pageSize, total: totalCount, showSizeChanger: true, showTotal: (t) => `총 ${t}건`, onChange: onPageChange }} />
    </div>
  );
}
