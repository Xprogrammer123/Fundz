import {
  EChartsAreaChart,
  type ChartConfig,
} from "@/components/evilcharts/charts/echarts-area-chart";
import { EChartsBarChart } from "@/components/evilcharts/charts/echarts-bar-chart";
import { EChartsPieChart } from "@/components/evilcharts/charts/echarts-pie-chart";
import { useVault } from "@/db/vault";
import { useMemo } from "react";

const PALETTE = [
  "#2f6f5e",
  "#7dcea0",
  "#c45c26",
  "#1a332b",
  "#5c7268",
  "#4a9b7f",
  "#d4a017",
  "#3d5a80",
];

export function ChartsPage() {
  const { balances, cashflow, categories, txCount } = useVault();

  const balanceData = useMemo(
    () =>
      balances.map((b) => ({
        date: b.date,
        balance: Number(b.balance.toFixed(2)),
      })),
    [balances],
  );

  const balanceConfig = {
    balance: {
      label: "Balance",
      colors: { light: ["#2f6f5e"], dark: ["#7dcea0"] },
    },
  } satisfies ChartConfig;

  const cashflowData = useMemo(
    () =>
      cashflow.map((c) => ({
        month: c.month,
        income: Number(c.income.toFixed(2)),
        expense: Number(c.expense.toFixed(2)),
      })),
    [cashflow],
  );

  const cashflowConfig = {
    income: {
      label: "Income",
      colors: { light: ["#2f6f5e"], dark: ["#7dcea0"] },
    },
    expense: {
      label: "Expense",
      colors: { light: ["#c45c26"], dark: ["#e07a45"] },
    },
  } satisfies ChartConfig;

  const categoryData = useMemo(
    () =>
      categories.slice(0, 8).map((c) => ({
        category: c.category,
        total: Number(c.total.toFixed(2)),
      })),
    [categories],
  );

  const categoryConfig = useMemo(() => {
    const config: ChartConfig = {};
    categoryData.forEach((row, i) => {
      const color = PALETTE[i % PALETTE.length]!;
      config[row.category] = {
        label: row.category,
        colors: { light: [color], dark: [color] },
      };
    });
    return config;
  }, [categoryData]);

  if (!txCount) {
    return (
      <div className="space-y-3">
        <h1 className="font-display text-3xl">Charts</h1>
        <p className="rounded-3xl border border-border/70 bg-white/55 p-8 text-sm text-muted-foreground backdrop-blur">
          Import transactions to see balance, cashflow, and category charts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Charts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Powered by EvilCharts (Apache ECharts) — rendered entirely in your
          browser.
        </p>
      </div>

      <ChartPanel title="Balance over time">
        {balanceData.length ? (
          <EChartsAreaChart
            data={balanceData}
            config={balanceConfig}
            className="h-72 w-full"
            xDataKey="date"
          >
            <EChartsAreaChart.Grid />
            <EChartsAreaChart.XAxis dataKey="date" />
            <EChartsAreaChart.YAxis />
            <EChartsAreaChart.Tooltip />
            <EChartsAreaChart.Area dataKey="balance" variant="gradient" />
          </EChartsAreaChart>
        ) : (
          <Empty />
        )}
      </ChartPanel>

      <ChartPanel title="Monthly cash flow">
        {cashflowData.length ? (
          <EChartsBarChart
            data={cashflowData}
            config={cashflowConfig}
            className="h-72 w-full"
            xDataKey="month"
          >
            <EChartsBarChart.Grid />
            <EChartsBarChart.XAxis dataKey="month" />
            <EChartsBarChart.YAxis />
            <EChartsBarChart.Legend />
            <EChartsBarChart.Tooltip />
            <EChartsBarChart.Bar dataKey="income" variant="gradient" />
            <EChartsBarChart.Bar dataKey="expense" variant="gradient" />
          </EChartsBarChart>
        ) : (
          <Empty />
        )}
      </ChartPanel>

      <ChartPanel title="Spending by category">
        {categoryData.length ? (
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
        ) : (
          <Empty />
        )}
      </ChartPanel>
    </div>
  );
}

function ChartPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-border/70 bg-white/55 p-4 backdrop-blur sm:p-6">
      <h2 className="mb-3 font-display text-xl">{title}</h2>
      {children}
    </section>
  );
}

function Empty() {
  return (
    <p className="py-12 text-center text-sm text-muted-foreground">
      Not enough data for this chart yet.
    </p>
  );
}
