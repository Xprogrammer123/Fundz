import { ChartShell } from "@/components/charts/chart-shell";
import type { ChartViewProps } from "@/components/charts/types";
import { EChartsRadarChart } from "@/components/evilcharts/charts/echarts-radar-chart";

/** Radar chart view — paste EvilCharts radar style variants here later. */
export function RadarChartView({
  categoryData,
  periodData,
  metric,
  subtitle,
}: ChartViewProps) {
  if (metric === "category" || categoryData.length > 0) {
    const radarData = categoryData.slice(0, 8).map((c) => ({
      category: c.category,
      spending: c.total,
    }));

    return (
      <ChartShell
        title="Category radar"
        subtitle={subtitle}
        filenameBase="funds-radar-category"
      >
        {radarData.length ? (
          <EChartsRadarChart
            data={radarData}
            config={{
              spending: {
                label: "Spending",
                colors: { light: ["#c45c26"], dark: ["#e07a45"] },
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
    <ChartShell title="Period radar" subtitle={subtitle} filenameBase="funds-radar-period">
      <EChartsRadarChart
        data={radarData}
        config={{
          income: {
            label: "Income",
            colors: { light: ["#2f6f5e"], dark: ["#7dcea0"] },
          },
          expense: {
            label: "Spending",
            colors: { light: ["#c45c26"], dark: ["#e07a45"] },
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
