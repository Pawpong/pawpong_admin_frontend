import type { ReactNode } from 'react';

export type ChartTooltipRow = { key: string; label: string; color: string; value: ReactNode };

/** 값이 먼저, 계열 이름은 뒤에. 계열은 색 박스 대신 짧은 선으로 구분한다 */
export function ChartTooltipCard({ title, rows }: { title: ReactNode; rows: ChartTooltipRow[] }) {
  return (
    <div className="ops-tooltip">
      <div className="ops-tooltip-title">{title}</div>
      {rows.map((row) => (
        <div key={row.key} className="ops-tooltip-row">
          <i style={{ background: row.color }} aria-hidden />
          <strong>{row.value}</strong>
          <span>{row.label}</span>
        </div>
      ))}
    </div>
  );
}

export function ChartLegend({ items }: { items: { label: string; color: string; shape?: 'line' | 'box' }[] }) {
  return (
    <div className="ops-legend">
      {items.map((item) => (
        <span key={item.label}>
          <i
            className={item.shape === 'line' ? 'ops-legend-line' : 'ops-legend-box'}
            style={{ background: item.color }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}
