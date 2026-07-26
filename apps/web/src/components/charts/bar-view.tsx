import { ChartShell } from "@/components/charts/chart-shell";
import type { ChartViewProps } from "@/components/charts/types";
import { EChartsBarChart } from "@/components/evilcharts/charts/echarts-bar-chart";
import { MONO } from "@/lib/mono";
import { formatAxisMoney } from "@/lib/utils";

/** Bar chart view — paste EvilCharts bar style variants here later. */
export function BarChartView({
  periodData,
  singleData,
  categoryData,
  metric,
  background = "black",
  currency = "USD",
  barColors,
}: ChartViewProps) {
  const primary = barColors?.primary ?? MONO.gray500;
  const secondary = barColors?.secondary ?? MONO.black;
  const axisMoney = (value: string) => formatAxisMoney(Number(value), currency);

  if (metric === "category") {
    return (
      <ChartShell title="Spending by category" background={background} filenameBase="funds-bar-category">
        <EChartsBarChart
          data={categoryData}
          config={{
            total: {
              label: "Spending",
              colors: { light: [primary], dark: [primary] },
            },
          }}
          className="h-80 w-full"
          xDataKey="category"
        >
          <EChartsBarChart.Grid />
          <EChartsBarChart.XAxis dataKey="category" />
          <EChartsBarChart.YAxis tickFormatter={axisMoney} />
          <EChartsBarChart.Tooltip />
          <EChartsBarChart.Bar dataKey="total" variant="gradient" />
        </EChartsBarChart>
      </ChartShell>
    );
  }

  if (metric === "both") {
    const config = {
      income: {
        label: "Income",
        colors: { light: [secondary], dark: [secondary] },
      },
      expense: {
        label: "Spending",
        colors: { light: [primary], dark: [primary] },
      },
    };
    return (
      <ChartShell title="Income vs spending" background={background} filenameBase="funds-bar-cashflow">
        <EChartsBarChart
          data={periodData}
          config={config}
          className="h-80 w-full"
          xDataKey="period"
        >
          <EChartsBarChart.Grid />
          <EChartsBarChart.XAxis dataKey="period" />
          <EChartsBarChart.YAxis tickFormatter={axisMoney} />
          <EChartsBarChart.Legend />
          <EChartsBarChart.Tooltip />
          <EChartsBarChart.Bar dataKey="income" variant="gradient" />
          <EChartsBarChart.Bar dataKey="expense" variant="gradient" />
        </EChartsBarChart>
      </ChartShell>
    );
  }

  const valueColor = metric === "income" ? secondary : primary;

  return (
    <ChartShell
      title={metric === "income" ? "Income over time" : "Spending over time"}
      background={background}
      filenameBase={`funds-bar-${metric}`}
    >
      <EChartsBarChart
        data={singleData}
        config={{
          value: {
            label: metric === "income" ? "Income" : "Spending",
            colors: { light: [valueColor], dark: [valueColor] },
          },
        }}
        className="h-80 w-full"
        xDataKey="period"
      >
        <EChartsBarChart.Grid />
        <EChartsBarChart.XAxis dataKey="period" />
        <EChartsBarChart.YAxis tickFormatter={axisMoney} />
        <EChartsBarChart.Tooltip />
        <EChartsBarChart.Bar dataKey="value" variant="gradient" />
      </EChartsBarChart>
    </ChartShell>
  );
}
