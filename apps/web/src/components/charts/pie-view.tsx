import { ChartShell } from "@/components/charts/chart-shell";
import type {
  CategoryRow,
  ChartViewProps,
  PeriodRow,
  SingleSeriesRow,
} from "@/components/charts/types";
import {
  EChartsPieChart,
  type ChartConfig,
} from "@/components/evilcharts/charts/echarts-pie-chart";
import { CHART_PALETTE } from "@/lib/mono";
import { cn, formatMoney } from "@/lib/utils";
import { useMemo, useState } from "react";

type PieStyle = "default" | "share" | "rings" | "mix" | "gauge";

const GRAY_SWATCHES = [
  "bg-[#ffffff]",
  "bg-[#dedede]",
  "bg-[#bebebe]",
  "bg-[#a0a0a0]",
  "bg-[#868686]",
  "bg-[#6f6f6f]",
  "bg-[#585858]",
  "bg-[#404040]",
];

const GRAY_COLORS = [
  "#ffffff",
  "#dedede",
  "#bebebe",
  "#a0a0a0",
  "#868686",
  "#6f6f6f",
  "#585858",
  "#404040",
];

const MIX_SWATCHES = [
  "bg-[#a78bfa]",
  "bg-[#818cf8]",
  "bg-[#38bdf8]",
  "bg-[#34d399]",
  "bg-[#fbbf24]",
  "bg-[#fb7185]",
  "bg-[#f472b6]",
  "bg-[#22d3ee]",
];

const MIX_COLORS = [
  { light: ["#7c3aed", "#a855f7"], dark: ["#a78bfa", "#c4b5fd"] },
  { light: ["#4f46e5", "#6366f1"], dark: ["#818cf8", "#a5b4fc"] },
  { light: ["#0284c7", "#0ea5e9"], dark: ["#38bdf8", "#7dd3fc"] },
  { light: ["#059669", "#10b981"], dark: ["#34d399", "#6ee7b7"] },
  { light: ["#d97706", "#f59e0b"], dark: ["#fbbf24", "#fcd34d"] },
  { light: ["#e11d48", "#f43f5e"], dark: ["#fb7185", "#fda4af"] },
  { light: ["#db2777", "#ec4899"], dark: ["#f472b6", "#f9a8d4"] },
  { light: ["#0891b2", "#06b6d4"], dark: ["#22d3ee", "#67e8f9"] },
];

export function PieChartView({
  periodData,
  singleData,
  categoryData,
  categoryConfig,
  metric,
  styleId = "default",
  background = "black",
  currency = "USD",
}: ChartViewProps) {
  const style = (
    ["default", "share", "rings", "mix", "gauge"].includes(styleId)
      ? styleId
      : "default"
  ) as PieStyle;

  const slices = useMemo(
    () => buildSlices(metric, periodData, singleData, categoryData),
    [metric, periodData, singleData, categoryData],
  );

  return (
    <ChartShell background={background} filenameBase={`funds-pie-${metric}-${style}`}>
      {style === "default" ? (
        <DefaultStyle
          metric={metric}
          periodData={periodData}
          singleData={singleData}
          categoryData={categoryData}
          categoryConfig={categoryConfig}
        />
      ) : null}
      {style === "share" ? (
        <ShareStyle slices={slices} currency={currency} />
      ) : null}
      {style === "rings" ? (
        <RingsStyle periodData={periodData} singleData={singleData} metric={metric} />
      ) : null}
      {style === "mix" ? (
        <MixStyle slices={slices} currency={currency} />
      ) : null}
      {style === "gauge" ? (
        <GaugeStyle periodData={periodData} singleData={singleData} metric={metric} />
      ) : null}
    </ChartShell>
  );
}

function DefaultStyle({
  metric,
  periodData,
  singleData,
  categoryData,
  categoryConfig,
}: {
  metric: ChartViewProps["metric"];
  periodData: PeriodRow[];
  singleData: SingleSeriesRow[];
  categoryData: CategoryRow[];
  categoryConfig: ChartConfig;
}) {
  if (metric === "category") {
    return (
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

  const config: ChartConfig = {};
  pieRows.forEach((row, i) => {
    const color = CHART_PALETTE[i % CHART_PALETTE.length]!;
    config[row.name] = {
      label: row.name,
      colors: { light: [color], dark: [color] },
    };
  });

  return (
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
  );
}

/** Donut with % labels, center total, clickable legend grid. */
function ShareStyle({
  slices,
  currency,
}: {
  slices: Slice[];
  currency: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const total = slices.reduce((s, r) => s + r.value, 0);

  const chartData = [...slices].reverse().map((s) => ({
    product: s.key,
    value: s.value,
    share: total > 0 ? `${Math.round((s.value / total) * 100)}%` : "0%",
  }));

  const config: ChartConfig = {};
  slices.forEach((s, i) => {
    const color = GRAY_COLORS[i % GRAY_COLORS.length]!;
    config[s.key] = {
      label: s.label,
      colors: { light: ["#0a0a0a"], dark: [color] },
    };
  });

  return (
    <div className="flex w-full flex-col p-1">
      <div className="relative h-72 w-full sm:h-80">
        <EChartsPieChart
          data={chartData}
          config={config}
          dataKey="value"
          nameKey="product"
          className="h-full w-full"
          selectedSector={selected}
          onSelectionChange={(selection) => setSelected(selection?.dataKey ?? null)}
        >
          <EChartsPieChart.Tooltip />
          <EChartsPieChart.Pie
            isClickable
            innerRadius="52%"
            outerRadius="94%"
            paddingAngle={3}
            startAngle={90}
            endAngle={-270}
          >
            <EChartsPieChart.Label dataKey="share" />
          </EChartsPieChart.Pie>
        </EChartsPieChart>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span className="text-primary text-xl font-semibold tracking-tight sm:text-3xl">
            {formatMoney(total, currency)}
          </span>
          <span className="text-muted-foreground text-[10px] sm:text-xs">Total</span>
        </div>
      </div>

      <div className="border-border mt-3 grid grid-flow-col grid-cols-2 grid-rows-3 gap-x-6 gap-y-1.5 border-t pt-3">
        {slices.slice(0, 6).map((s, i) => {
          const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
          return (
            <button
              key={s.key}
              type="button"
              aria-pressed={selected === s.key}
              onClick={() => setSelected((prev) => (prev === s.key ? null : s.key))}
              className={cn(
                "flex cursor-pointer items-center gap-2 text-left text-xs transition-opacity",
                selected !== null && selected !== s.key && "opacity-40",
              )}
            >
              <span
                className={cn(
                  "size-3 shrink-0 rounded-[3px]",
                  GRAY_SWATCHES[i % GRAY_SWATCHES.length],
                )}
              />
              <span className="text-primary truncate font-medium">{s.label}</span>
              <span className="text-muted-foreground shrink-0">
                {formatMoney(s.value, currency)}
              </span>
              <span className="text-muted-foreground/60 shrink-0">({pct}%)</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Dual progress rings from cashflow health. */
function RingsStyle({
  periodData,
  singleData,
  metric,
}: {
  periodData: PeriodRow[];
  singleData: SingleSeriesRow[];
  metric: ChartViewProps["metric"];
}) {
  const income = periodData.reduce((s, r) => s + r.income, 0);
  const expense = periodData.reduce((s, r) => s + r.expense, 0);
  const flow = income + expense;

  let spendPct = flow > 0 ? Math.round((expense / flow) * 100) : 0;
  let savePct =
    income > 0
      ? Math.round(Math.max(0, Math.min(100, ((income - expense) / income) * 100)))
      : 0;

  if (metric === "expense" || metric === "income") {
    const vals = singleData.map((r) => r.value);
    const max = Math.max(...vals, 1);
    const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    const latest = vals[vals.length - 1] ?? 0;
    spendPct = Math.round((avg / max) * 100);
    savePct = Math.round((latest / max) * 100);
  }

  const stats = [
    {
      id: "spend",
      value: spendPct,
      caption: "Share of cashflow going to spending.",
    },
    {
      id: "save",
      value: savePct,
      caption: "Income kept after spending in this range.",
    },
  ] as const;

  return (
    <div className="flex w-full flex-col p-1">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground text-[10px] tracking-wide uppercase">
            Cashflow pulse
          </span>
          <span className="text-primary text-base font-medium tracking-tight sm:text-xl">
            Where the money goes
          </span>
        </div>
      </div>

      <div className="mt-3 grid h-64 grid-cols-2 gap-4 sm:h-72">
        {stats.map(({ id, value, caption }) => (
          <ProgressRing key={id} id={id} value={value} caption={caption} />
        ))}
      </div>
    </div>
  );
}

function ProgressRing({
  id,
  value,
  caption,
}: {
  id: string;
  value: number;
  caption: string;
}) {
  const DOT_COUNT = 40;
  const SECTORS = DOT_COUNT * 2;
  const FILLED = { light: ["#E43861"], dark: ["#E43861"] };
  const TRACK = { light: ["#d4d4d4"], dark: ["#3f3f3f"] };
  const GAP = { light: ["transparent"], dark: ["transparent"] };
  const filled = Math.round((DOT_COUNT * value) / 100);

  const data = Array.from({ length: SECTORS }, (_, i) => ({
    dot: `${id}-${i}`,
    value: 1,
  }));

  const config: ChartConfig = Object.fromEntries(
    Array.from({ length: SECTORS }, (_, i) => {
      const colors = i % 2 ? GAP : i / 2 < filled ? FILLED : TRACK;
      return [`${id}-${i}`, { label: "", colors }];
    }),
  );

  return (
    <div className="relative min-h-0">
      <EChartsPieChart
        data={data}
        config={config}
        dataKey="value"
        nameKey="dot"
        className="h-full w-full"
      >
        <EChartsPieChart.Pie
          innerRadius="85%"
          outerRadius="92%"
          paddingAngle={0}
          cornerRadius={6}
          startAngle={90}
          endAngle={-270}
        />
      </EChartsPieChart>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 bg-[radial-gradient(circle_closest-side,rgba(255,255,255,0.05)_0_79%,transparent_79%)] px-[25%] text-center">
        <span className="text-primary text-2xl font-medium tracking-tight sm:text-4xl">
          {value}%
        </span>
        <span className="text-muted-foreground text-[10px] leading-snug text-balance sm:text-xs">
          {caption}
        </span>
      </div>
    </div>
  );
}

/** Donut + side legend list. */
function MixStyle({
  slices,
  currency,
}: {
  slices: Slice[];
  currency: string;
}) {
  const top = slices.slice(0, 8);
  const total = top.reduce((s, r) => s + r.value, 0);
  const count = top.length;

  const config: ChartConfig = {};
  top.forEach((s, i) => {
    config[s.key] = {
      label: s.label,
      colors: MIX_COLORS[i % MIX_COLORS.length],
    };
  });

  const chartData = top.map((s) => ({
    channel: s.key,
    label: s.label,
    value: s.value,
  }));

  return (
    <div className="flex w-full items-center gap-3 p-1 sm:gap-6">
      <div className="relative aspect-square w-[42%] max-w-72 shrink-0">
        <EChartsPieChart
          data={chartData}
          config={config}
          dataKey="value"
          nameKey="channel"
          className="h-full w-full"
        >
          <EChartsPieChart.Tooltip />
          <EChartsPieChart.Pie
            innerRadius="62%"
            outerRadius="92%"
            paddingAngle={6}
            cornerRadius={12}
            startAngle={90}
            endAngle={-270}
          />
        </EChartsPieChart>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="border-border flex aspect-square w-[56%] flex-col items-center justify-center rounded-full border border-dashed">
            <span className="text-primary text-lg font-semibold tracking-tight sm:text-2xl">
              {count}
            </span>
            <span className="text-muted-foreground mt-1 text-[10px] sm:text-xs">
              Segments
            </span>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center">
        {top.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2 py-1.5 sm:py-2">
            <span
              className={cn(
                "size-2.5 shrink-0 rounded-[3px]",
                MIX_SWATCHES[i % MIX_SWATCHES.length],
              )}
            />
            <span className="text-muted-foreground truncate text-xs">{s.label}</span>
            <span className="text-primary ml-auto text-xs font-semibold">
              {formatMoney(s.value, currency)}
            </span>
            <span className="text-muted-foreground/60 w-10 shrink-0 text-right text-[10px]">
              {total > 0 ? Math.round((s.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Semi-gauge health score from spend vs income. */
function GaugeStyle({
  periodData,
  singleData,
  metric,
}: {
  periodData: PeriodRow[];
  singleData: SingleSeriesRow[];
  metric: ChartViewProps["metric"];
}) {
  const income = periodData.reduce((s, r) => s + r.income, 0);
  const expense = periodData.reduce((s, r) => s + r.expense, 0);

  let score: number;
  if (metric === "both" || metric === "category") {
    // Higher score = healthier (more income relative to spending)
    score =
      income <= 0
        ? 200
        : Math.round(Math.max(0, Math.min(1000, (1 - expense / income) * 500 + 500)));
  } else {
    const vals = singleData.map((r) => r.value);
    const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    const max = Math.max(...vals, 1);
    score = Math.round((avg / max) * 1000);
  }

  const MAX = 1000;
  const START_ANGLE = 210;
  const chartData = [
    { band: "atrisk", label: "At risk", from: 0, value: 450, bar: "bg-[#fb7185]" },
    { band: "fair", label: "Fair", from: 450, value: 200, bar: "bg-[#fbbf24]" },
    { band: "good", label: "Good", from: 650, value: 170, bar: "bg-[#a3e635]" },
    {
      band: "excellent",
      label: "Excellent",
      from: 820,
      value: 180,
      bar: "bg-[#34d399]",
    },
  ];

  const chartConfig = {
    atrisk: { label: "At risk", colors: { light: ["#e11d48"], dark: ["#fb7185"] } },
    fair: { label: "Fair", colors: { light: ["#f59e0b"], dark: ["#fbbf24"] } },
    good: { label: "Good", colors: { light: ["#84cc16"], dark: ["#a3e635"] } },
    excellent: {
      label: "Excellent",
      colors: { light: ["#059669"], dark: ["#34d399"] },
    },
  } satisfies ChartConfig;

  const band =
    [...chartData].reverse().find(({ from }) => score >= from) ?? chartData[0]!;

  return (
    <div className="flex w-full flex-col p-1">
      <span className="text-primary text-base font-medium tracking-tight sm:text-lg">
        Cashflow health
      </span>

      <div className="relative mx-auto mt-1 aspect-square w-full max-w-[12.5rem] shrink-0">
        <EChartsPieChart
          data={[...chartData].reverse()}
          config={chartConfig}
          dataKey="value"
          nameKey="band"
          className="h-full w-full"
        >
          <EChartsPieChart.Pie
            innerRadius="74%"
            outerRadius="94%"
            paddingAngle={6}
            cornerRadius={10}
            startAngle={-30}
            endAngle={START_ANGLE}
          />
        </EChartsPieChart>

        <svg
          viewBox="0 0 100 100"
          className="text-muted-foreground/50 pointer-events-none absolute inset-0"
          aria-hidden
        >
          <path
            d="M 23.15 65.5 A 31 31 0 1 1 76.85 65.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeDasharray="0.1 5"
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="text-primary text-3xl font-semibold tracking-tight sm:text-4xl">
            {score}
          </span>
        </div>
      </div>

      <div className="-mt-4 text-center">
        <p className="text-primary text-xs font-medium sm:text-sm">
          Health is {band.label.toLowerCase()}
        </p>
        <p className="text-muted-foreground text-[10px] sm:text-xs">
          Based on income vs spending in this range
        </p>
      </div>

      <div className="mt-4 shrink-0 pt-2">
        <div className="text-muted-foreground flex text-[10px]">
          {chartData.map(({ band: b, from, value }) => (
            <span key={b} style={{ flexGrow: value, flexBasis: 0 }}>
              {from}
            </span>
          ))}
          <span>{MAX}</span>
        </div>
        <div className="mt-1 flex gap-1">
          {chartData.map(({ band: b, bar, value }) => (
            <span
              key={b}
              className={cn("h-1.5 rounded-full", bar)}
              style={{ flexGrow: value, flexBasis: 0 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

type Slice = { key: string; label: string; value: number };

function buildSlices(
  metric: ChartViewProps["metric"],
  periodData: PeriodRow[],
  singleData: SingleSeriesRow[],
  categoryData: CategoryRow[],
): Slice[] {
  if (metric === "category") {
    return categoryData.map((c) => ({
      key: slug(c.category),
      label: c.category,
      value: c.total,
    }));
  }

  if (metric === "both") {
    return [
      {
        key: "income",
        label: "Income",
        value: periodData.reduce((s, r) => s + r.income, 0),
      },
      {
        key: "expense",
        label: "Spending",
        value: periodData.reduce((s, r) => s + r.expense, 0),
      },
    ];
  }

  // Cap period slices so the pie stays readable
  const sorted = [...singleData].sort((a, b) => b.value - a.value);
  const top = sorted.slice(0, 8);
  const rest = sorted.slice(8).reduce((s, r) => s + r.value, 0);
  const slices = top.map((r) => ({
    key: slug(r.period),
    label: r.period,
    value: r.value,
  }));
  if (rest > 0) {
    slices.push({ key: "other", label: "Other", value: rest });
  }
  return slices;
}

function slug(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "slice";
}
