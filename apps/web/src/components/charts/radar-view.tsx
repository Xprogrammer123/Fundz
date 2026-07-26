import { ChartShell } from "@/components/charts/chart-shell";
import type { ChartViewProps } from "@/components/charts/types";
import { EChartsRadarChart } from "@/components/evilcharts/charts/echarts-radar-chart";
import { seriesColors } from "@/lib/mono";

/** Radar chart view — paste EvilCharts radar style variants here later. */
export function RadarChartView({
  categoryData,
  periodData,
  metric,
  background = "black",
}: ChartViewProps) {
  if (metric === "category" || categoryData.length > 0) {
    const radarData = categoryData.slice(0, 8).map((c) => ({
      category: c.category,
      spending: c.total,
    }));

    return (
      <ChartShell
        title="Category radar"
        background={background}
        filenameBase="funds-radar-category"
      >
        {radarData.length ? (
          <EChartsRadarChart
            data={radarData}
            config={{
              spending: {
                label: "Spending",
                colors: seriesColors("expense"),
              },
            }}
            className="h-80 w-full"
          >
            <EChartsRadarChart.PolarGrid />
            <EChartsRadarChart.PolarAngleAxis dataKey="category" />
            <EChartsRadarChart.Tooltip />
            <EChartsRadarChart.Radar dataKey="spending" />
          </EChartsRadarChart>
        ) : (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No category spending in this period.
          </p>
        )}
      </ChartShell>
    );
  }

  const radarData = periodData.slice(-6).map((p) => ({
    period: p.period,
    income: p.income,
    expense: p.expense,
  }));

  return (
    <ChartShell title="Period radar" background={background} filenameBase="funds-radar-period">
      <EChartsRadarChart
        data={radarData}
        config={{
          income: {
            label: "Income",
            colors: seriesColors("income"),
          },
          expense: {
            label: "Spending",
            colors: seriesColors("expense"),
          },
        }}
        className="h-80 w-full"
      >
        <EChartsRadarChart.PolarGrid />
        <EChartsRadarChart.PolarAngleAxis dataKey="period" />
        <EChartsRadarChart.Legend />
        <EChartsRadarChart.Tooltip />
        <EChartsRadarChart.Radar dataKey="income" />
        <EChartsRadarChart.Radar dataKey="expense" />
      </EChartsRadarChart>
    </ChartShell>
  );
}
