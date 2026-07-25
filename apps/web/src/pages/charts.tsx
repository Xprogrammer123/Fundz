import {
  EChartsAreaChart,
  type ChartConfig,
} from "@/components/evilcharts/charts/echarts-area-chart";
import { EChartsBarChart } from "@/components/evilcharts/charts/echarts-bar-chart";
import { EChartsLineChart } from "@/components/evilcharts/charts/echarts-line-chart";
import { EChartsPieChart } from "@/components/evilcharts/charts/echarts-pie-chart";
import { useVault } from "@/db/vault";
import { cn, formatMoney } from "@/lib/utils";
import {
  aggregateByPeriod,
  categorySpendInRange,
  listMonthsForYear,
  listYears,
  summarize,
  type PeriodGrain,
} from "@funds/core";
import { useEffect, useMemo, useState } from "react";

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

type ChartType = "bar" | "line" | "area" | "pie";
type Metric = "expense" | "income" | "both" | "category";

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

  useEffect(() => {
    if (metric === "category" && chartType !== "pie" && chartType !== "bar") {
      setChartType("pie");
    }
  }, [metric, chartType]);

  const months = useMemo(
    () => (year !== "all" ? listMonthsForYear(transactions, year) : []),
    [transactions, year],
  );

  const filter = useMemo(
    () => ({
      year: year === "all" ? null : year,
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

  const periodChartData = useMemo(
    () =>
      buckets.map((b) => ({
        period: formatPeriodLabel(b.period, grain),
        income: b.income,
        expense: b.expense,
        net: b.net,
      })),
    [buckets, grain],
  );

  const singleSeriesData = useMemo(() => {
    const key = metric === "income" ? "income" : "expense";
    return periodChartData.map((row) => ({
      period: row.period,
      value: row[key],
    }));
  }, [periodChartData, metric]);

  const seriesConfig = useMemo((): ChartConfig => {
    if (metric === "both") {
      return {
        income: {
          label: "Income",
          colors: { light: ["#2f6f5e"], dark: ["#7dcea0"] },
        },
        expense: {
          label: "Spending",
          colors: { light: ["#c45c26"], dark: ["#e07a45"] },
        },
      };
    }
    return {
      value: {
        label: metric === "income" ? "Income" : "Spending",
        colors: {
          light: [metric === "income" ? "#2f6f5e" : "#c45c26"],
          dark: [metric === "income" ? "#7dcea0" : "#e07a45"],
        },
      },
    };
  }, [metric]);

  const categoryData = useMemo(
    () =>
      categories.map((c) => ({
        category: c.category,
        total: c.total,
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

  const availableChartTypes: ChartType[] =
    metric === "category" ? ["pie", "bar"] : ["bar", "line", "area", "pie"];

  if (!txCount) {
    return (
      <div className="space-y-3">
        <h1 className="font-display text-3xl">Charts</h1>
        <p className="rounded-3xl border border-border/70 bg-white/55 p-8 text-sm text-muted-foreground backdrop-blur">
          Import transactions to explore spending by day, month, or year.
        </p>
      </div>
    );
  }

  const rangeLabel = describeRange(year, month, grain);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Charts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose chart type, time scale, and period — all computed on your
          device.
        </p>
      </div>

      <section className="space-y-4 rounded-3xl border border-border/70 bg-white/55 p-4 backdrop-blur sm:p-5">
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
              disabled={metric === "category"}
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
              disabled={grain === "year" || year === "all"}
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
            {availableChartTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setChartType(type)}
                className={cn(
                  "rounded-xl px-3 py-1.5 text-sm font-medium capitalize transition-colors",
                  chartType === type
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-sand",
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="Spending"
          value={formatMoney(totals.expense, currency)}
          hint={rangeLabel}
        />
        <Stat
          label="Income"
          value={formatMoney(totals.income, currency)}
          hint={rangeLabel}
        />
        <Stat
          label="Net"
          value={formatMoney(totals.net, currency)}
          hint={`${totals.count} transactions`}
        />
      </section>

      <section className="rounded-3xl border border-border/70 bg-white/55 p-4 backdrop-blur sm:p-6">
        <h2 className="mb-1 font-display text-xl">
          {metric === "category"
            ? "Spending by category"
            : metric === "both"
              ? "Income vs spending"
              : metric === "income"
                ? "Income over time"
                : "Spending over time"}
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">{rangeLabel}</p>

        {metric === "category" ? (
          categoryData.length ? (
            chartType === "bar" ? (
              <EChartsBarChart
                data={categoryData}
                config={{
                  total: {
                    label: "Spending",
                    colors: { light: ["#c45c26"], dark: ["#e07a45"] },
                  },
                }}
                className="h-80 w-full"
                xDataKey="category"
              >
                <EChartsBarChart.Grid />
                <EChartsBarChart.XAxis dataKey="category" />
                <EChartsBarChart.YAxis />
                <EChartsBarChart.Tooltip />
                <EChartsBarChart.Bar dataKey="total" variant="gradient" />
              </EChartsBarChart>
            ) : (
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
            )
          ) : (
            <Empty />
          )
        ) : periodChartData.length ? (
          <PeriodChart
            chartType={chartType}
            metric={metric}
            data={periodChartData}
            single={singleSeriesData}
            config={seriesConfig}
          />
        ) : (
          <Empty />
        )}
      </section>

      {metric !== "category" && buckets.length > 0 ? (
        <section className="overflow-x-auto rounded-3xl border border-border/70 bg-white/55 backdrop-blur">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted/70 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">{grain === "day" ? "Day" : grain === "month" ? "Month" : "Year"}</th>
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
                  <td className="px-4 py-3 text-right text-moss">
                    {formatMoney(b.income, currency)}
                  </td>
                  <td className="px-4 py-3 text-right text-ember">
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

      {metric === "category" && categories.length > 0 ? (
        <section className="overflow-x-auto rounded-3xl border border-border/70 bg-white/55 backdrop-blur">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted/70 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Spending</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.category} className="border-t border-border/50">
                  <td className="px-4 py-3 font-medium">{c.category}</td>
                  <td className="px-4 py-3 text-right text-ember">
                    {formatMoney(c.total, currency)}
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

function PeriodChart({
  chartType,
  metric,
  data,
  single,
  config,
}: {
  chartType: ChartType;
  metric: Metric;
  data: Array<{ period: string; income: number; expense: number; net: number }>;
  single: Array<{ period: string; value: number }>;
  config: ChartConfig;
}) {
  if (chartType === "pie") {
    const pieRows =
      metric === "both"
        ? [
            { name: "Income", total: data.reduce((s, r) => s + r.income, 0) },
            { name: "Spending", total: data.reduce((s, r) => s + r.expense, 0) },
          ]
        : single.map((r) => ({ name: r.period, total: r.value }));

    const pieConfig: ChartConfig = {};
    pieRows.forEach((row, i) => {
      const color = PALETTE[i % PALETTE.length]!;
      pieConfig[row.name] = {
        label: row.name,
        colors: { light: [color], dark: [color] },
      };
    });

    return (
      <EChartsPieChart
        data={pieRows}
        config={pieConfig}
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

  if (metric === "both") {
    if (chartType === "line") {
      return (
        <EChartsLineChart
          data={data}
          config={config}
          className="h-80 w-full"
          xDataKey="period"
        >
          <EChartsLineChart.Grid />
          <EChartsLineChart.XAxis dataKey="period" />
          <EChartsLineChart.YAxis />
          <EChartsLineChart.Legend />
          <EChartsLineChart.Tooltip />
          <EChartsLineChart.Line dataKey="income" />
          <EChartsLineChart.Line dataKey="expense" />
        </EChartsLineChart>
      );
    }
    if (chartType === "area") {
      return (
        <EChartsAreaChart
          data={data}
          config={config}
          className="h-80 w-full"
          xDataKey="period"
        >
          <EChartsAreaChart.Grid />
          <EChartsAreaChart.XAxis dataKey="period" />
          <EChartsAreaChart.YAxis />
          <EChartsAreaChart.Legend />
          <EChartsAreaChart.Tooltip />
          <EChartsAreaChart.Area dataKey="income" variant="gradient" />
          <EChartsAreaChart.Area dataKey="expense" variant="gradient" />
        </EChartsAreaChart>
      );
    }
    return (
      <EChartsBarChart
        data={data}
        config={config}
        className="h-80 w-full"
        xDataKey="period"
      >
        <EChartsBarChart.Grid />
        <EChartsBarChart.XAxis dataKey="period" />
        <EChartsBarChart.YAxis />
        <EChartsBarChart.Legend />
        <EChartsBarChart.Tooltip />
        <EChartsBarChart.Bar dataKey="income" variant="gradient" />
        <EChartsBarChart.Bar dataKey="expense" variant="gradient" />
      </EChartsBarChart>
    );
  }

  if (chartType === "line") {
    return (
      <EChartsLineChart
        data={single}
        config={config}
        className="h-80 w-full"
        xDataKey="period"
      >
        <EChartsLineChart.Grid />
        <EChartsLineChart.XAxis dataKey="period" />
        <EChartsLineChart.YAxis />
        <EChartsLineChart.Tooltip />
        <EChartsLineChart.Line dataKey="value" />
      </EChartsLineChart>
    );
  }

  if (chartType === "area") {
    return (
      <EChartsAreaChart
        data={single}
        config={config}
        className="h-80 w-full"
        xDataKey="period"
      >
        <EChartsAreaChart.Grid />
        <EChartsAreaChart.XAxis dataKey="period" />
        <EChartsAreaChart.YAxis />
        <EChartsAreaChart.Tooltip />
        <EChartsAreaChart.Area dataKey="value" variant="gradient" />
      </EChartsAreaChart>
    );
  }

  return (
    <EChartsBarChart
      data={single}
      config={config}
      className="h-80 w-full"
      xDataKey="period"
    >
      <EChartsBarChart.Grid />
      <EChartsBarChart.XAxis dataKey="period" />
      <EChartsBarChart.YAxis />
      <EChartsBarChart.Tooltip />
      <EChartsBarChart.Bar dataKey="value" variant="gradient" />
    </EChartsBarChart>
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
    <div className="rounded-3xl border border-border/70 bg-white/55 px-5 py-4 backdrop-blur">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-display text-2xl text-ink">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function Empty() {
  return (
    <p className="py-12 text-center text-sm text-muted-foreground">
      No transactions in this period. Try another year or month.
    </p>
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
