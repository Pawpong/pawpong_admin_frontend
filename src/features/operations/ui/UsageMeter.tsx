import type { OpsHealthLevel } from '../api/opsMonitoring.types';
import { formatPercent, HEALTH_LABEL } from '../model/opsFormat';
import { LEVEL_COLOR, OPS_CHART } from './opsChartTheme';

/**
 * 사용률 막대. 채움 색이 등급(파랑→주의→장애)을, 빈 칸은 같은 파랑의 옅은 단계를 쓴다.
 * 색만으로 상태를 말하지 않도록 주의·장애일 때는 글자로도 붙인다.
 */
export function UsageMeter({
  label,
  value,
  level,
  detail,
}: {
  label: string;
  value: number | null;
  level: OpsHealthLevel;
  detail?: string;
}) {
  const width = value === null ? 0 : Math.min(100, Math.max(0, value));
  return (
    <div className="ops-meter">
      <div className="ops-meter-head">
        <span>{label}</span>
        <strong>
          {formatPercent(value)}
          {(level === 'warning' || level === 'critical') && (
            <em className={`ops-level-text ops-level-${level}`}>{HEALTH_LABEL[level]}</em>
          )}
        </strong>
      </div>
      <div
        className="ops-meter-track"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value ?? undefined}
        style={{ background: OPS_CHART.track }}
      >
        <div className="ops-meter-fill" style={{ width: `${width}%`, background: LEVEL_COLOR[level] }} />
      </div>
      {detail && <small>{detail}</small>}
    </div>
  );
}
