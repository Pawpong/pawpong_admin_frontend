import { Metric } from '../../../shared/components/admin/PageHeading';

interface Props {
  adopters7: number; adopters14: number; adopters28: number;
  breeders7: number; breeders14: number; breeders28: number;
}

/** 값은 해당 기간 안에 로그인한 사람 수다. */
export function ActiveUserStats({ adopters7, adopters14, adopters28, breeders7, breeders14, breeders28 }: Props) {
  const items = [
    { label: '입양자 · 최근 7일', value: adopters7 },
    { label: '입양자 · 최근 14일', value: adopters14 },
    { label: '입양자 · 최근 28일', value: adopters28 },
    { label: '브리더 · 최근 7일', value: breeders7 },
    { label: '브리더 · 최근 14일', value: breeders14 },
    { label: '브리더 · 최근 28일', value: breeders28 },
  ];
  return (
    <div className="metric-grid metric-grid-three">
      {items.map((item) => (
        <Metric key={item.label} label={item.label} value={`${item.value.toLocaleString()}명`} />
      ))}
    </div>
  );
}
