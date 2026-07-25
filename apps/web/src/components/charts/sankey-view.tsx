import { ChartShell } from "@/components/charts/chart-shell";
import type { ChartViewProps } from "@/components/charts/types";
import { EChartsSankeyChart } from "@/components/evilcharts/charts/echarts-sankey-chart";
import { useMemo } from "react";

/** Sankey chart view — paste EvilCharts sankey style variants here later. */
export function SankeyChartView({
  categoryData,
  periodData,
  subtitle,
}: ChartViewProps) {
  const { data, config } = useMemo(() => {
    const income = periodData.reduce((s, r) => s + r.income, 0);
    const expense = periodData.reduce((s, r) => s + r.expense, 0);
    const cats = categoryData.slice(0, 8);

    const nodes = [
      { name: "Income" },
      { name: "Spending" },
      ...(income > expense ? [{ name: "Net saved" }] : []),
      ...cats.map((c) => ({ name: c.category })),
    ];

    const index = (name: string) => nodes.findIndex((n) => n.name === name);
    const links: Array<{ source: number; target: number; value: number }> = [];

    if (income > 0 && expense > 0) {
      links.push({
        source: index("Income"),
        target: index("Spending"),
        value: Number(Math.min(income, expense).toFixed(2)),
      });
    }
    if (income > expense) {
      links.push({
        source: index("Income"),
        target: index("Net saved"),
        value: Number((income - expense).toFixed(2)),
      });
    }

    for (const c of cats) {
      if (c.total <= 0) continue;
      links.push({
        source: index("Spending"),
        target: index(c.category),
        value: c.total,
      });
    }

    const config: Record<
      string,
      { label: string; colors: { light: string[]; dark: string[] } }
    > = {
      Income: {
        label: "Income",
        colors: { light: ["#2f6f5e"], dark: ["#7dcea0"] },
      },
      Spending: {
        label: "Spending",
        colors: { light: ["#c45c26"], dark: ["#e07a45"] },
      },
      "Net saved": {
        label: "Net saved",
        colors: { light: ["#1a332b"], dark: ["#5c7268"] },
      },
    };
    const palette = ["#7dcea0", "#4a9b7f", "#d4a017", "#3d5a80", "#5c7268"];
    cats.forEach((c, i) => {
      const color = palette[i % palette.length]!;
      config[c.category] = {
        label: c.category,
        colors: { light: [color], dark: [color] },
      };
    });

    return { data: { nodes, links }, config };
  }, [categoryData, periodData]);

  const usable = data.links.length > 0 && data.nodes.length > 1;

  return (
    <ChartShell
      title="Money flow (sankey)"
      subtitle={subtitle}
      filenameBase="funds-sankey"
    >
      {usable ? (
        <EChartsSankeyChart data={data} config={config} className="h-96 w-full">
          <EChartsSankeyChart.Node isClickable />
          <EChartsSankeyChart.NodeLabel />
          <EChartsSankeyChart.Link />
          <EChartsSankeyChart.Tooltip />
        </EChartsSankeyChart>
      ) : (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Need income and category spending in this period to draw a flow chart.
        </p>
      )}
    </ChartShell>
  );
}
