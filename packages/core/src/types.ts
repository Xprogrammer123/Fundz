export type Account = {
  id: string;
  name: string;
  bankId: string | null;
  currency: string;
  createdAt: string;
};

export type ImportRecord = {
  id: string;
  accountId: string;
  sourceFilename: string | null;
  format: "csv" | "pdf";
  importedAt: string;
  rowCount: number;
};

export type Transaction = {
  id: string;
  accountId: string;
  importId: string;
  date: string;
  description: string;
  amount: number;
  balance: number | null;
  category: string | null;
  rawJson: string | null;
};

export type NormalizedRow = {
  date: string;
  description: string;
  amount: number;
  balance?: number | null;
  category?: string | null;
};

export type ColumnMapping = {
  date: string;
  description: string;
  amount?: string;
  debit?: string;
  credit?: string;
  balance?: string;
  category?: string;
};

export type CsvPreview = {
  headers: string[];
  rows: Record<string, string>[];
  rawText: string;
};

export type MonthlyCashflow = {
  month: string;
  income: number;
  expense: number;
  net: number;
};

export type CategorySpend = {
  category: string;
  total: number;
};

export type BalancePoint = {
  date: string;
  balance: number;
};
