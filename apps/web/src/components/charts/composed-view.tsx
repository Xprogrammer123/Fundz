import { ChartShell } from "@/components/charts/chart-shell";
import type { ChartViewProps, PeriodRow } from "@/components/charts/types";
import {
  EChartsComposedChart,
  type ChartConfig,
} from "@/components/evilcharts/charts/echarts-composed-chart";
import { seriesColors } from "@/lib/mono";

type ComposedStyle = "default" | "hatched" | "stripped" | "bump" | "spectrum";

const PAIR_COLORS = {
  revenue: {
    light: ["#3b82f6"],
    dark: ["#6A5ACD"],
  },
  profit: {
    light: ["#10b981"],
    dark: ["#34d399"],
  },
};

const SPECTRUM_COLORS = {
  revenue: {
    light: ["#f43f5e", "#ec4899", "#a855f7", "#6366f1", "#3b82f6"],
    dark: ["#f43f5e", "#ec4899", "#a855f7", "#6366f1", "#3b82f6"],
  },
  profit: {
    light: ["#10b981", "#14b8a6", "#06b6d4"],
    dark: ["#10b981", "#14b8a6", "#06b6d4"],
  },
};

export function ComposedChartView({
  periodData,
  seriesConfig,
  metric,
  styleId = "default",
  background = "black",
}: ChartViewProps) {
  const style = (
    ["default", "hatched", "stripped", "bump", "spectrum"].includes(styleId)
      ? styleId
      : "default"
  ) as ComposedStyle;

  if (metric === "category") {
    return (
      <ChartShell background={background} filenameBase="funds-composed">
        <p className="py-12 text-center text-sm text-muted-foreground">
          Switch to income vs spending for composed charts.
        </p>
      </ChartShell>
    );
  }

  return (
    <ChartShell background={background} filenameBase={`funds-composed-${style}`}>
      {style === "default" ? (
        <DefaultStyle periodData={periodData} seriesConfig={seriesConfig} />
      ) : null}
      {style === "hatched" ? (
        <PairStyle periodData={periodData} barVariant="hatched" />
      ) : null}
      {style === "stripped" ? (
        <PairStyle periodData={periodData} barVariant="stripped" />
      ) : null}
      {style === "bump" ? (
        <PairStyle periodData={periodData} curveType="bump" />
      ) : null}
      {style === "spectrum" ? (
        <PairStyle periodData={periodData} spectrum />
      ) : null}
    </ChartShell>
  );
}

/** Classic: income + spending bars with net line. */
function DefaultStyle({
  periodData,
  seriesConfig,
}: {
  periodData: PeriodRow[];
  seriesConfig: ChartConfig;
}) {
  const config = {
    ...seriesConfig,
    net: {
      label: "Net",
      colors: seriesColors("net"),
    },
  };

  return (
    <EChartsComposedChart
      data={periodData}
      config={config}
      className="h-80 w-full"
      xDataKey="period"
    >
      <EChartsComposedChart.Grid />
      <EChartsComposedChart.XAxis dataKey="period" />
      <EChartsComposedChart.YAxis />
      <EChartsComposedChart.Legend />
      <EChartsComposedChart.Tooltip />
      <EChartsComposedChart.Bar dataKey="income" />
      <EChartsComposedChart.Bar dataKey="expense" />
      <EChartsComposedChart.Line dataKey="net" />
    </EChartsComposedChart>
  );
}

/**
 * Revenue/profit style: spending as bars, net as line.
 * Variants: hatched / stripped / bump curve / spectrum colors.
 */
function PairStyle({
  periodData,
  barVariant,
  curveType,
  spectrum,
}: {
  periodData: PeriodRow[];
  barVariant?: "hatched" | "stripped";
  curveType?: "bump";
  spectrum?: boolean;
}) {
  const data = periodData.map((row) => ({
    period: row.period,
    revenue: row.expense,
    profit: row.net,
  }));

  const config = {
    revenue: {
      label: "Spending",
      colors: spectrum ? SPECTRUM_COLORS.revenue : PAIR_COLORS.revenue,
    },
    profit: {
      label: "Net",
      colors: spectrum ? SPECTRUM_COLORS.profit : PAIR_COLORS.profit,
    },
  } satisfies ChartConfig;

  return (
    <EChartsComposedChart
      className="h-80 w-full p-1"
      xDataKey="period"
      data={data}
      config={config}
    >
      <EChartsComposedChart.Grid />
      <EChartsComposedChart.XAxis
        dataKey="period"
        tickFormatter={(value) => shortTick(value)}
      />
      <EChartsComposedChart.Legend isClickable />
      <EChartsComposedChart.Tooltip />
      <EChartsComposedChart.Bar
        dataKey="revenue"
        variant={barVariant}
        isClickable
      />
      <EChartsComposedChart.Line
        dataKey="profit"
        curveType={curveType}
        isClickable
      />
    </EChartsComposedChart>
  );
}

function shortTick(period: string): string {
  const parts = period.split(" ");
  if (parts.length >= 2) return parts[0]!.slice(0, 3);
  if (period.length >= 3) return period.slice(0, 3);
  return period;
}
