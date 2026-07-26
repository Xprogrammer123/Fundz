import { ChartShell } from "@/components/charts/chart-shell";
import type { ChartViewProps, PeriodRow, SingleSeriesRow } from "@/components/charts/types";
import {
  EChartsAreaChart,
  type ChartConfig,
} from "@/components/evilcharts/charts/echarts-area-chart";
import { cn, formatMoney } from "@/lib/utils";
import { useState } from "react";

type AreaStyle = "layers" | "compare" | "benchmark" | "spotlight";

const LAYER_COLORS = {
  income: "#62C9D4",
  expense: "#F37A00",
  value: "#ffffff",
} as const;

const COMPARE_COLORS = {
  income: "#c3f000",
  expense: "#4c86ff",
  value: "#c3f000",
} as const;

export function AreaChartView({
  periodData,
  singleData,
  seriesConfig,
  metric,
  styleId = "layers",
  background = "black",
  currency = "USD",
}: ChartViewProps) {
  const style = (
    ["layers", "compare", "benchmark", "spotlight"].includes(styleId)
      ? styleId
      : "layers"
  ) as AreaStyle;

  if (metric === "category") {
    return (
      <ChartShell background={background} filenameBase="funds-area-category">
        <p className="py-12 text-center text-sm text-muted-foreground">
          Switch to spending or income for area charts.
        </p>
      </ChartShell>
    );
  }

  return (
    <ChartShell background={background} filenameBase={`funds-area-${metric}-${style}`}>
      {style === "layers" ? (
        <LayersStyle
          metric={metric}
          periodData={periodData}
          singleData={singleData}
          seriesConfig={seriesConfig}
          currency={currency}
        />
      ) : null}
      {style === "compare" ? (
        <CompareStyle metric={metric} periodData={periodData} singleData={singleData} currency={currency} />
      ) : null}
      {style === "benchmark" ? (
        <BenchmarkStyle metric={metric} periodData={periodData} singleData={singleData} currency={currency} />
      ) : null}
      {style === "spotlight" ? (
        <SpotlightStyle metric={metric} singleData={singleData} periodData={periodData} currency={currency} />
      ) : null}
    </ChartShell>
  );
}

/** Style 1 — latency layers: clickable series headers + linear gradient areas. */
function LayersStyle({
  metric,
  periodData,
  singleData,
  seriesConfig,
  currency,
}: {
  metric: ChartViewProps["metric"];
  periodData: PeriodRow[];
  singleData: SingleSeriesRow[];
  seriesConfig: ChartConfig;
  currency: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  if (metric === "both") {
    const latest = periodData[periodData.length - 1];
    const series = [
      {
        key: "income",
        label: "Income",
        color: LAYER_COLORS.income,
        latest: latest?.income ?? 0,
      },
      {
        key: "expense",
        label: "Spending",
        color: LAYER_COLORS.expense,
        latest: latest?.expense ?? 0,
      },
    ] as const;

    const config = {
      income: {
        label: "Income",
        colors: { light: [LAYER_COLORS.income], dark: [LAYER_COLORS.income] },
      },
      expense: {
        label: "Spending",
        colors: { light: [LAYER_COLORS.expense], dark: [LAYER_COLORS.expense] },
      },
    } satisfies ChartConfig;

    return (
      <div className="flex w-full flex-col">
        <div className="grid grid-cols-2 gap-y-2 sm:gap-y-4">
          {series.map(({ key, label, color, latest: value }) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelected((prev) => (prev === key ? null : key))}
              className={cn(
                "border-border flex cursor-pointer flex-row items-center gap-1.5 px-3 text-left transition-opacity even:border-l sm:flex-col sm:items-start sm:gap-1.5 sm:px-4 sm:first:pl-1 sm:not-first:border-l",
                selected !== null && selected !== key && "opacity-40",
              )}
            >
              <div className="text-primary flex items-center gap-1.5 text-xs font-medium sm:gap-2">
                <span
                  className="size-2 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: color }}
                />
                {label}
              </div>
              <div className="leading-none">
                <span className="text-primary text-sm font-medium tracking-tight sm:text-xl">
                  {formatMoney(value, currency)}
                </span>
              </div>
            </button>
          ))}
        </div>
        <EChartsAreaChart
          data={periodData}
          config={config}
          xDataKey="period"
          className="mt-4 h-80 w-full"
          curveType="linear"
          enableHoverHighlight
          selectedDataKey={selected}
          onSelectionChange={setSelected}
        >
          <EChartsAreaChart.Grid />
          <EChartsAreaChart.XAxis dataKey="period" />
          <EChartsAreaChart.YAxis />
          <EChartsAreaChart.Tooltip />
          <EChartsAreaChart.Area
            dataKey="income"
            variant="gradient"
            strokeVariant="solid"
            isClickable
          />
          <EChartsAreaChart.Area
            dataKey="expense"
            variant="gradient"
            strokeVariant="solid"
            isClickable
          />
        </EChartsAreaChart>
      </div>
    );
  }

  const latest = singleData[singleData.length - 1]?.value ?? 0;
  const label = metric === "income" ? "Income" : "Spending";
  const color = LAYER_COLORS.value;

  return (
    <div className="flex w-full flex-col">
      <div className="flex items-center gap-2 px-1">
        <span className="size-2 shrink-0 rounded-[2px]" style={{ backgroundColor: color }} />
        <span className="text-xs font-medium text-primary">{label}</span>
        <span className="text-sm font-medium tracking-tight text-primary sm:text-xl">
          {formatMoney(latest, currency)}
        </span>
      </div>
      <EChartsAreaChart
        data={singleData}
        config={seriesConfig}
        xDataKey="period"
        className="mt-4 h-80 w-full"
        curveType="linear"
        enableHoverHighlight
      >
        <EChartsAreaChart.Grid />
        <EChartsAreaChart.XAxis dataKey="period" />
        <EChartsAreaChart.YAxis />
        <EChartsAreaChart.Tooltip />
        <EChartsAreaChart.Area dataKey="value" variant="gradient" strokeVariant="solid" />
      </EChartsAreaChart>
    </div>
  );
}

/** Style 2 — portfolio compare: step curve, dotted fill, hover reveal, % headers. */
function CompareStyle({
  metric,
  periodData,
  singleData,
  currency,
}: {
  metric: ChartViewProps["metric"];
  periodData: PeriodRow[];
  singleData: SingleSeriesRow[];
  currency: string;
}) {
  if (metric === "both") {
    const first = periodData[0];
    const last = periodData[periodData.length - 1];
    const incomeDelta = (last?.income ?? 0) - (first?.income ?? 0);
    const expenseDelta = (last?.expense ?? 0) - (first?.expense ?? 0);
    const incomePct = pctChange(first?.income ?? 0, last?.income ?? 0);
    const expensePct = pctChange(first?.expense ?? 0, last?.expense ?? 0);

    const series = [
      {
        key: "income",
        label: "Income",
        color: COMPARE_COLORS.income,
        pct: incomePct,
        delta: incomeDelta,
      },
      {
        key: "expense",
        label: "Spending",
        color: COMPARE_COLORS.expense,
        pct: expensePct,
        delta: expenseDelta,
      },
    ] as const;

    const config = {
      income: {
        label: "Income",
        colors: { light: [COMPARE_COLORS.income], dark: [COMPARE_COLORS.income] },
      },
      expense: {
        label: "Spending",
        colors: {
          light: [COMPARE_COLORS.expense],
          dark: [COMPARE_COLORS.expense],
        },
      },
    } satisfies ChartConfig;

    return (
      <div className="flex w-full flex-col pt-2">
        <div className="grid grid-cols-2 gap-x-8 px-1">
          {series.map(({ key, label, color, pct, delta }) => (
            <div key={key} className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span
                  className="size-3 shrink-0 rounded-full border-2"
                  style={{ borderColor: color }}
                />
                {label}
              </div>
              <div className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
                {pct > 0 ? "+" : pct < 0 ? "−" : ""}
                {Math.abs(pct).toFixed(2)}%
              </div>
              <div className={delta < 0 ? "text-rose-400" : "text-emerald-400"}>
                {delta < 0 ? "−" : "+"}
                {formatMoney(Math.abs(delta), currency)}
              </div>
            </div>
          ))}
        </div>

        <EChartsAreaChart
          data={periodData}
          config={config}
          xDataKey="period"
          className="mt-4 h-80 w-full"
          curveType="step"
          enableHoverReveal
          chartOptions={{
            grid: { left: 0, right: 0, top: 16, bottom: 0 },
            yAxis: {
              type: "value",
              show: false,
              scale: true,
              boundaryGap: ["12%", "16%"],
            },
          }}
        >
          <EChartsAreaChart.Tooltip variant="frosted-glass" />
          <EChartsAreaChart.Area dataKey="income" variant="dotted" strokeVariant="solid">
            <EChartsAreaChart.ActiveDot variant="ping" />
          </EChartsAreaChart.Area>
          <EChartsAreaChart.Area dataKey="expense" variant="dotted" strokeVariant="solid">
            <EChartsAreaChart.ActiveDot variant="ping" />
          </EChartsAreaChart.Area>
        </EChartsAreaChart>
      </div>
    );
  }

  const first = singleData[0]?.value ?? 0;
  const last = singleData[singleData.length - 1]?.value ?? 0;
  const delta = last - first;
  const pct = pctChange(first, last);
  const label = metric === "income" ? "Income" : "Spending";
  const color = COMPARE_COLORS.value;

  const config = {
    value: {
      label,
      colors: { light: [color], dark: [color] },
    },
  } satisfies ChartConfig;

  return (
    <div className="flex w-full flex-col pt-2">
      <div className="flex flex-col gap-1 px-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span
            className="size-3 shrink-0 rounded-full border-2"
            style={{ borderColor: color }}
          />
          {label}
        </div>
        <div className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
          {pct > 0 ? "+" : pct < 0 ? "−" : ""}
          {Math.abs(pct).toFixed(2)}%
        </div>
        <div className={delta < 0 ? "text-rose-400" : "text-emerald-400"}>
          {delta < 0 ? "−" : "+"}
          {formatMoney(Math.abs(delta), currency)}
        </div>
      </div>

      <EChartsAreaChart
        data={singleData}
        config={config}
        xDataKey="period"
        className="mt-4 h-80 w-full"
        curveType="step"
        enableHoverReveal
        chartOptions={{
          grid: { left: 0, right: 0, top: 16, bottom: 0 },
          yAxis: {
            type: "value",
            show: false,
            scale: true,
            boundaryGap: ["12%", "16%"],
          },
        }}
      >
        <EChartsAreaChart.Tooltip variant="frosted-glass" />
        <EChartsAreaChart.Area dataKey="value" variant="dotted" strokeVariant="solid">
          <EChartsAreaChart.ActiveDot variant="ping" />
        </EChartsAreaChart.Area>
      </EChartsAreaChart>
    </div>
  );
}

/** Style 3 — benchmark: actual (lines) vs target (dashed). */
function BenchmarkStyle({
  metric,
  periodData,
  singleData,
  currency,
}: {
  metric: ChartViewProps["metric"];
  periodData: PeriodRow[];
  singleData: SingleSeriesRow[];
  currency: string;
}) {
  if (metric === "both") {
    const latest = periodData[periodData.length - 1];
    const actual = latest?.expense ?? 0;
    const target = latest?.income ?? 0;
    const deltaPct = target === 0 ? 0 : ((actual - target) / target) * 100;

    const config = {
      expense: {
        label: "Spending",
        colors: { light: ["#0a0a0a"], dark: ["#ffffff"] },
      },
      income: {
        label: "Income",
        colors: { light: ["#a1a1aa"], dark: ["#666666"] },
      },
    } satisfies ChartConfig;

    return (
      <div className="flex w-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Spending vs income</span>
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
                {formatMoney(actual, currency)}
              </span>
              <span
                className={cn(
                  "text-sm font-medium",
                  deltaPct <= 0 ? "text-emerald-400" : "text-rose-400",
                )}
              >
                {deltaPct > 0 ? "+" : ""}
                {deltaPct.toFixed(1)}% vs income
              </span>
            </div>
          </div>
          <LegendLines />
        </div>

        <EChartsAreaChart
          data={periodData}
          config={config}
          xDataKey="period"
          className="mt-4 h-80 w-full"
          curveType="smooth"
        >
          <EChartsAreaChart.Grid />
          <EChartsAreaChart.XAxis dataKey="period" />
          <EChartsAreaChart.YAxis />
          <EChartsAreaChart.Tooltip />
          <EChartsAreaChart.Area dataKey="income" variant="none" strokeVariant="dashed" />
          <EChartsAreaChart.Area dataKey="expense" variant="lines" strokeVariant="solid" />
        </EChartsAreaChart>
      </div>
    );
  }

  const avg =
    singleData.length === 0
      ? 0
      : singleData.reduce((sum, row) => sum + row.value, 0) / singleData.length;

  const data = singleData.map((row) => ({
    period: row.period,
    actual: row.value,
    target: avg,
  }));

  const latest = data[data.length - 1];
  const deltaPct =
    !latest || latest.target === 0
      ? 0
      : ((latest.actual - latest.target) / latest.target) * 100;
  const label = metric === "income" ? "Income" : "Spending";

  const config = {
    actual: {
      label,
      colors: { light: ["#0a0a0a"], dark: ["#ffffff"] },
    },
    target: {
      label: "Average",
      colors: { light: ["#a1a1aa"], dark: ["#666666"] },
    },
  } satisfies ChartConfig;

  return (
    <div className="flex w-full flex-col">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">{label} vs average</span>
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
              {formatMoney(latest?.actual ?? 0, currency)}
            </span>
            <span
              className={cn(
                "text-sm font-medium",
                deltaPct >= 0 ? "text-emerald-400" : "text-rose-400",
              )}
            >
              {deltaPct > 0 ? "+" : ""}
              {deltaPct.toFixed(1)}% vs avg
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 pt-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <svg className="text-primary" width="18" height="2" viewBox="0 0 18 2" aria-hidden>
              <line x1="0" y1="1" x2="18" y2="1" stroke="currentColor" strokeWidth="2" />
            </svg>
            {label}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <svg width="18" height="2" viewBox="0 0 18 2" aria-hidden>
              <line
                x1="0"
                y1="1"
                x2="18"
                y2="1"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
            </svg>
            Average
          </div>
        </div>
      </div>

      <EChartsAreaChart
        data={data}
        config={config}
        xDataKey="period"
        className="mt-4 h-80 w-full"
        curveType="smooth"
      >
        <EChartsAreaChart.Grid />
        <EChartsAreaChart.XAxis dataKey="period" />
        <EChartsAreaChart.YAxis />
        <EChartsAreaChart.Tooltip />
        <EChartsAreaChart.Area dataKey="target" variant="none" strokeVariant="dashed" />
        <EChartsAreaChart.Area dataKey="actual" variant="lines" strokeVariant="solid" />
      </EChartsAreaChart>
    </div>
  );
}

/** Style 4 — audience spotlight: big total + monotone gradient, custom x labels. */
function SpotlightStyle({
  metric,
  singleData,
  periodData,
  currency,
}: {
  metric: ChartViewProps["metric"];
  singleData: SingleSeriesRow[];
  periodData: PeriodRow[];
  currency: string;
}) {
  const rows =
    metric === "both"
      ? periodData.map((row) => ({
          period: row.period,
          value: row.net,
        }))
      : singleData;

  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const label =
    metric === "both" ? "Net" : metric === "income" ? "Income" : "Spending";

  const config = {
    value: {
      label,
      colors: {
        light: ["#10b981", "#0ea5e9", "#8b5cf6"],
        dark: ["#34d399", "#38bdf8", "#a78bfa"],
      },
    },
  } satisfies ChartConfig;

  return (
    <div className="flex w-full flex-col">
      <div className="flex items-start justify-between gap-4 px-1 pt-1">
        <div className="flex flex-col gap-1">
          <span className="text-base font-medium tracking-tight text-primary sm:text-lg">
            {label}
          </span>
          <span className="max-w-[26ch] text-xs leading-snug text-muted-foreground">
            {metric === "both"
              ? "Net cashflow across the selected range"
              : `Total ${label.toLowerCase()} across the selected range`}
          </span>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="text-2xl font-semibold tracking-tight text-primary sm:text-4xl">
            {formatMoney(total, currency)}
          </span>
          <span className="text-xs text-muted-foreground">Total {label.toLowerCase()}</span>
        </div>
      </div>

      <div className="relative mt-2 w-full">
        <EChartsAreaChart
          data={rows}
          config={config}
          xDataKey="period"
          className="h-80 w-full"
          curveType="monotone"
          chartOptions={{
            grid: { left: 0, right: 0, top: 16, bottom: 24, outerBoundsMode: "none" },
            yAxis: {
              type: "value",
              show: false,
              scale: true,
              boundaryGap: ["16%", "20%"],
            },
          }}
        >
          <EChartsAreaChart.Tooltip variant="frosted-glass" />
          <EChartsAreaChart.Area
            dataKey="value"
            variant="gradient"
            strokeVariant="solid"
            strokeWidth={2.5}
          >
            <EChartsAreaChart.ActiveDot variant="ping" />
          </EChartsAreaChart.Area>
        </EChartsAreaChart>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between px-2 pb-1 text-[10px] text-muted-foreground sm:text-xs">
          {rows.map(({ period }) => (
            <span key={period} className="truncate px-0.5">
              {shortPeriod(period)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function LegendLines() {
  return (
    <div className="flex flex-col items-end gap-1.5 pt-1">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <svg className="text-primary" width="18" height="2" viewBox="0 0 18 2" aria-hidden>
          <line x1="0" y1="1" x2="18" y2="1" stroke="currentColor" strokeWidth="2" />
        </svg>
        Spending
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <svg width="18" height="2" viewBox="0 0 18 2" aria-hidden>
          <line
            x1="0"
            y1="1"
            x2="18"
            y2="1"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="4 3"
          />
        </svg>
        Income
      </div>
    </div>
  );
}

function pctChange(from: number, to: number): number {
  if (from === 0) return to === 0 ? 0 : 100;
  return ((to - from) / Math.abs(from)) * 100;
}

function shortPeriod(period: string): string {
  const parts = period.split(" ");
  if (parts.length >= 2) return parts[0]!.slice(0, 3);
  if (period.length > 7) return period.slice(5); // YYYY-MM-DD → MM-DD
  return period;
}
