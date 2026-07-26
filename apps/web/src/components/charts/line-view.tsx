import { ChartShell } from "@/components/charts/chart-shell";
import type { ChartViewProps, PeriodRow, SingleSeriesRow } from "@/components/charts/types";
import {
  EChartsLineChart,
  type ChartConfig,
} from "@/components/evilcharts/charts/echarts-line-chart";
import { cn, formatMoney } from "@/lib/utils";

type LineStyle = "default" | "glow" | "versus";

const GLOW_COLORS = {
  income: { light: ["#f97316", "#ec4899"], dark: ["#fb923c", "#f472b6"] },
  expense: { light: ["#0891b2", "#7c3aed"], dark: ["#22d3ee", "#a78bfa"] },
  value: { light: ["#f97316", "#ec4899"], dark: ["#fb923c", "#f472b6"] },
};

export function LineChartView({
  periodData,
  singleData,
  seriesConfig,
  metric,
  styleId = "default",
  background = "black",
}: ChartViewProps) {
  const style = (
    ["default", "glow", "versus"].includes(styleId) ? styleId : "default"
  ) as LineStyle;

  if (metric === "category") {
    return (
      <ChartShell background={background} filenameBase="funds-line-category">
        <p className="py-12 text-center text-sm text-muted-foreground">
          Switch to spending or income for line charts.
        </p>
      </ChartShell>
    );
  }

  return (
    <ChartShell background={background} filenameBase={`funds-line-${metric}-${style}`}>
      {style === "default" ? (
        <DefaultStyle
          metric={metric}
          periodData={periodData}
          singleData={singleData}
          seriesConfig={seriesConfig}
        />
      ) : null}
      {style === "glow" ? (
        <GlowStyle metric={metric} periodData={periodData} singleData={singleData} />
      ) : null}
      {style === "versus" ? (
        <VersusStyle metric={metric} periodData={periodData} singleData={singleData} />
      ) : null}
    </ChartShell>
  );
}

/** Style 1 — classic grid + legend. */
function DefaultStyle({
  metric,
  periodData,
  singleData,
  seriesConfig,
}: {
  metric: ChartViewProps["metric"];
  periodData: PeriodRow[];
  singleData: SingleSeriesRow[];
  seriesConfig: ChartConfig;
}) {
  if (metric === "both") {
    return (
      <EChartsLineChart
        data={periodData}
        config={seriesConfig}
        className="h-80 w-full"
        xDataKey="period"
      >
        <EChartsLineChart.Grid />
        <EChartsLineChart.XAxis dataKey="period" />
        <EChartsLineChart.YAxis />
        <EChartsLineChart.Legend />
        <EChartsLineChart.Tooltip />
        <EChartsLineChart.Line dataKey="income" />
        <EChartsLineChart.Line dataKey="expense" />
      </EChartsLineChart>
    );
  }

  return (
    <EChartsLineChart
      data={singleData}
      config={seriesConfig}
      className="h-80 w-full"
      xDataKey="period"
    >
      <EChartsLineChart.Grid />
      <EChartsLineChart.XAxis dataKey="period" />
      <EChartsLineChart.YAxis />
      <EChartsLineChart.Tooltip />
      <EChartsLineChart.Line dataKey="value" />
    </EChartsLineChart>
  );
}

/** Style 2 — glowing monotone lines + summary stats footer. */
function GlowStyle({
  metric,
  periodData,
  singleData,
}: {
  metric: ChartViewProps["metric"];
  periodData: PeriodRow[];
  singleData: SingleSeriesRow[];
}) {
  if (metric === "both") {
    const incomeTotal = periodData.reduce((s, r) => s + r.income, 0);
    const expenseTotal = periodData.reduce((s, r) => s + r.expense, 0);
    const incomeDelta = pctChange(
      periodData[0]?.income ?? 0,
      periodData[periodData.length - 1]?.income ?? 0,
    );
    const expenseDelta = pctChange(
      periodData[0]?.expense ?? 0,
      periodData[periodData.length - 1]?.expense ?? 0,
    );
    const peakIncome = maxBy(periodData, (r) => r.income);
    const peakExpense = maxBy(periodData, (r) => r.expense);

    const config = {
      income: { label: "Income", colors: GLOW_COLORS.income },
      expense: { label: "Spending", colors: GLOW_COLORS.expense },
    } satisfies ChartConfig;

    return (
      <div className="flex w-full flex-col px-1 pt-1 pb-1">
        <div className="h-72 w-full sm:h-80">
          <EChartsLineChart
            data={periodData}
            config={config}
            xDataKey="period"
            className="h-full w-full"
            curveType="monotone"
          >
            <EChartsLineChart.Grid />
            <EChartsLineChart.YAxis />
            <EChartsLineChart.Tooltip variant="frosted-glass" />
            <EChartsLineChart.Line dataKey="income" strokeVariant="solid" strokeWidth={2} glowing>
              <EChartsLineChart.ActiveDot variant="ping" />
            </EChartsLineChart.Line>
            <EChartsLineChart.Line dataKey="expense" strokeVariant="solid" strokeWidth={2} glowing>
              <EChartsLineChart.ActiveDot variant="ping" />
            </EChartsLineChart.Line>
          </EChartsLineChart>
        </div>

        <div className="mt-3 grid shrink-0 grid-cols-2 gap-3 sm:gap-4">
          <StatBlock
            label="Income"
            value={formatMoney(incomeTotal)}
            delta={incomeDelta}
            sub={`${formatMoney(periodData[0]?.income ?? 0)} first period`}
            swatch="bg-[#f97316]"
          />
          <StatBlock
            label="Spending"
            value={formatMoney(expenseTotal)}
            delta={expenseDelta}
            sub={`${formatMoney(periodData[0]?.expense ?? 0)} first period`}
            swatch="bg-[#0891b2]"
          />
        </div>

        <div className="mt-3 shrink-0">
          <FooterRow
            label={peakIncome ? `Peak income · ${peakIncome.period}` : "Peak income"}
            amount={formatMoney(peakIncome?.income ?? 0)}
          />
          <FooterRow
            label={peakExpense ? `Peak spending · ${peakExpense.period}` : "Peak spending"}
            amount={formatMoney(peakExpense?.expense ?? 0)}
            bordered
          />
        </div>
      </div>
    );
  }

  const total = singleData.reduce((s, r) => s + r.value, 0);
  const first = singleData[0]?.value ?? 0;
  const last = singleData[singleData.length - 1]?.value ?? 0;
  const delta = pctChange(first, last);
  const label = metric === "income" ? "Income" : "Spending";
  const peak = maxBy(singleData, (r) => r.value);
  const low = minBy(singleData, (r) => r.value);

  const config = {
    value: { label, colors: GLOW_COLORS.value },
  } satisfies ChartConfig;

  return (
    <div className="flex w-full flex-col px-1 pt-1 pb-1">
      <div className="h-72 w-full sm:h-80">
        <EChartsLineChart
          data={singleData}
          config={config}
          xDataKey="period"
          className="h-full w-full"
          curveType="monotone"
        >
          <EChartsLineChart.Grid />
          <EChartsLineChart.YAxis />
          <EChartsLineChart.Tooltip variant="frosted-glass" />
          <EChartsLineChart.Line dataKey="value" strokeVariant="solid" strokeWidth={2} glowing>
            <EChartsLineChart.ActiveDot variant="ping" />
          </EChartsLineChart.Line>
        </EChartsLineChart>
      </div>

      <div className="mt-3 grid shrink-0 grid-cols-2 gap-3 sm:gap-4">
        <StatBlock
          label="Total"
          value={formatMoney(total)}
          delta={delta}
          sub={`${formatMoney(first)} first period`}
          swatch="bg-[#f97316]"
        />
        <StatBlock
          label="Latest"
          value={formatMoney(last)}
          delta={delta}
          sub={`${label.toLowerCase()} this range`}
          swatch="bg-[#ec4899]"
        />
      </div>

      <div className="mt-3 shrink-0">
        <FooterRow
          label={peak ? `Highest · ${peak.period}` : "Highest"}
          amount={formatMoney(peak?.value ?? 0)}
        />
        <FooterRow
          label={low ? `Lowest · ${low.period}` : "Lowest"}
          amount={formatMoney(low?.value ?? 0)}
          bordered
        />
      </div>
    </div>
  );
}

/** Style 3 — solid current vs dashed previous comparison. */
function VersusStyle({
  metric,
  periodData,
  singleData,
}: {
  metric: ChartViewProps["metric"];
  periodData: PeriodRow[];
  singleData: SingleSeriesRow[];
}) {
  if (metric === "both") {
    const total = periodData.reduce((s, r) => s + r.expense, 0);
    const incomeTotal = periodData.reduce((s, r) => s + r.income, 0);
    const delta = pctChange(incomeTotal, total);

    const config = {
      current: {
        label: "Spending",
        colors: { light: ["#171717"], dark: ["#fafafa"] },
      },
      previous: {
        label: "Income",
        colors: { light: ["#d4d4d4"], dark: ["#525252"] },
      },
    } satisfies ChartConfig;

    const data = periodData.map((row) => ({
      period: row.period,
      current: row.expense,
      previous: row.income,
    }));

    return (
      <VersusFrame
        title="Spending vs income"
        total={total}
        delta={delta}
        deltaLabel="vs income"
        currentLabel="Spending"
        previousLabel="Income"
        data={data}
        config={config}
      />
    );
  }

  const data = singleData.map((row, i) => ({
    period: row.period,
    current: row.value,
    previous: i === 0 ? row.value : (singleData[i - 1]?.value ?? row.value),
  }));
  const total = data.reduce((s, r) => s + r.current, 0);
  const prevTotal = data.reduce((s, r) => s + r.previous, 0);
  const delta = pctChange(prevTotal, total);
  const label = metric === "income" ? "Income" : "Spending";

  const config = {
    current: {
      label: "This period",
      colors: { light: ["#171717"], dark: ["#fafafa"] },
    },
    previous: {
      label: "Prior period",
      colors: { light: ["#d4d4d4"], dark: ["#525252"] },
    },
  } satisfies ChartConfig;

  return (
    <VersusFrame
      title={label}
      total={total}
      delta={delta}
      deltaLabel="vs prior"
      currentLabel="This period"
      previousLabel="Prior period"
      data={data}
      config={config}
    />
  );
}

function VersusFrame({
  title,
  total,
  delta,
  deltaLabel,
  currentLabel,
  previousLabel,
  data,
  config,
}: {
  title: string;
  total: number;
  delta: number;
  deltaLabel: string;
  currentLabel: string;
  previousLabel: string;
  data: { period: string; current: number; previous: number }[];
  config: ChartConfig;
}) {
  const legend = [
    { key: "current", label: currentLabel, swatch: "border-[#fafafa]" },
    { key: "previous", label: previousLabel, swatch: "border-[#525252]" },
  ];

  return (
    <div className="flex w-full flex-col p-1">
      <span className="text-primary text-sm font-medium tracking-tight">{title}</span>

      <div className="mt-1 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-primary text-2xl font-semibold tracking-tight sm:text-3xl">
            {formatMoney(total)}
          </span>
          <span
            className={cn(
              "text-xs font-medium",
              delta >= 0 ? "text-emerald-500" : "text-rose-400",
            )}
          >
            {delta > 0 ? "+" : ""}
            {delta.toFixed(1)}%
          </span>
          <span className="text-muted-foreground text-xs">{deltaLabel}</span>
        </div>
        <div className="flex items-center gap-3">
          {legend.map(({ key, label, swatch }) => (
            <span
              key={key}
              className="text-muted-foreground flex items-center gap-1.5 text-[11px] sm:text-xs"
            >
              <span className={cn("size-2.5 shrink-0 rounded-full border-2", swatch)} />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-2 h-72 w-full sm:h-80">
        <EChartsLineChart
          data={data}
          config={config}
          xDataKey="period"
          className="h-full w-full"
          curveType="linear"
        >
          <EChartsLineChart.Grid />
          <EChartsLineChart.YAxis />
          <EChartsLineChart.XAxis
            dataKey="period"
            tickFormatter={(value) => shortTick(value)}
          />
          <EChartsLineChart.Tooltip />
          <EChartsLineChart.Line dataKey="previous" strokeVariant="dashed" strokeWidth={1.5} />
          <EChartsLineChart.Line dataKey="current" strokeVariant="solid" strokeWidth={1.5}>
            <EChartsLineChart.ActiveDot />
          </EChartsLineChart.Line>
        </EChartsLineChart>
      </div>
    </div>
  );
}

function StatBlock({
  label,
  value,
  delta,
  sub,
  swatch,
}: {
  label: string;
  value: string;
  delta: number;
  sub: string;
  swatch: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-primary flex items-center gap-1.5 text-[10px] font-medium sm:text-[11px]">
        <span className={cn("size-2 shrink-0 rounded-[3px]", swatch)} />
        {label}
      </span>
      <span className="text-primary text-xl font-semibold tracking-tight sm:text-2xl">
        {value}
      </span>
      <span className="flex items-center gap-1.5 text-[10px] sm:text-[11px]">
        <span
          className={cn(
            "font-medium",
            delta >= 0 ? "text-emerald-500" : "text-rose-400",
          )}
        >
          {delta > 0 ? "+" : ""}
          {delta.toFixed(1)}%
        </span>
        <span className="text-muted-foreground">{sub}</span>
      </span>
    </div>
  );
}

function FooterRow({
  label,
  amount,
  bordered,
}: {
  label: string;
  amount: string;
  bordered?: boolean;
}) {
  return (
    <div
      className={cn(
        "border-border flex items-center justify-between py-1 text-xs sm:py-1.5 sm:text-sm",
        bordered && "border-t",
      )}
    >
      <span className="text-muted-foreground">{label}</span>
      <span className="text-primary font-medium">{amount}</span>
    </div>
  );
}

function pctChange(from: number, to: number): number {
  if (from === 0) return to === 0 ? 0 : 100;
  return ((to - from) / Math.abs(from)) * 100;
}

function maxBy<T>(rows: T[], score: (row: T) => number): T | undefined {
  if (!rows.length) return undefined;
  return rows.reduce((best, row) => (score(row) > score(best) ? row : best));
}

function minBy<T>(rows: T[], score: (row: T) => number): T | undefined {
  if (!rows.length) return undefined;
  return rows.reduce((best, row) => (score(row) < score(best) ? row : best));
}

function shortTick(period: string): string {
  const parts = period.split(" ");
  if (parts.length >= 2) return parts[0]!.slice(0, 3);
  if (period.length === 7) return period.slice(5); // YYYY-MM
  if (period.length >= 10) return period.slice(5, 10); // MM-DD
  return period.length > 6 ? period.slice(0, 3) : period;
}
