import { ChartShell } from "@/components/charts/chart-shell";
import type { ChartViewProps } from "@/components/charts/types";
import { EChartsAreaChart } from "@/components/evilcharts/charts/echarts-area-chart";

/** Area chart view — paste EvilCharts area style variants here later. */
export function AreaChartView({
  periodData,
  singleData,
  seriesConfig,
  metric,
  subtitle,
}: ChartViewProps) {
  if (metric === "category") {
    return (
      <ChartShell title="Category area" subtitle={subtitle} filenameBase="funds-area-category">
        <p className="py-12 text-center text-sm text-muted-foreground">
          Area charts are for trends over time. Pick spending/income, or use pie/radial for categories.
        </p>
      </ChartShell>
    );
  }

  if (metric === "both") {
    return (
      <ChartShell title="Income vs spending" subtitle={subtitle} filenameBase="funds-area-cashflow">
        <EChartsAreaChart
          data={periodData}
          config={seriesConfig}
          className="h-80 w-full"
          xDataKey="period"
        >
          <EChartsAreaChart.Grid />
          <EChartsAreaChart.XAxis dataKey="period" />
          <EChartsAreaChart.YAxis />
          <EChartsAreaChart.Legend />
          <EChartsAreaChart.Tooltip />
          <EChartsAreaChart.Area dataKey="income" variant="gradient" />
          <EChartsAreaChart.Area dataKey="expense" variant="gradient" />
        </EChartsAreaChart>
      </ChartShell>
    );
  }

  return (
    <ChartShell
      title={metric === "income" ? "Income over time" : "Spending over time"}
      subtitle={subtitle}
      filenameBase={`funds-area-${metric}`}
    >
      <EChartsAreaChart
        data={singleData}
        config={seriesConfig}
        className="h-80 w-full"
        xDataKey="period"
      >
        <EChartsAreaChart.Grid />
        <EChartsAreaChart.XAxis dataKey="period" />
        <EChartsAreaChart.YAxis />
        <EChartsAreaChart.Tooltip />
        <EChartsAreaChart.Area dataKey="value" variant="gradient" />
      </EChartsAreaChart>
    </ChartShell>
  );
}
