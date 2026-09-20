import { Metric } from '../../../shared/components/admin/PageHeading';

interface Props {
  days7: number; days14: number; days28: number;
}

export function ConsultationStats({ days7, days14, days28 }: Props) {
  const items = [
    { label: '최근 7일', value: days7 },
    { label: '최근 14일', value: days14 },
    { label: '최근 28일', value: days28 },
  ];
  return (
    <div className="metric-grid metric-grid-three">
      {items.map((item) => (
        <Metric
          key={item.label}
          label={item.label}
          value={`${item.value.toLocaleString()}건`}
          note="입양자가 브리더에게 제출한 상담 신청 건수"
        />
      ))}
    </div>
  );
}
