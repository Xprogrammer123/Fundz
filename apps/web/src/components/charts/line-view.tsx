import { ChartShell } from "@/components/charts/chart-shell";
import type { ChartViewProps } from "@/components/charts/types";
import { EChartsLineChart } from "@/components/evilcharts/charts/echarts-line-chart";

/** Line chart view — paste EvilCharts line style variants here later. */
export function LineChartView({
  periodData,
  singleData,
  seriesConfig,
  metric,
  background = "black",
}: ChartViewProps) {
  if (metric === "category") {
    return (
      <ChartShell title="Category trend (line)" background={background} filenameBase="funds-line-category">
        <p className="py-12 text-center text-sm text-muted-foreground">
          Line charts work best for time series. Switch metric to spending/income, or use pie/bar for categories.
        </p>
      </ChartShell>
    );
  }

  if (metric === "both") {
    return (
      <ChartShell title="Income vs spending" background={background} filenameBase="funds-line-cashflow">
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
      </ChartShell>
    );
  }

  return (
    <ChartShell
      title={metric === "income" ? "Income over time" : "Spending over time"}
      background={background}
      filenameBase={`funds-line-${metric}`}
    >
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
    </ChartShell>
  );
}
