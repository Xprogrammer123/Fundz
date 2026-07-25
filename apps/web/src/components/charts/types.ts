import type { ChartConfig } from "@/components/evilcharts/ui/echarts-chart";

export type PeriodRow = {
  period: string;
  income: number;
  expense: number;
  net: number;
};

export type SingleSeriesRow = {
  period: string;
  value: number;
};

export type CategoryRow = {
  category: string;
  total: number;
};

export type ChartViewProps = {
  periodData: PeriodRow[];
  singleData: SingleSeriesRow[];
  categoryData: CategoryRow[];
  seriesConfig: ChartConfig;
  categoryConfig: ChartConfig;
  metric: "expense" | "income" | "both" | "category";
  subtitle: string;
};
