import { ChartShell } from "@/components/charts/chart-shell";
import type { ChartViewProps, CategoryRow, PeriodRow } from "@/components/charts/types";
import {
  EChartsSankeyChart,
  type ChartConfig,
} from "@/components/evilcharts/charts/echarts-sankey-chart";
import { CHART_PALETTE } from "@/lib/mono";
import { cn, formatMoney } from "@/lib/utils";
import { useMemo } from "react";

type SankeyStyle = "default" | "allocation" | "pipeline";

type SankeyGraph = {
  nodes: { name: string }[];
  links: Array<{ source: number; target: number; value: number }>;
  config: ChartConfig;
};

const ALLOCATION_COLORS = {
  Income: { light: ["#0d9488"], dark: ["#2dd4bf"] },
  Spending: { light: ["#d97706"], dark: ["#fbbf24"] },
  "Net saved": { light: ["#7c3aed"], dark: ["#a78bfa"] },
};

const CATEGORY_ALLOC = [
  { light: ["#ea580c"], dark: ["#fb923c"] },
  { light: ["#b45309"], dark: ["#f59e0b"] },
  { light: ["#6d28d9"], dark: ["#8b5cf6"] },
  { light: ["#4f46e5"], dark: ["#818cf8"] },
  { light: ["#7c3aed"], dark: ["#a78bfa"] },
  { light: ["#c2410c"], dark: ["#fdba74"] },
];

const PIPE_SOURCE = [
  { light: ["#1d4ed8"], dark: ["#3b82f6"] },
  { light: ["#2563eb"], dark: ["#60a5fa"] },
  { light: ["#4338ca"], dark: ["#6366f1"] },
  { light: ["#4f46e5"], dark: ["#818cf8"] },
];

const PIPE_DEST = [
  { light: ["#be123c"], dark: ["#f43f5e"] },
  { light: ["#c2410c"], dark: ["#fb923c"] },
  { light: ["#9f1239"], dark: ["#fb7185"] },
  { light: ["#b91c1c"], dark: ["#ef4444"] },
];

export function SankeyChartView({
  categoryData,
  periodData,
  styleId = "default",
  background = "black",
  currency = "USD",
  barColors,
  remountKey,
}: ChartViewProps) {
  const style = (
    ["default", "allocation", "pipeline"].includes(styleId) ? styleId : "default"
  ) as SankeyStyle;

  const graph = useMemo(
    () =>
      style === "pipeline"
        ? buildPipelineGraph(periodData, categoryData, barColors)
        : buildFlowGraph(periodData, categoryData, style === "allocation", barColors),
    [categoryData, periodData, style, barColors],
  );

  const usable = graph.links.length > 0 && graph.nodes.length > 1;

  return (
    <ChartShell background={background} filenameBase={`funds-sankey-${style}`} remountKey={remountKey}>
      {!usable ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Need income and spending in this period to draw a flow chart.
        </p>
      ) : style === "allocation" ? (
        <AllocationStyle graph={graph} periodData={periodData} currency={currency} />
      ) : style === "pipeline" ? (
        <PipelineStyle graph={graph} currency={currency} />
      ) : (
        <DefaultStyle graph={graph} />
      )}
    </ChartShell>
  );
}

function DefaultStyle({ graph }: { graph: SankeyGraph }) {
  return (
    <EChartsSankeyChart data={graph} config={graph.config} className="h-96 w-full">
      <EChartsSankeyChart.Tooltip />
      <EChartsSankeyChart.Link variant="gradient" />
      <EChartsSankeyChart.Node isClickable radius={4}>
        <EChartsSankeyChart.NodeLabel />
      </EChartsSankeyChart.Node>
    </EChartsSankeyChart>
  );
}

/** Wide nodes, inside labels + value, footer stats. */
function AllocationStyle({
  graph,
  periodData,
  currency,
}: {
  graph: SankeyGraph;
  periodData: PeriodRow[];
  currency: string;
}) {
  const income = periodData.reduce((s, r) => s + r.income, 0);
  const expense = periodData.reduce((s, r) => s + r.expense, 0);
  const net = income - expense;
  const hedged = income > 0 ? Math.max(0, Math.round((net / income) * 100)) : 0;
  const positions = periodData.length;

  const stats = [
    { key: "positions", label: "Periods", value: String(positions) },
    { key: "aum", label: "Income in range", value: formatMoney(income, currency) },
    {
      key: "hedged",
      label: "Saved",
      value: `${hedged}%`,
    },
  ];

  return (
    <div className="flex w-full flex-col p-1">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-primary text-base font-medium tracking-tight sm:text-lg">
          Where the money flows
        </span>
        <span className="text-muted-foreground text-xs">Selected range</span>
      </div>

      <div className="mt-2 h-80 w-full sm:h-96">
        <EChartsSankeyChart
          data={graph}
          config={graph.config}
          className="h-full w-full"
          nodeWidth={92}
          nodePadding={12}
          linkCurvature={0.55}
        >
          <EChartsSankeyChart.Tooltip variant="frosted-glass" />
          <EChartsSankeyChart.Link variant="gradient" />
          <EChartsSankeyChart.Node radius={6}>
            <EChartsSankeyChart.NodeLabel
              position="inside"
              showValues
              valueFormatter={(value) => formatMoney(value, currency)}
            />
          </EChartsSankeyChart.Node>
        </EChartsSankeyChart>
      </div>

      <div className="mt-3 grid shrink-0 grid-cols-3 gap-4">
        {stats.map(({ key, label, value }, i) => (
          <div
            key={key}
            className={cn(
              "flex flex-col gap-0.5",
              i === 1 && "items-center text-center",
              i === stats.length - 1 && "items-end text-right",
            )}
          >
            <span className="text-muted-foreground truncate text-[10px] tracking-wide uppercase sm:text-[11px]">
              {label}
            </span>
            <span className="text-primary text-lg font-semibold tracking-tight sm:text-2xl">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Thin hub pipeline with center total overlay. */
function PipelineStyle({
  graph,
  currency,
}: {
  graph: SankeyGraph;
  currency: string;
}) {
  const hubIndex = graph.nodes.findIndex((n) => n.name === "Cashflow");
  const total = graph.links
    .filter((link) => link.target === hubIndex)
    .reduce((sum, link) => sum + link.value, 0);
  const sources = graph.links.filter((l) => l.target === hubIndex).length;
  const routes = graph.links.filter((l) => l.source === hubIndex).length;

  return (
    <div className="relative h-96 w-full p-1">
      <EChartsSankeyChart
        data={graph}
        config={graph.config}
        className="h-full w-full"
        nodeWidth={10}
        nodePadding={18}
        linkCurvature={0.55}
      >
        <EChartsSankeyChart.Tooltip variant="frosted-glass" />
        <EChartsSankeyChart.Link variant="gradient" />
        <EChartsSankeyChart.Node radius={5}>
          <EChartsSankeyChart.NodeLabel
            position="outside"
            showValues
            valueFormatter={(value) => formatMoney(value, currency)}
          />
        </EChartsSankeyChart.Node>
      </EChartsSankeyChart>

      <div className="pointer-events-none absolute inset-0 flex items-stretch justify-center">
        <div className="flex h-full flex-col items-center justify-center bg-[linear-gradient(to_right,transparent_0%,var(--background)_32%,var(--background)_68%,transparent_100%)] px-4 sm:px-10 md:px-14">
          <span className="text-muted-foreground text-[11px] sm:text-xs">Total booked</span>
          <span className="text-primary text-2xl leading-none font-semibold tracking-tight sm:text-4xl">
            {formatMoney(total, currency)}
          </span>
          <span className="text-muted-foreground mt-1 text-[11px] sm:text-xs">
            {sources} sources · {routes} routes
          </span>
        </div>
      </div>
    </div>
  );
}

/** Income → Spending / Net → categories (allocation palette optional). */
function buildFlowGraph(
  periodData: PeriodRow[],
  categoryData: CategoryRow[],
  allocation: boolean,
  barColors?: { primary: string; secondary: string },
): SankeyGraph {
  const income = periodData.reduce((s, r) => s + r.income, 0);
  const expense = periodData.reduce((s, r) => s + r.expense, 0);
  const cats = categoryData.slice(0, 8).filter((c) => c.total > 0);

  const nodes = [
    { name: "Income" },
    { name: "Spending" },
    ...(income > expense ? [{ name: "Net saved" }] : []),
    ...cats.map((c) => ({ name: c.category })),
  ];

  const index = (name: string) => nodes.findIndex((n) => n.name === name);
  const links: SankeyGraph["links"] = [];

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
    links.push({
      source: index("Spending"),
      target: index(c.category),
      value: c.total,
    });
  }

  const incomeInk = barColors?.secondary ?? (allocation ? ALLOCATION_COLORS.Income.dark[0]! : "#34d399");
  const expenseInk = barColors?.primary ?? (allocation ? ALLOCATION_COLORS.Spending.dark[0]! : "#38bdf8");

  const config: ChartConfig = {
    Income: {
      label: "Income",
      colors: { light: [incomeInk], dark: [incomeInk] },
    },
    Spending: {
      label: "Spending",
      colors: { light: [expenseInk], dark: [expenseInk] },
    },
    "Net saved": {
      label: "Net saved",
      colors: allocation
        ? ALLOCATION_COLORS["Net saved"]
        : { light: [incomeInk], dark: [incomeInk] },
    },
  };

  cats.forEach((c, i) => {
    if (allocation) {
      config[c.category] = {
        label: c.category,
        colors: CATEGORY_ALLOC[i % CATEGORY_ALLOC.length]!,
      };
    } else {
      const color = CHART_PALETTE[i % CHART_PALETTE.length]!;
      config[c.category] = {
        label: c.category,
        colors: { light: [color], dark: [color] },
      };
    }
  });

  return { nodes, links, config };
}

/**
 * Top income periods → Cashflow hub → top categories + reserve.
 * Falls back to a single Income source when periods are sparse.
 */
function buildPipelineGraph(
  periodData: PeriodRow[],
  categoryData: CategoryRow[],
  barColors?: { primary: string; secondary: string },
): SankeyGraph {
  const income = periodData.reduce((s, r) => s + r.income, 0);
  const expense = periodData.reduce((s, r) => s + r.expense, 0);
  const saved = Math.max(0, income - expense);

  const incomeSources = [...periodData]
    .filter((p) => p.income > 0)
    .sort((a, b) => b.income - a.income)
    .slice(0, 4);

  const sources =
    incomeSources.length >= 2
      ? incomeSources.map((p) => ({ name: p.period, value: p.income }))
      : income > 0
        ? [{ name: "Income", value: income }]
        : [];

  const cats = categoryData
    .filter((c) => c.total > 0)
    .slice(0, 4)
    .map((c) => ({ name: c.category, value: c.total }));

  const destinations = [
    ...cats,
    ...(saved > 0 ? [{ name: "Reserve", value: saved }] : []),
  ];

  if (!sources.length || !destinations.length) {
    return { nodes: [], links: [], config: {} };
  }

  const nodes = [
    ...sources.map((s) => ({ name: s.name })),
    { name: "Cashflow" },
    ...destinations.map((d) => ({ name: d.name })),
  ];

  const index = (name: string) => nodes.findIndex((n) => n.name === name);
  const links: SankeyGraph["links"] = [];

  for (const s of sources) {
    links.push({
      source: index(s.name),
      target: index("Cashflow"),
      value: Number(s.value.toFixed(2)),
    });
  }

  // Scale destinations to match hub inflow when category totals exceed income
  const destSum = destinations.reduce((s, d) => s + d.value, 0);
  const hubIn = sources.reduce((s, d) => s + d.value, 0);
  const scale = destSum > 0 ? hubIn / destSum : 1;

  for (const d of destinations) {
    links.push({
      source: index("Cashflow"),
      target: index(d.name),
      value: Number((d.value * scale).toFixed(2)),
    });
  }

  const config: ChartConfig = {
    Cashflow: {
      label: "",
      colors: { light: ["#6d28d9"], dark: ["#8b5cf6"] },
    },
  };

  sources.forEach((s, i) => {
    const color =
      i === 0 && barColors?.secondary
        ? barColors.secondary
        : PIPE_SOURCE[i % PIPE_SOURCE.length]!.dark[0]!;
    config[s.name] = {
      label: s.name,
      colors: { light: [color], dark: [color] },
    };
  });

  destinations.forEach((d, i) => {
    const color =
      i === 0 && barColors?.primary
        ? barColors.primary
        : PIPE_DEST[i % PIPE_DEST.length]!.dark[0]!;
    config[d.name] = {
      label: d.name,
      colors: { light: [color], dark: [color] },
    };
  });

  return { nodes, links, config };
}
