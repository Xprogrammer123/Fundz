import { ChartShell } from "@/components/charts/chart-shell";
import { shortPeriodTick } from "@/components/charts/studio";
import type { ChartViewProps, CategoryRow, PeriodRow, SingleSeriesRow } from "@/components/charts/types";
import {
  EChartsBarChart,
  type ChartConfig,
} from "@/components/evilcharts/charts/echarts-bar-chart";
import { MONO } from "@/lib/mono";
import { formatAxisMoney, formatMoney } from "@/lib/utils";

type BarStyle = "default" | "peak" | "grid" | "mono";

function peakInk(hex: string) {
  return { light: [hex], dark: [hex] };
}

export function BarChartView({
  periodData,
  singleData,
  categoryData,
  metric,
  styleId = "default",
  background = "black",
  currency = "USD",
  barColors,
  remountKey,
}: ChartViewProps) {
  const style = (
    ["default", "peak", "grid", "mono"].includes(styleId) ? styleId : "default"
  ) as BarStyle;

  const primary = barColors?.primary ?? MONO.gray500;
  const secondary = barColors?.secondary ?? MONO.black;

  return (
    <ChartShell background={background} filenameBase={`funds-bar-${metric}-${style}`} remountKey={remountKey}>
      {style === "default" ? (
        <DefaultStyle
          metric={metric}
          periodData={periodData}
          singleData={singleData}
          categoryData={categoryData}
          primary={primary}
          secondary={secondary}
          currency={currency}
        />
      ) : null}
      {style === "peak" ? (
        <PeakStyle
          metric={metric}
          periodData={periodData}
          singleData={singleData}
          categoryData={categoryData}
          currency={currency}
          primary={primary}
          secondary={secondary}
        />
      ) : null}
      {style === "grid" ? (
        <GridStyle
          metric={metric}
          periodData={periodData}
          singleData={singleData}
          categoryData={categoryData}
          currency={currency}
          primary={primary}
        />
      ) : null}
      {style === "mono" ? (
        <MonoStyle
          metric={metric}
          periodData={periodData}
          singleData={singleData}
          categoryData={categoryData}
          currency={currency}
          primary={primary}
        />
      ) : null}
    </ChartShell>
  );
}

function DefaultStyle({
  metric,
  periodData,
  singleData,
  categoryData,
  primary,
  secondary,
  currency,
}: {
  metric: ChartViewProps["metric"];
  periodData: PeriodRow[];
  singleData: SingleSeriesRow[];
  categoryData: CategoryRow[];
  primary: string;
  secondary: string;
  currency: string;
}) {
  const axisMoney = (value: string) => formatAxisMoney(Number(value), currency);

  if (metric === "category") {
    return (
      <EChartsBarChart
        data={categoryData}
        config={{
          total: {
            label: "Spending",
            colors: { light: [primary], dark: [primary] },
          },
        }}
        className="h-80 w-full"
        xDataKey="category"
      >
        <EChartsBarChart.Grid />
        <EChartsBarChart.XAxis dataKey="category" />
        <EChartsBarChart.YAxis tickFormatter={axisMoney} />
        <EChartsBarChart.Tooltip />
        <EChartsBarChart.Bar dataKey="total" variant="gradient" />
      </EChartsBarChart>
    );
  }

  if (metric === "both") {
    return (
      <EChartsBarChart
        data={periodData}
        config={{
          income: {
            label: "Income",
            colors: { light: [secondary], dark: [secondary] },
          },
          expense: {
            label: "Spending",
            colors: { light: [primary], dark: [primary] },
          },
        }}
        className="h-80 w-full"
        xDataKey="period"
      >
        <EChartsBarChart.Grid />
        <EChartsBarChart.XAxis dataKey="period" />
        <EChartsBarChart.YAxis tickFormatter={axisMoney} />
        <EChartsBarChart.Legend />
        <EChartsBarChart.Tooltip />
        <EChartsBarChart.Bar dataKey="income" variant="gradient" />
        <EChartsBarChart.Bar dataKey="expense" variant="gradient" />
      </EChartsBarChart>
    );
  }

  const valueColor = metric === "income" ? secondary : primary;

  return (
    <EChartsBarChart
      data={singleData}
      config={{
        value: {
          label: metric === "income" ? "Income" : "Spending",
          colors: { light: [valueColor], dark: [valueColor] },
        },
      }}
      className="h-80 w-full"
      xDataKey="period"
    >
      <EChartsBarChart.Grid />
      <EChartsBarChart.XAxis dataKey="period" />
      <EChartsBarChart.YAxis tickFormatter={axisMoney} />
      <EChartsBarChart.Tooltip />
      <EChartsBarChart.Bar dataKey="value" variant="gradient" />
    </EChartsBarChart>
  );
}

/** Stacked peak highlight — best period callout. */
function PeakStyle({
  metric,
  periodData,
  singleData,
  categoryData,
  currency,
  primary,
  secondary,
}: {
  metric: ChartViewProps["metric"];
  periodData: PeriodRow[];
  singleData: SingleSeriesRow[];
  categoryData: CategoryRow[];
  currency: string;
  primary: string;
  secondary: string;
}) {
  if (metric === "both") {
    const peak = periodData.reduce(
      (best, row) =>
        row.income + row.expense > best.income + best.expense ? row : best,
      periodData[0] ?? { period: "—", income: 0, expense: 0, net: 0 },
    );
    const peakTotal = peak.income + peak.expense;

    const config = {
      income: { label: "Income", colors: peakInk(secondary) },
      expense: { label: "Spending", colors: peakInk(primary) },
    } satisfies ChartConfig;

    return (
      <div className="flex w-full flex-col p-1">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">Best period</span>
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-primary text-2xl font-semibold tracking-tight sm:text-3xl">
                {formatMoney(peakTotal, currency)}
              </span>
              <span className="text-muted-foreground text-sm">in {peak.period}</span>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5 pt-1">
            <span className="text-muted-foreground flex items-center gap-2 text-[11px] sm:text-xs">
              <span className="size-2.5 shrink-0 rounded-[3px]" style={{ backgroundColor: secondary }} />
              Income
            </span>
            <span className="text-muted-foreground flex items-center gap-2 text-[11px] sm:text-xs">
              <span className="size-2.5 shrink-0 rounded-[3px]" style={{ backgroundColor: primary }} />
              Spending
            </span>
          </div>
        </div>

        <div className="mt-3 h-72 w-full sm:h-80">
          <EChartsBarChart
            data={periodData}
            config={config}
            xDataKey="period"
            className="h-full w-full"
            stackType="stacked"
            enableMaxValueHighlight
          >
            <EChartsBarChart.XAxis dataKey="period" hideDots tickFormatter={shortPeriodTick} />
            <EChartsBarChart.Tooltip />
            <EChartsBarChart.Bar dataKey="expense" radius={6} />
            <EChartsBarChart.Bar dataKey="income" radius={6} />
          </EChartsBarChart>
        </div>
      </div>
    );
  }

  const rows =
    metric === "category"
      ? categoryData.map((r) => ({ period: r.category, value: r.total }))
      : singleData;
  const peak = rows.reduce(
    (best, row) => (row.value > best.value ? row : best),
    rows[0] ?? { period: "—", value: 0 },
  );
  const label = metric === "income" ? "Income" : "Spending";
  const ink = metric === "income" ? secondary : primary;

  const config = {
    value: { label, colors: peakInk(ink) },
  } satisfies ChartConfig;

  return (
    <div className="flex w-full flex-col p-1">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs">Best period</span>
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-primary text-2xl font-semibold tracking-tight sm:text-3xl">
              {formatMoney(peak.value, currency)}
            </span>
            <span className="text-muted-foreground text-sm">in {peak.period}</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5 pt-1">
          <span className="text-muted-foreground flex items-center gap-2 text-[11px] sm:text-xs">
            <span className="size-2.5 shrink-0 rounded-[3px]" style={{ backgroundColor: ink }} />
            {label}
          </span>
        </div>
      </div>

      <div className="mt-3 h-72 w-full sm:h-80">
        <EChartsBarChart
          data={rows}
          config={config}
          xDataKey="period"
          className="h-full w-full"
          enableMaxValueHighlight
        >
          <EChartsBarChart.XAxis dataKey="period" hideDots tickFormatter={shortPeriodTick} />
          <EChartsBarChart.Tooltip />
          <EChartsBarChart.Bar dataKey="value" radius={6} />
        </EChartsBarChart>
      </div>
    </div>
  );
}

/** Blocks / grid bars with mono header. */
function GridStyle({
  metric,
  periodData,
  singleData,
  categoryData,
  currency,
  primary,
}: {
  metric: ChartViewProps["metric"];
  periodData: PeriodRow[];
  singleData: SingleSeriesRow[];
  categoryData: CategoryRow[];
  currency: string;
  primary: string;
}) {
  const { rows, total, peakLabel, seriesLabel, dataKey } = resolveSingleSeries(
    metric,
    periodData,
    singleData,
    categoryData,
  );

  const ink = primary || "#FFFFFF";
  const config = {
    [dataKey]: {
      label: seriesLabel,
      colors: { light: ["#18181b"], dark: [ink] },
    },
  } satisfies ChartConfig;

  return (
    <div className="flex w-full flex-col p-1">
      <MonoHeader
        leftLabel={`[Σ] Total`}
        leftValue={formatMoney(total, currency)}
        rightLabel={`[⬆] Peak`}
        rightValue={peakLabel}
        metaLeft="CELL: 1:1"
        metaRight="TYPE: GRID"
      />

      <hr className="my-4 border-t border-dashed border-border" />

      <div className="h-72 w-full sm:h-80">
        <EChartsBarChart
          data={rows}
          config={config}
          xDataKey="period"
          className="h-full w-full"
          barCategoryGap={14}
        >
          <EChartsBarChart.XAxis dataKey="period" hideDots />
          <EChartsBarChart.Tooltip />
          <EChartsBarChart.Bar dataKey={dataKey} variant="blocks" />
        </EChartsBarChart>
      </div>
    </div>
  );
}

/** Expandable bars with monospace sales-style header. */
function MonoStyle({
  metric,
  periodData,
  singleData,
  categoryData,
  currency,
  primary,
}: {
  metric: ChartViewProps["metric"];
  periodData: PeriodRow[];
  singleData: SingleSeriesRow[];
  categoryData: CategoryRow[];
  currency: string;
  primary: string;
}) {
  const { rows, total, peakLabel, seriesLabel, dataKey } = resolveSingleSeries(
    metric,
    periodData,
    singleData,
    categoryData,
  );

  const ink = primary || "#fafafa";
  const config = {
    [dataKey]: {
      label: seriesLabel,
      colors: { light: ["#18181b"], dark: [ink] },
    },
  } satisfies ChartConfig;

  return (
    <div className="flex w-full flex-col p-1">
      <MonoHeader
        leftLabel={`[$] Total ${seriesLabel}`}
        leftValue={formatMoney(total, currency)}
        rightLabel={`[⬆] Top`}
        rightValue={peakLabel}
        metaLeft="X-AXIS: PERIOD"
        metaRight={`Y-AXIS: ${seriesLabel.toUpperCase()}`}
      />

      <hr className="my-4 border-t border-dashed border-border" />

      <div className="h-72 w-full sm:h-80">
        <EChartsBarChart
          data={rows}
          config={config}
          xDataKey="period"
          className="h-full w-full"
        >
          <EChartsBarChart.XAxis
            dataKey="period"
            tickFormatter={shortPeriodTick}
            hideDots
          />
          <EChartsBarChart.Bar dataKey={dataKey} variant="expandable" />
        </EChartsBarChart>
      </div>
    </div>
  );
}

function resolveSingleSeries(
  metric: ChartViewProps["metric"],
  periodData: PeriodRow[],
  singleData: SingleSeriesRow[],
  categoryData: CategoryRow[],
) {
  if (metric === "both") {
    const rows = periodData.map((r) => ({
      period: r.period,
      value: r.net,
    }));
    const total = rows.reduce((s, r) => s + r.value, 0);
    const peak = rows.reduce(
      (best, row) => (row.value > best.value ? row : best),
      rows[0] ?? { period: "—", value: 0 },
    );
    return {
      rows,
      total,
      peakLabel: peak.period,
      seriesLabel: "Net",
      dataKey: "value" as const,
    };
  }

  if (metric === "category") {
    const rows = categoryData.map((r) => ({
      period: r.category,
      value: r.total,
    }));
    const total = rows.reduce((s, r) => s + r.value, 0);
    const peak = rows.reduce(
      (best, row) => (row.value > best.value ? row : best),
      rows[0] ?? { period: "—", value: 0 },
    );
    return {
      rows,
      total,
      peakLabel: peak.period,
      seriesLabel: "Spending",
      dataKey: "value" as const,
    };
  }

  const total = singleData.reduce((s, r) => s + r.value, 0);
  const peak = singleData.reduce(
    (best, row) => (row.value > best.value ? row : best),
    singleData[0] ?? { period: "—", value: 0 },
  );
  return {
    rows: singleData,
    total,
    peakLabel: peak.period,
    seriesLabel: metric === "income" ? "Income" : "Spending",
    dataKey: "value" as const,
  };
}

function MonoHeader({
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
  metaLeft,
  metaRight,
}: {
  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
  metaLeft: string;
  metaRight: string;
}) {
  return (
    <div className="flex flex-row justify-between gap-3">
      <div className="flex flex-row">
        <div className="flex flex-col gap-2">
          <span className="text-muted-foreground font-mono text-xs">{leftLabel}</span>
          <span className="text-primary font-mono text-2xl tracking-tighter sm:text-3xl">
            {leftValue}
          </span>
        </div>
        <hr className="border-border mx-4 h-auto border-l border-dashed" />
        <div className="flex flex-col gap-2">
          <span className="text-muted-foreground font-mono text-xs">{rightLabel}</span>
          <span className="text-primary font-mono text-2xl tracking-tighter sm:text-3xl">
            {rightValue}
          </span>
        </div>
      </div>
      <div className="flex flex-col justify-end gap-1">
        <span className="text-muted-foreground font-mono text-[10px]">
          {"// "}
          <span className="text-primary">{metaLeft}</span>
        </span>
        <span className="text-muted-foreground font-mono text-[10px]">
          {"// "}
          <span className="text-primary">{metaRight}</span>
        </span>
      </div>
    </div>
  );
}
