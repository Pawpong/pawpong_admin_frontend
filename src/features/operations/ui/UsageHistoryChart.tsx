import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import type { TooltipContentProps } from 'recharts/types/component/Tooltip';
import type { OpsHistoryPoint } from '../api/opsMonitoring.types';
import { formatAxisTime, formatDateTime, formatPercent } from '../model/opsFormat';
import { ChartLegend, ChartTooltipCard } from './ChartTooltip';
import { OPS_CHART } from './opsChartTheme';

type Row = { at: string; cpu: number | null; memory: number | null };

/**
 * 최근 24시간 CPU·메모리 사용률(5분 평균). 두 값 모두 % 라 한 축(0~100)에 그린다.
 * 개발 서버는 컨테이너 한도(2GB)가 실제 한계라 메모리를 한도 대비로 그린다.
 */
export function UsageHistoryChart({
  history,
  memoryLabel,
  useContainerMemory,
}: {
  history: OpsHistoryPoint[];
  memoryLabel: string;
  useContainerMemory: boolean;
}) {
  if (history.length < 2) {
    return (
      <p className="muted ops-empty-chart">앱이 재시작된 뒤 기록이 아직 쌓이지 않았습니다. 몇 분 뒤 다시 확인하세요.</p>
    );
  }
  const rows: Row[] = history.map((point) => ({
    at: point.at,
    cpu: point.cpuPercent,
    memory: useContainerMemory ? point.containerMemoryPercent : point.memoryPercent,
  }));
  const spanHours = (Date.parse(rows[rows.length - 1].at) - Date.parse(rows[0].at)) / 3_600_000;
  return (
    <div className="ops-chart">
      <ChartLegend
        items={[
          { label: 'CPU', color: OPS_CHART.primary, shape: 'line' },
          { label: memoryLabel, color: OPS_CHART.secondary, shape: 'line' },
        ]}
      />
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid stroke={OPS_CHART.grid} vertical={false} />
          <XAxis
            dataKey="at"
            tickFormatter={(value: string) => formatAxisTime(value, spanHours)}
            tick={{ fill: OPS_CHART.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: OPS_CHART.grid }}
            minTickGap={40}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 50, 100]}
            tickFormatter={(value: number) => `${value}%`}
            tick={{ fill: OPS_CHART.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip
            cursor={{ stroke: OPS_CHART.axis, strokeWidth: 1 }}
            content={(props: TooltipContentProps<ValueType, NameType>) => {
              const row = props.active ? (props.payload?.[0]?.payload as Row | undefined) : undefined;
              return row ? (
                <ChartTooltipCard
                  title={formatDateTime(row.at)}
                  rows={[
                    { key: 'cpu', label: 'CPU', color: OPS_CHART.primary, value: formatPercent(row.cpu) },
                    { key: 'memory', label: memoryLabel, color: OPS_CHART.secondary, value: formatPercent(row.memory) },
                  ]}
                />
              ) : null;
            }}
          />
          <Line
            type="monotone"
            dataKey="cpu"
            stroke={OPS_CHART.primary}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, stroke: OPS_CHART.surface, strokeWidth: 2 }}
            isAnimationActive={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="memory"
            stroke={OPS_CHART.secondary}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, stroke: OPS_CHART.surface, strokeWidth: 2 }}
            isAnimationActive={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
