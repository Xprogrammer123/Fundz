import { ChartShell } from "@/components/charts/chart-shell";
import type { ChartViewProps } from "@/components/charts/types";
import { EChartsRadarChart } from "@/components/evilcharts/charts/echarts-radar-chart";

/** Radar chart view — categories or recent periods from the imported CSV. */
export function RadarChartView({
  categoryData,
  periodData,
  metric,
  background = "black",
  seriesConfig,
  barColors,
  remountKey,
}: ChartViewProps) {
  const spendingColor = barColors?.primary ?? "#38bdf8";
  const incomeColor = barColors?.secondary ?? "#34d399";

  if (metric === "category" || categoryData.length > 0) {
    const radarData = categoryData.slice(0, 8).map((c) => ({
      category: c.category,
      spending: c.total,
    }));

    return (
      <ChartShell
        background={background}
        filenameBase="funds-radar-category"
        remountKey={remountKey}
      >
        {radarData.length ? (
          <EChartsRadarChart
            data={radarData}
            config={{
              spending: {
                label: "Spending",
                colors: {
                  light: [spendingColor],
                  dark: [spendingColor],
                },
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

  const radarData = periodData.slice(-8).map((p) => ({
    period: p.period,
    income: p.income,
    expense: p.expense,
  }));

  return (
    <ChartShell
      background={background}
      filenameBase="funds-radar-period"
      remountKey={remountKey}
    >
      <EChartsRadarChart
        data={radarData}
        config={{
          income: seriesConfig.income ?? {
            label: "Income",
            colors: { light: [incomeColor], dark: [incomeColor] },
          },
          expense: seriesConfig.expense ?? {
            label: "Spending",
            colors: { light: [spendingColor], dark: [spendingColor] },
          },
        }}
        className="h-80 w-full"
      >
        <EChartsRadarChart.PolarGrid />
        <EChartsRadarChart.PolarAngleAxis dataKey="period" />
        <EChartsRadarChart.Tooltip />
        <EChartsRadarChart.Radar dataKey="income" />
        <EChartsRadarChart.Radar dataKey="expense" />
      </EChartsRadarChart>
    </ChartShell>
  );
}
