import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import type { TooltipContentProps } from 'recharts/types/component/Tooltip';
import type { OpsLevelPoint, OpsTrafficPoint } from '../api/opsMonitoring.types';
import { formatAxisTime, formatCount, formatDateTime, formatMs } from '../model/opsFormat';
import { ChartLegend, ChartTooltipCard } from './ChartTooltip';
import { OPS_CHART } from './opsChartTheme';

const AXIS = {
  tick: { fill: OPS_CHART.axis, fontSize: 11 },
  tickLine: false,
} as const;

const firstPayload = <T,>(props: TooltipContentProps<ValueType, NameType>) =>
  props.active ? (props.payload?.[0]?.payload as T | undefined) : undefined;

/** 막대 사이 2px 흰 틈. 쌓인 조각끼리도 같은 틈으로 나눈다 */
const SEGMENT = { stroke: OPS_CHART.surface, strokeWidth: 1, isAnimationActive: false, maxBarSize: 24 } as const;

type RequestRow = OpsTrafficPoint & { ok: number };

/** 요청 수 — 정상(2xx·3xx)·4xx·5xx 를 한 막대에 쌓아 양과 실패를 같이 본다 */
export function RequestsChart({ series, spanHours }: { series: OpsTrafficPoint[]; spanHours: number }) {
  const rows: RequestRow[] = series.map((point) => ({ ...point, ok: point.status2xx + point.status3xx }));
  return (
    <div className="ops-chart">
      <ChartLegend
        items={[
          { label: '정상 응답(2xx·3xx)', color: OPS_CHART.primary },
          { label: '요청 오류(4xx)', color: OPS_CHART.warning },
          { label: '서버 오류(5xx)', color: OPS_CHART.critical },
        ]}
      />
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -12 }} barCategoryGap="20%">
          <CartesianGrid stroke={OPS_CHART.grid} vertical={false} />
          <XAxis
            dataKey="at"
            {...AXIS}
            axisLine={{ stroke: OPS_CHART.grid }}
            tickFormatter={(value: string) => formatAxisTime(value, spanHours)}
            minTickGap={40}
          />
          <YAxis
            {...AXIS}
            axisLine={false}
            allowDecimals={false}
            tickFormatter={(value: number) => formatCount(value)}
            width={48}
          />
          <Tooltip
            cursor={{ fill: 'rgba(0,0,0,0.04)' }}
            content={(props: TooltipContentProps<ValueType, NameType>) => {
              const row = firstPayload<RequestRow>(props);
              return row ? (
                <ChartTooltipCard
                  title={`${formatDateTime(row.at)} · 총 ${formatCount(row.requests)}건`}
                  rows={[
                    { key: 'ok', label: '정상 응답', color: OPS_CHART.primary, value: formatCount(row.ok) },
                    {
                      key: '4xx',
                      label: '요청 오류(4xx)',
                      color: OPS_CHART.warning,
                      value: formatCount(row.status4xx),
                    },
                    {
                      key: '5xx',
                      label: '서버 오류(5xx)',
                      color: OPS_CHART.critical,
                      value: formatCount(row.status5xx),
                    },
                  ]}
                />
              ) : null;
            }}
          />
          <Bar dataKey="ok" stackId="requests" fill={OPS_CHART.primary} {...SEGMENT} />
          <Bar dataKey="status4xx" stackId="requests" fill={OPS_CHART.warning} {...SEGMENT} />
          <Bar dataKey="status5xx" stackId="requests" fill={OPS_CHART.critical} radius={[4, 4, 0, 0]} {...SEGMENT} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** p95 응답 시간 — 구간마다 느린 쪽 5% 가 이 값보다 오래 걸렸다는 뜻 */
export function LatencyChart({ series, spanHours }: { series: OpsTrafficPoint[]; spanHours: number }) {
  return (
    <div className="ops-chart">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid stroke={OPS_CHART.grid} vertical={false} />
          <XAxis
            dataKey="at"
            {...AXIS}
            axisLine={{ stroke: OPS_CHART.grid }}
            tickFormatter={(value: string) => formatAxisTime(value, spanHours)}
            minTickGap={40}
          />
          <YAxis {...AXIS} axisLine={false} tickFormatter={(value: number) => formatMs(value)} width={56} />
          <Tooltip
            cursor={{ stroke: OPS_CHART.axis, strokeWidth: 1 }}
            content={(props: TooltipContentProps<ValueType, NameType>) => {
              const row = firstPayload<OpsTrafficPoint>(props);
              return row ? (
                <ChartTooltipCard
                  title={formatDateTime(row.at)}
                  rows={[
                    {
                      key: 'p95',
                      label: row.p95Ms === null ? 'p95 (요청 없음)' : 'p95 응답 시간',
                      color: OPS_CHART.primary,
                      value: formatMs(row.p95Ms),
                    },
                  ]}
                />
              ) : null;
            }}
          />
          <Line
            type="monotone"
            dataKey="p95Ms"
            stroke={OPS_CHART.primary}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, stroke: OPS_CHART.surface, strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/** 에러·경고 로그 수. info 는 요청 로그가 대부분이라 따로 합계로만 보여 준다 */
export function LogLevelChart({ levels, spanHours }: { levels: OpsLevelPoint[]; spanHours: number }) {
  return (
    <div className="ops-chart">
      <ChartLegend
        items={[
          { label: '경고(warn)', color: OPS_CHART.warning },
          { label: '에러(error)', color: OPS_CHART.critical },
        ]}
      />
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={levels} margin={{ top: 8, right: 8, bottom: 0, left: -12 }} barCategoryGap={1}>
          <CartesianGrid stroke={OPS_CHART.grid} vertical={false} />
          <XAxis
            dataKey="at"
            {...AXIS}
            axisLine={{ stroke: OPS_CHART.grid }}
            tickFormatter={(value: string) => formatAxisTime(value, spanHours)}
            minTickGap={40}
          />
          <YAxis
            {...AXIS}
            axisLine={false}
            allowDecimals={false}
            tickFormatter={(value: number) => formatCount(value)}
            width={48}
          />
          <Tooltip
            cursor={{ fill: 'rgba(0,0,0,0.04)' }}
            content={(props: TooltipContentProps<ValueType, NameType>) => {
              const row = firstPayload<OpsLevelPoint>(props);
              return row ? (
                <ChartTooltipCard
                  title={formatDateTime(row.at)}
                  rows={[
                    { key: 'error', label: '에러', color: OPS_CHART.critical, value: formatCount(row.error) },
                    { key: 'warn', label: '경고', color: OPS_CHART.warning, value: formatCount(row.warn) },
                    { key: 'info', label: '정보', color: OPS_CHART.axis, value: formatCount(row.info) },
                  ]}
                />
              ) : null;
            }}
          />
          {/* 절반 폭 차트는 막대가 좁아 흰 틈이 막대를 지우므로 틈 없이 쌓는다 */}
          <Bar dataKey="warn" stackId="levels" fill={OPS_CHART.warning} {...SEGMENT} stroke="none" />
          <Bar
            dataKey="error"
            stackId="levels"
            fill={OPS_CHART.critical}
            radius={[2, 2, 0, 0]}
            {...SEGMENT}
            stroke="none"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** 24칸 막대 스파크라인 (센트리 이슈 최근 24시간). 칸마다 title 로 시각·건수를 보여 준다 */
export function HourlySparkline({ values, label, endAt }: { values: number[]; label: string; endAt: number }) {
  const max = Math.max(1, ...values);
  const width = 96;
  const height = 24;
  const step = values.length ? width / values.length : width;
  return (
    <svg className="ops-sparkline" width={width} height={height} role="img" aria-label={label}>
      <line x1={0} y1={height - 0.5} x2={width} y2={height - 0.5} stroke={OPS_CHART.grid} />
      {values.map((value, index) => {
        const barHeight = value ? Math.max(2, (value / max) * (height - 2)) : 0;
        const hour = new Date(endAt - (values.length - 1 - index) * 3_600_000).getHours();
        return (
          <g key={index}>
            <title>{`${hour}시 · ${value}건`}</title>
            <rect x={index * step} y={0} width={step} height={height} fill="transparent" />
            {barHeight > 0 && (
              <rect
                x={index * step + 0.5}
                y={height - barHeight}
                width={Math.max(1, step - 1)}
                height={barHeight}
                rx={1}
                fill={OPS_CHART.primary}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
