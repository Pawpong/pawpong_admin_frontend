import { Metric } from '../../../shared/components/admin/PageHeading';

interface Props {
  adopters7: number; adopters14: number; adopters28: number;
  breeders7: number; breeders14: number; breeders28: number;
}

export function ActiveUserStats({ adopters7, adopters14, adopters28, breeders7, breeders14, breeders28 }: Props) {
  const items = [
    { label: '입양자 · 최근 7일', value: adopters7, note: '해당 기간 내 로그인한 입양자 수' },
    { label: '입양자 · 최근 14일', value: adopters14, note: '해당 기간 내 로그인한 입양자 수' },
    { label: '입양자 · 최근 28일', value: adopters28, note: '해당 기간 내 로그인한 입양자 수' },
    { label: '브리더 · 최근 7일', value: breeders7, note: '해당 기간 내 로그인한 브리더 수' },
    { label: '브리더 · 최근 14일', value: breeders14, note: '해당 기간 내 로그인한 브리더 수' },
    { label: '브리더 · 최근 28일', value: breeders28, note: '해당 기간 내 로그인한 브리더 수' },
  ];
  return (
    <div className="metric-grid metric-grid-three">
      {items.map((item) => (
        <Metric key={item.label} label={item.label} value={`${item.value.toLocaleString()}명`} note={item.note} />
      ))}
    </div>
  );
}
