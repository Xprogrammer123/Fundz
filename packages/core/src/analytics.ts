import type { CategorySpend, Transaction } from "./types.js";

export type PeriodGrain = "day" | "month" | "year";

export type PeriodFilter = {
  year?: string | null; // "2026"
  month?: string | null; // "01".."12"
};

export type PeriodBucket = {
  period: string;
  income: number;
  expense: number;
  net: number;
};

function periodKey(date: string, grain: PeriodGrain): string {
  if (grain === "year") return date.slice(0, 4);
  if (grain === "month") return date.slice(0, 7);
  return date.slice(0, 10);
}

export function listYears(transactions: Transaction[]): string[] {
  const years = new Set<string>();
  for (const t of transactions) {
    if (t.date.length >= 4) years.add(t.date.slice(0, 4));
  }
  return [...years].sort();
}

export function listMonthsForYear(
  transactions: Transaction[],
  year: string,
): string[] {
  const months = new Set<string>();
  for (const t of transactions) {
    if (t.date.startsWith(`${year}-`) && t.date.length >= 7) {
      months.add(t.date.slice(5, 7));
    }
  }
  return [...months].sort();
}

export function filterTransactions(
  transactions: Transaction[],
  filter: PeriodFilter,
): Transaction[] {
  return transactions.filter((t) => {
    if (filter.year && !t.date.startsWith(filter.year)) return false;
    if (filter.month && filter.year) {
      return t.date.startsWith(`${filter.year}-${filter.month}`);
    }
    if (filter.month && !filter.year) {
      return t.date.slice(5, 7) === filter.month;
    }
    return true;
  });
}

export function aggregateByPeriod(
  transactions: Transaction[],
  grain: PeriodGrain,
  filter: PeriodFilter = {},
): PeriodBucket[] {
  const filtered = filterTransactions(transactions, filter);
  const map = new Map<string, PeriodBucket>();

  for (const t of filtered) {
    const period = periodKey(t.date, grain);
    const bucket = map.get(period) ?? {
      period,
      income: 0,
      expense: 0,
      net: 0,
    };
    if (t.amount > 0) bucket.income += t.amount;
    else if (t.amount < 0) bucket.expense += -t.amount;
    bucket.net = bucket.income - bucket.expense;
    map.set(period, bucket);
  }

  return [...map.values()]
    .sort((a, b) => a.period.localeCompare(b.period))
    .map((b) => ({
      period: b.period,
      income: Number(b.income.toFixed(2)),
      expense: Number(b.expense.toFixed(2)),
      net: Number(b.net.toFixed(2)),
    }));
}

export function categorySpendInRange(
  transactions: Transaction[],
  filter: PeriodFilter = {},
): CategorySpend[] {
  const filtered = filterTransactions(transactions, filter);
  const map = new Map<string, number>();

  for (const t of filtered) {
    if (t.amount >= 0) continue;
    const category = t.category?.trim() || "Uncategorized";
    map.set(category, (map.get(category) ?? 0) + -t.amount);
  }

  return [...map.entries()]
    .map(([category, total]) => ({
      category,
      total: Number(total.toFixed(2)),
    }))
    .sort((a, b) => b.total - a.total);
}

export function summarize(transactions: Transaction[], filter: PeriodFilter = {}) {
  const filtered = filterTransactions(transactions, filter);
  let income = 0;
  let expense = 0;
  for (const t of filtered) {
    if (t.amount > 0) income += t.amount;
    else if (t.amount < 0) expense += -t.amount;
  }
  return {
    income: Number(income.toFixed(2)),
    expense: Number(expense.toFixed(2)),
    net: Number((income - expense).toFixed(2)),
    count: filtered.length,
  };
}
