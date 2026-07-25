import { ChartShell } from "@/components/charts/chart-shell";
import type { ChartViewProps } from "@/components/charts/types";
import { EChartsRadialChart } from "@/components/evilcharts/charts/echarts-radial-chart";

/** Radial chart view — paste EvilCharts radial style variants here later. */
export function RadialChartView({
  categoryData,
  categoryConfig,
  singleData,
  metric,
  subtitle,
}: ChartViewProps) {
  if (metric === "category" || categoryData.length) {
    return (
      <ChartShell
        title="Category radial"
        subtitle={subtitle}
        filenameBase="funds-radial-category"
      >
        {categoryData.length ? (
          <EChartsRadialChart
            data={categoryData}
            config={categoryConfig}
            nameKey="category"
            className="h-80 w-full"
          >
            <EChartsRadialChart.Legend />
            <EChartsRadialChart.Tooltip />
            <EChartsRadialChart.RadialBar dataKey="total" showBackground />
          </EChartsRadialChart>
        ) : (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No category spending in this period.
          </p>
        )}
      </ChartShell>
    );
  }

  const rows = singleData.map((r) => ({
    category: r.period,
    total: r.value,
  }));
  const config: Record<
    string,
    { label: string; colors: { light: string[]; dark: string[] } }
  > = {};
  rows.forEach((r, i) => {
    const colors = ["#2f6f5e", "#7dcea0", "#c45c26", "#5c7268"];
    const color = colors[i % colors.length]!;
    config[r.category] = {
      label: r.category,
      colors: { light: [color], dark: [color] },
    };
  });

  return (
    <ChartShell title="Period radial" subtitle={subtitle} filenameBase="funds-radial-period">
      <EChartsRadialChart
        data={rows}
        config={config}
        nameKey="category"
        className="h-80 w-full"
      >
        <EChartsRadialChart.Legend />
        <EChartsRadialChart.Tooltip />
        <EChartsRadialChart.RadialBar dataKey="total" showBackground />
      </EChartsRadialChart>
    </ChartShell>
  );
}
