import { Metric } from '../../../shared/components/admin/PageHeading';

interface Props {
  stats: { totalApproved: number };
}

export function ManagementStats({ stats }: Props) {
  return (
    <div className="metric-grid metric-grid-single">
      <Metric label="전체 승인된 브리더" value={`${stats.totalApproved.toLocaleString()}명`} />
    </div>
  );
}
