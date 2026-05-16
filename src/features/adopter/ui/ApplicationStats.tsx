import { Card } from 'antd';

interface Props {
  stats: { totalCount: number; pendingCount: number; approvedCount: number; rejectedCount: number; completedCount: number };
}

const STAT_ITEMS = [
  { key: 'totalCount', label: '전체 신청', color: 'var(--color-primary-500)' },
  { key: 'pendingCount', label: '상담 대기', color: 'var(--color-gray-600)' },
  { key: 'completedCount', label: '상담 완료', color: '#1890ff' },
  { key: 'approvedCount', label: '입양 승인', color: '#52c41a' },
  { key: 'rejectedCount', label: '입양 거절', color: '#ff4d4f' },
] as const;

export function ApplicationStats({ stats }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {STAT_ITEMS.map((item) => (
        <Card key={item.key} style={{ borderRadius: '8px', border: '1px solid var(--color-gray-200)' }}>
          <p className="text-sm mb-1" style={{ color: 'var(--color-gray-500)' }}>{item.label}</p>
          <p className="text-2xl font-bold" style={{ color: item.color }}>{stats[item.key]}건</p>
        </Card>
      ))}
    </div>
  );
}
