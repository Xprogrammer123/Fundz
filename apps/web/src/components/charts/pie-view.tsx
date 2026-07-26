import { ChartShell } from "@/components/charts/chart-shell";
import type { ChartViewProps } from "@/components/charts/types";
import { EChartsPieChart } from "@/components/evilcharts/charts/echarts-pie-chart";
import { CHART_PALETTE } from "@/lib/mono";

/** Pie chart view — paste EvilCharts pie style variants here later. */
export function PieChartView({
  periodData,
  singleData,
  categoryData,
  categoryConfig,
  metric,
  subtitle,
}: ChartViewProps) {
  if (metric === "category") {
    return (
      <ChartShell title="Spending by category" subtitle={subtitle} filenameBase="funds-pie-category">
        <EChartsPieChart
          data={categoryData}
          config={categoryConfig}
          className="h-80 w-full"
          dataKey="total"
          nameKey="category"
        >
          <EChartsPieChart.Legend isClickable />
          <EChartsPieChart.Tooltip />
          <EChartsPieChart.Pie isClickable />
        </EChartsPieChart>
      </ChartShell>
    );
  }

  const pieRows =
    metric === "both"
      ? [
          { name: "Income", total: periodData.reduce((s, r) => s + r.income, 0) },
          {
            name: "Spending",
            total: periodData.reduce((s, r) => s + r.expense, 0),
          },
        ]
      : singleData.map((r) => ({ name: r.period, total: r.value }));

  const config: Record<string, { label: string; colors: { light: string[]; dark: string[] } }> =
    {};
  pieRows.forEach((row, i) => {
    const color = CHART_PALETTE[i % CHART_PALETTE.length]!;
    config[row.name] = {
      label: row.name,
      colors: { light: [color], dark: [color] },
    };
  });

  return (
    <ChartShell
      title={metric === "both" ? "Income vs spending share" : "Share by period"}
      subtitle={subtitle}
      filenameBase={`funds-pie-${metric}`}
    >
      <EChartsPieChart
        data={pieRows}
        config={config}
        className="h-80 w-full"
        dataKey="total"
        nameKey="name"
      >
        <EChartsPieChart.Legend isClickable />
        <EChartsPieChart.Tooltip />
        <EChartsPieChart.Pie isClickable />
      </EChartsPieChart>
    </ChartShell>
  );
}
