import { Table, Tag, Space, Button, Tooltip, Switch } from 'antd';
import { SwapOutlined, StopOutlined, EyeOutlined, CheckCircleOutlined, ExperimentOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import type { BreederVerification } from '../../../shared/types/api.types';

const getLevelTag = (level: string) => {
  const isElite = level === 'elite';
  return (
    <Tag style={{ backgroundColor: isElite ? 'var(--color-level-elite-100)' : 'var(--color-level-new-100)', color: isElite ? 'var(--color-level-elite-500)' : 'var(--color-level-new-500)', borderColor: isElite ? 'var(--color-level-elite-500)' : 'var(--color-level-new-500)', fontWeight: 500 }}>
      {isElite ? '엘리트' : '뉴'}
    </Tag>
  );
};

interface Props {
  dataSource: BreederVerification[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  total: number;
  selectedBreeders: string[];
  onSelectChange: (keys: string[]) => void;
  onPageChange: (page: number, pageSize: number) => void;
  onViewDetails: (r: BreederVerification) => void;
  onChangeLevel: (r: BreederVerification) => void;
  onSuspend: (r: BreederVerification) => void;
  onUnsuspend: (r: BreederVerification) => void;
  onTestAccountToggle: (r: BreederVerification, checked: boolean) => void;
}

export function ManagementTable({ dataSource, loading, currentPage, pageSize, total, selectedBreeders, onSelectChange, onPageChange, onViewDetails, onChangeLevel, onSuspend, onUnsuspend, onTestAccountToggle }: Props) {
  const columns: ColumnsType<BreederVerification> = [
    { title: '브리더명', dataIndex: 'breederName', key: 'breederName', width: 150, render: (n: string) => <strong>{n}</strong> },
    { title: '이메일', dataIndex: 'emailAddress', key: 'emailAddress', width: 200 },
    { title: '전화번호', dataIndex: 'phoneNumber', key: 'phoneNumber', width: 130, render: (p: string) => p || '-' },
    { title: '레벨', dataIndex: ['verificationInfo', 'level'], key: 'level', width: 100, render: (l: string) => getLevelTag(l || 'new') },
    { title: '승인일', dataIndex: ['verificationInfo', 'submittedAt'], key: 'approvedAt', width: 150, render: (d: string) => d ? new Date(d).toLocaleDateString('ko-KR') : '-' },
    { title: '계정 상태', dataIndex: 'accountStatus', key: 'accountStatus', width: 100, render: (s: string) => s === 'suspended' ? <Tag color="red">정지됨</Tag> : <Tag color="green">활성</Tag> },
    {
      title: <Tooltip title="테스트 계정은 탐색 페이지와 홈 화면에 노출되지 않습니다"><span><ExperimentOutlined style={{ marginRight: 4 }} />테스트</span></Tooltip>,
      dataIndex: 'isTestAccount', key: 'isTestAccount', width: 100,
      render: (v: boolean, r) => <Switch checked={v || false} onChange={(c) => onTestAccountToggle(r, c)} checkedChildren="ON" unCheckedChildren="OFF" size="small" />,
    },
    {
      title: '액션', key: 'action', width: 350,
      render: (_, r) => {
        const isSuspended = r.accountStatus === 'suspended';
        return (
          <Space size="small">
            <Tooltip title="상세 보기"><Button type="link" icon={<EyeOutlined />} onClick={() => onViewDetails(r)}>상세</Button></Tooltip>
            {!isSuspended && <Tooltip title="레벨 변경"><Button icon={<SwapOutlined />} onClick={() => onChangeLevel(r)} size="small" style={{ backgroundColor: 'var(--color-tertiary-500)', borderColor: 'var(--color-primary-500)' }}>레벨 변경</Button></Tooltip>}
            {isSuspended
              ? <Tooltip title="정지 해제"><Button icon={<CheckCircleOutlined />} onClick={() => onUnsuspend(r)} size="small">정지 해제</Button></Tooltip>
              : <Tooltip title="계정 정지"><Button danger icon={<StopOutlined />} onClick={() => onSuspend(r)} size="small">정지</Button></Tooltip>}
          </Space>
        );
      },
    },
  ];

  return (
    <div className="overflow-x-auto -mx-3 sm:mx-0">
      <Table columns={columns} dataSource={dataSource} rowKey="breederId" loading={loading} scroll={{ x: 800 }}
        rowSelection={{ selectedRowKeys: selectedBreeders, onChange: (k) => onSelectChange(k as string[]) }}
        pagination={{ current: currentPage, pageSize, total, showSizeChanger: true, showTotal: (t) => `총 ${t}건`, responsive: true, onChange: onPageChange }} />
    </div>
  );
}
