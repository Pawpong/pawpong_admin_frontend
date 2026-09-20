import { Metric } from '../../../shared/components/admin/PageHeading';

interface Props {
  totalRejections: number; resubmissions: number; resubmissionRate: number; resubmissionApprovalRate: number;
}

const ITEMS: { key: keyof Props; label: string; note: string; suffix: string }[] = [
  { key: 'totalRejections', label: '총 반려 건수', note: '인증 심사에서 반려된 총 건수', suffix: '건' },
  { key: 'resubmissions', label: '재제출 건수', note: '반려 후 서류를 다시 제출한 건수', suffix: '건' },
  { key: 'resubmissionRate', label: '재제출 비율', note: '반려 건 중 재제출한 비율', suffix: '%' },
  { key: 'resubmissionApprovalRate', label: '재제출 후 승인율', note: '재제출 후 최종 승인된 비율', suffix: '%' },
];

export function ResubmissionStats(props: Props) {
  return (
    <div className="metric-grid">
      {ITEMS.map((item) => (
        <Metric
          key={item.key}
          label={item.label}
          value={`${props[item.key].toLocaleString()}${item.suffix}`}
          note={item.note}
        />
      ))}
    </div>
  );
}
