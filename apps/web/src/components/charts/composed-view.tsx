import { ChartShell } from "@/components/charts/chart-shell";
import type { ChartViewProps } from "@/components/charts/types";
import { EChartsComposedChart } from "@/components/evilcharts/charts/echarts-composed-chart";
import { seriesColors } from "@/lib/mono";

/** Composed chart view — paste EvilCharts composed style variants here later. */
export function ComposedChartView({
  periodData,
  seriesConfig,
  metric,
  background = "black",
}: ChartViewProps) {
  if (metric === "category") {
    return (
      <ChartShell title="Composed chart" background={background} filenameBase="funds-composed">
        <p className="py-12 text-center text-sm text-muted-foreground">
          Composed charts combine bars and lines over time. Switch to income vs spending.
        </p>
      </ChartShell>
    );
  }

  const config = {
    ...seriesConfig,
    net: {
      label: "Net",
      colors: seriesColors("net"),
    },
  };

  return (
    <ChartShell
      title="Cash flow composed"
      background={background}
      filenameBase="funds-composed-cashflow"
    >
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
    </ChartShell>
  );
}
