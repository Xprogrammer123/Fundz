import { AreaChartView } from "@/components/charts/area-view";
import { BarChartView } from "@/components/charts/bar-view";
import { ChartsInspector } from "@/components/charts/charts-inspector";
import { ChartsSidebar } from "@/components/charts/charts-sidebar";
import { ComposedChartView } from "@/components/charts/composed-view";
import { LineChartView } from "@/components/charts/line-view";
import { PieChartView } from "@/components/charts/pie-view";
import { RadarChartView } from "@/components/charts/radar-view";
import { SankeyChartView } from "@/components/charts/sankey-view";
import {
  defaultStyleFor,
  type ChartBackgroundId,
  type ChartType,
} from "@/components/charts/studio";
import type { ChartViewProps } from "@/components/charts/types";
import type { ChartConfig } from "@/components/evilcharts/ui/echarts-chart";
import { useVault } from "@/db/vault";
import { CHART_PALETTE } from "@/lib/mono";
import { formatMoney } from "@/lib/utils";
import {
  aggregateByPeriod,
  categorySpendInRange,
  listMonthsForYear,
  listYears,
  summarize,
  type PeriodGrain,
} from "@funds/core";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import { Link } from "react-router-dom";

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

const VIEW_MAP: Record<ChartType, ComponentType<ChartViewProps>> = {
  bar: BarChartView,
  line: LineChartView,
  area: AreaChartView,
  pie: PieChartView,
  composed: ComposedChartView,
  radar: RadarChartView,
  sankey: SankeyChartView,
};

function inkPair(hex: string): { light: string[]; dark: string[] } {
  // Same ink in both themes so picker always wins regardless of background.
  return { light: [hex], dark: [hex] };
}

export function ChartsPage() {
  const { chartSession, account } = useVault();
  const transactions = chartSession?.transactions ?? [];
  const hasUpload = transactions.length > 0;
  const currency = chartSession?.currency ?? account?.currency ?? "USD";

  const years = useMemo(() => listYears(transactions), [transactions]);
  const [grain, setGrain] = useState<PeriodGrain>("year");
  const [chartType, setChartType] = useState<ChartType>("area");
  const [styleId, setStyleId] = useState(defaultStyleFor("area"));
  const [background, setBackground] = useState<ChartBackgroundId>("black");
  const [inkColors, setInkColors] = useState<{ primary: string; secondary: string }>({
    primary: "#38bdf8",
    secondary: "#34d399",
  });
  const [metric, setMetric] = useState<Metric>("expense");
  const [year, setYear] = useState<string>("all");
  const [month, setMonth] = useState<string>("all");
  const [yearReady, setYearReady] = useState(false);

  useEffect(() => {
    // New upload → show the full statement range, not a single demo-like year.
    setYear("all");
    setMonth("all");
    setGrain("year");
    setYearReady(true);
  }, [chartSession?.importId]);

  useEffect(() => {
    if (!yearReady && years.length) {
      setYear("all");
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
          colors: inkPair(inkColors.secondary),
        },
        expense: {
          label: "Spending",
          colors: inkPair(inkColors.primary),
        },
        net: {
          label: "Net",
          colors: inkPair(inkColors.secondary),
        },
        value: {
          label: "Value",
          colors: inkPair(inkColors.primary),
        },
      };
    }
    return {
      value: {
        label: metric === "income" ? "Income" : "Spending",
        colors: inkPair(
          metric === "income" ? inkColors.secondary : inkColors.primary,
        ),
      },
      income: {
        label: "Income",
        colors: inkPair(inkColors.secondary),
      },
      expense: {
        label: "Spending",
        colors: inkPair(inkColors.primary),
      },
    };
  }, [metric, chartType, inkColors]);

  const categoryData = useMemo(
    () => categories.map((c) => ({ category: c.category, total: c.total })),
    [categories],
  );

  const categoryConfig = useMemo(() => {
    const config: ChartConfig = {};
    categoryData.forEach((row, i) => {
      // Blend palette with user ink so categories stay distinct but tinted.
      const base =
        i === 0
          ? inkColors.primary
          : i === 1
            ? inkColors.secondary
            : CHART_PALETTE[i % CHART_PALETTE.length]!;
      config[row.category] = {
        label: row.category,
        colors: inkPair(base),
      };
    });
    return config;
  }, [categoryData, inkColors]);

  const remountKey = [
    chartType,
    styleId,
    background,
    inkColors.primary,
    inkColors.secondary,
    grain,
    year,
    month,
    metric,
    chartSession?.importId ?? "none",
  ].join("|");

  const View = VIEW_MAP[chartType];
  const viewProps: ChartViewProps = {
    periodData,
    singleData,
    categoryData,
    seriesConfig,
    categoryConfig,
    metric,
    styleId,
    background,
    currency,
    barColors: inkColors,
    remountKey,
  };

  function handleChartTypeChange(type: ChartType) {
    setChartType(type);
    setStyleId(defaultStyleFor(type));
  }

  if (!hasUpload) {
    return (
      <div className="flex min-h-[50vh] flex-col items-start justify-center gap-4">
        <p className="font-display text-3xl">Import a file to chart</p>
        <Link
          to="/import"
          className="text-sm text-ink-soft underline underline-offset-4"
        >
          Go to import
        </Link>
      </div>
    );
  }

  return (
    <>
      <ChartsSidebar
        chartType={chartType}
        onChartTypeChange={handleChartTypeChange}
      />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        <div className="min-w-0 flex-1 space-y-6">
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Show">
              <select
                value={metric}
                onChange={(e) => setMetric(e.target.value as Metric)}
                className="control"
              >
                <option value="expense">Spending</option>
                <option value="income">Income</option>
                <option value="both">Income vs spending</option>
                <option value="category">By category</option>
              </select>
            </Field>

            <Field label="Group">
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
          </section>

          <p className="text-sm leading-relaxed text-muted-foreground break-words">
            {totals.count.toLocaleString()} rows ·{" "}
            {formatMoney(totals.expense, currency)} spent ·{" "}
            {formatMoney(totals.income, currency)} in
            <span className="text-ink/45"> · {currency}</span>
            <span className="mt-1 block text-ink/45 sm:mt-0 sm:inline">
              {" "}
              · {periodData.length}{" "}
              {grain === "day" ? "days" : grain === "month" ? "months" : "years"}
            </span>
          </p>

          <View key={remountKey} {...viewProps} />
        </div>

        <ChartsInspector
          chartType={chartType}
          styleId={styleId}
          background={background}
          inkColors={inkColors}
          currency={currency}
          onStyleChange={setStyleId}
          onBackgroundChange={setBackground}
          onInkColorsChange={setInkColors}
        />
      </div>
    </>
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

function formatPeriodLabel(period: string, grain: PeriodGrain): string {
  if (grain === "year") return period;
  if (grain === "month") {
    const [y, m] = period.split("-");
    return `${MONTH_LABELS[m ?? ""] ?? m} ${y}`;
  }
  return period;
}
