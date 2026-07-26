import { AreaChartView } from "@/components/charts/area-view";
import { BarChartView } from "@/components/charts/bar-view";
import { ComposedChartView } from "@/components/charts/composed-view";
import { LineChartView } from "@/components/charts/line-view";
import { PieChartView } from "@/components/charts/pie-view";
import { RadarChartView } from "@/components/charts/radar-view";
import { RadialChartView } from "@/components/charts/radial-view";
import { SankeyChartView } from "@/components/charts/sankey-view";
import type { ChartViewProps } from "@/components/charts/types";
import type { ChartConfig } from "@/components/evilcharts/ui/echarts-chart";
import { useVault } from "@/db/vault";
import { CHART_PALETTE, seriesColors } from "@/lib/mono";
import { cn, formatMoney } from "@/lib/utils";
import {
  aggregateByPeriod,
  categorySpendInRange,
  listMonthsForYear,
  listYears,
  summarize,
  type PeriodGrain,
} from "@funds/core";
import { useEffect, useMemo, useState, type ComponentType } from "react";

type ChartType =
  | "bar"
  | "line"
  | "area"
  | "pie"
  | "composed"
  | "radar"
  | "radial"
  | "sankey";

type Metric = "expense" | "income" | "both" | "category";

const CHART_TYPES: { id: ChartType; label: string }[] = [
  { id: "bar", label: "Bar" },
  { id: "line", label: "Line" },
  { id: "area", label: "Area" },
  { id: "pie", label: "Pie" },
  { id: "composed", label: "Composed" },
  { id: "radar", label: "Radar" },
  { id: "radial", label: "Radial" },
  { id: "sankey", label: "Sankey" },
];

const MONTH_LABELS: Record<string, string> = {
  "01": "January",
  "02": "February",
  "03": "March",
  "04": "April",
  "05": "May",
  "06": "June",
  "07": "July",
  "08": "August",
  "09": "September",
  "10": "October",
  "11": "November",
  "12": "December",
};

const VIEW_MAP: Record<ChartType, ComponentType<ChartViewProps>> = {
  bar: BarChartView,
  line: LineChartView,
  area: AreaChartView,
  pie: PieChartView,
  composed: ComposedChartView,
  radar: RadarChartView,
  radial: RadialChartView,
  sankey: SankeyChartView,
};

export function ChartsPage() {
  const { transactions, txCount, account } = useVault();
  const currency = account?.currency ?? "USD";

  const years = useMemo(() => listYears(transactions), [transactions]);
  const [grain, setGrain] = useState<PeriodGrain>("month");
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [metric, setMetric] = useState<Metric>("expense");
  const [year, setYear] = useState<string>("");
  const [month, setMonth] = useState<string>("all");
  const [yearReady, setYearReady] = useState(false);

  useEffect(() => {
    if (!yearReady && years.length) {
      setYear(years[years.length - 1]!);
      setYearReady(true);
    } else if (!yearReady && !years.length) {
      setYear("all");
      setYearReady(true);
    }
  }, [years, yearReady]);

  useEffect(() => {
    if (grain === "year") setMonth("all");
  }, [grain]);

  const months = useMemo(
    () => (year !== "all" && year ? listMonthsForYear(transactions, year) : []),
    [transactions, year],
  );

  const filter = useMemo(
    () => ({
      year: !year || year === "all" ? null : year,
      month: month === "all" ? null : month,
    }),
    [year, month],
  );

  const buckets = useMemo(
    () => aggregateByPeriod(transactions, grain, filter),
    [transactions, grain, filter],
  );

  const categories = useMemo(
    () => categorySpendInRange(transactions, filter).slice(0, 12),
    [transactions, filter],
  );

  const totals = useMemo(
    () => summarize(transactions, filter),
    [transactions, filter],
  );

  const periodData = useMemo(
    () =>
      buckets.map((b) => ({
        period: formatPeriodLabel(b.period, grain),
        income: b.income,
        expense: b.expense,
        net: b.net,
      })),
    [buckets, grain],
  );

  const singleData = useMemo(() => {
    const key = metric === "income" ? "income" : "expense";
    return periodData.map((row) => ({
      period: row.period,
      value: row[key],
    }));
  }, [periodData, metric]);

  const seriesConfig = useMemo((): ChartConfig => {
    if (metric === "both" || chartType === "composed" || chartType === "sankey") {
      return {
        income: {
          label: "Income",
          colors: seriesColors("income"),
        },
        expense: {
          label: "Spending",
          colors: seriesColors("expense"),
        },
      };
    }
    return {
      value: {
        label: metric === "income" ? "Income" : "Spending",
        colors: seriesColors(metric === "income" ? "income" : "expense"),
      },
    };
  }, [metric, chartType]);

  const categoryData = useMemo(
    () => categories.map((c) => ({ category: c.category, total: c.total })),
    [categories],
  );

  const categoryConfig = useMemo(() => {
    const config: ChartConfig = {};
    categoryData.forEach((row, i) => {
      const color = CHART_PALETTE[i % CHART_PALETTE.length]!;
      config[row.category] = {
        label: row.category,
        colors: { light: [color], dark: [color] },
      };
    });
    return config;
  }, [categoryData]);

  const subtitle = describeRange(year || "all", month, grain);
  const View = VIEW_MAP[chartType];
  const viewProps: ChartViewProps = {
    periodData,
    singleData,
    categoryData,
    seriesConfig,
    categoryConfig,
    metric,
    subtitle,
  };

  if (!txCount) {
    return (
      <div className="space-y-3">
        <h1 className="font-display text-3xl">Charts</h1>
        <p className="panel p-8 text-sm text-muted-foreground">
          Import transactions to explore spending by day, month, or year — then
          export any chart as PNG/JPG.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Charts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick a chart style, filter the period, and export images locally.
        </p>
      </div>

      <section className="panel space-y-4 p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="What to show">
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value as Metric)}
              className="control"
            >
              <option value="expense">Spending</option>
              <option value="income">Income</option>
              <option value="both">Income vs spending</option>
              <option value="category">Spending by category</option>
            </select>
          </Field>

          <Field label="Group by">
            <select
              value={grain}
              onChange={(e) => setGrain(e.target.value as PeriodGrain)}
              className="control"
            >
              <option value="day">Day</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </Field>

          <Field label="Year">
            <select
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                setMonth("all");
              }}
              className="control"
            >
              <option value="all">All years</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Month">
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="control"
              disabled={grain === "year" || year === "all" || !year}
            >
              <option value="all">All months</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {MONTH_LABELS[m] ?? m}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Chart type
          </p>
          <div className="flex flex-wrap gap-2">
            {CHART_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setChartType(type.id)}
                className={cn(
                  "rounded-xl px-3 py-1.5 text-sm font-medium transition-colors",
                  chartType === type.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-sand",
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Area charts include four style variants (Layers, Compare, Benchmark,
            Spotlight). Other types live under{" "}
            <code className="text-ink">src/components/charts/</code>.
          </p>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="Spending"
          value={formatMoney(totals.expense, currency)}
          hint={subtitle}
        />
        <Stat
          label="Income"
          value={formatMoney(totals.income, currency)}
          hint={subtitle}
        />
        <Stat
          label="Net"
          value={formatMoney(totals.net, currency)}
          hint={`${totals.count} transactions`}
        />
      </section>

      <View {...viewProps} />

      {buckets.length > 0 ? (
        <section className="panel overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted/70 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">
                  {grain === "day" ? "Day" : grain === "month" ? "Month" : "Year"}
                </th>
                <th className="px-4 py-3 text-right">Income</th>
                <th className="px-4 py-3 text-right">Spending</th>
                <th className="px-4 py-3 text-right">Net</th>
              </tr>
            </thead>
            <tbody>
              {[...buckets].reverse().map((b) => (
                <tr key={b.period} className="border-t border-border/50">
                  <td className="px-4 py-3 font-medium">
                    {formatPeriodLabel(b.period, grain)}
                  </td>
                  <td className="px-4 py-3 text-right text-ink">
                    {formatMoney(b.income, currency)}
                  </td>
                  <td className="px-4 py-3 text-right text-ink-soft">
                    {formatMoney(b.expense, currency)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatMoney(b.net, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="panel px-5 py-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-display text-2xl text-ink">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function formatPeriodLabel(period: string, grain: PeriodGrain): string {
  if (grain === "year") return period;
  if (grain === "month") {
    const [y, m] = period.split("-");
    return `${MONTH_LABELS[m ?? ""] ?? m} ${y}`;
  }
  return period;
}

function describeRange(year: string, month: string, grain: PeriodGrain): string {
  if (year === "all") return `All time · grouped by ${grain}`;
  if (month === "all") return `${year} · grouped by ${grain}`;
  return `${MONTH_LABELS[month] ?? month} ${year} · grouped by ${grain}`;
}
