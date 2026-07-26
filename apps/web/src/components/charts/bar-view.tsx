import { ChartShell } from "@/components/charts/chart-shell";
import type { ChartViewProps } from "@/components/charts/types";
import { EChartsBarChart } from "@/components/evilcharts/charts/echarts-bar-chart";
import { seriesColors } from "@/lib/mono";

/** Bar chart view — paste EvilCharts bar style variants here later. */
export function BarChartView({
  periodData,
  singleData,
  categoryData,
  seriesConfig,
  metric,
  background = "black",
}: ChartViewProps) {
  if (metric === "category") {
    return (
      <ChartShell title="Spending by category" background={background} filenameBase="funds-bar-category">
        <EChartsBarChart
          data={categoryData}
          config={{
            total: {
              label: "Spending",
              colors: seriesColors("expense"),
            },
          }}
          className="h-80 w-full"
          xDataKey="category"
        >
          <EChartsBarChart.Grid />
          <EChartsBarChart.XAxis dataKey="category" />
          <EChartsBarChart.YAxis />
          <EChartsBarChart.Tooltip />
          <EChartsBarChart.Bar dataKey="total" variant="gradient" />
        </EChartsBarChart>
      </ChartShell>
    );
  }

  if (metric === "both") {
    return (
      <ChartShell title="Income vs spending" background={background} filenameBase="funds-bar-cashflow">
        <EChartsBarChart
          data={periodData}
          config={seriesConfig}
          className="h-80 w-full"
          xDataKey="period"
        >
          <EChartsBarChart.Grid />
          <EChartsBarChart.XAxis dataKey="period" />
          <EChartsBarChart.YAxis />
          <EChartsBarChart.Legend />
          <EChartsBarChart.Tooltip />
          <EChartsBarChart.Bar dataKey="income" variant="gradient" />
          <EChartsBarChart.Bar dataKey="expense" variant="gradient" />
        </EChartsBarChart>
      </ChartShell>
    );
  }

  return (
    <ChartShell
      title={metric === "income" ? "Income over time" : "Spending over time"}
      background={background}
      filenameBase={`funds-bar-${metric}`}
    >
      <EChartsBarChart
        data={singleData}
        config={seriesConfig}
        className="h-80 w-full"
        xDataKey="period"
      >
        <EChartsBarChart.Grid />
        <EChartsBarChart.XAxis dataKey="period" />
        <EChartsBarChart.YAxis />
        <EChartsBarChart.Tooltip />
        <EChartsBarChart.Bar dataKey="value" variant="gradient" />
      </EChartsBarChart>
    </ChartShell>
  );
}
