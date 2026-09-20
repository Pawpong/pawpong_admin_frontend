import { Metric } from '../../../shared/components/admin/PageHeading';

interface Props {
  stats: { totalCount: number; pendingCount: number; approvedCount: number; rejectedCount: number; completedCount: number };
}

const STAT_ITEMS = [
  { key: 'totalCount', label: '전체 신청' },
  { key: 'pendingCount', label: '상담 대기' },
  { key: 'completedCount', label: '상담 완료' },
  { key: 'approvedCount', label: '입양 승인' },
  { key: 'rejectedCount', label: '입양 거절' },
] as const;

export function ApplicationStats({ stats }: Props) {
  return (
    <div className="metric-grid metric-grid-five">
      {STAT_ITEMS.map((item) => (
        <Metric key={item.key} label={item.label} value={`${stats[item.key].toLocaleString()}건`} />
      ))}
    </div>
  );
}
