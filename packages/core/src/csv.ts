import Papa from "papaparse";
import type { ColumnMapping, CsvPreview, NormalizedRow } from "./types.js";

export function parseCsvText(text: string, previewRows = 25): CsvPreview {
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (h) => h.trim(),
  });

  const headers = parsed.meta.fields?.filter(Boolean) ?? [];
  const rows = (parsed.data ?? []).filter((row) =>
    Object.values(row).some((v) => String(v ?? "").trim() !== ""),
  );

  return {
    headers,
    rows: rows.slice(0, previewRows),
    rawText: text,
  };
}

export async function readFileAsText(file: File): Promise<string> {
  return file.text();
}

function parseAmount(value: string | undefined): number | null {
  if (value == null) return null;
  const cleaned = String(value)
    .trim()
    .replace(/[, ]/g, "")
    .replace(/^\((.*)\)$/, "-$1")
    .replace(/[^0-9.+-]/g, "");
  if (!cleaned || cleaned === "-" || cleaned === "+" || cleaned === ".") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function parseDate(value: string | undefined): string | null {
  if (!value) return null;
  const raw = value.trim();
  if (!raw) return null;

  // Already ISO-like
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    return raw.slice(0, 10);
  }

  // DD/MM/YYYY or MM/DD/YYYY — prefer DD/MM when day > 12
  const slash = raw.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/);
  if (slash) {
    const a = Number(slash[1]);
    const b = Number(slash[2]);
    let year = Number(slash[3]);
    if (year < 100) year += 2000;
    let day: number;
    let month: number;
    if (a > 12) {
      day = a;
      month = b;
    } else if (b > 12) {
      month = a;
      day = b;
    } else {
      // Ambiguous: assume DD/MM (common outside US)
      day = a;
      month = b;
    }
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    return `${year.toString().padStart(4, "0")}-${month
      .toString()
      .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
  }

  // 02-Jan-2026 / 2 January 2026
  const named = raw.match(
    /^(\d{1,2})[-\s]([A-Za-z]{3,9})[-\s](\d{2,4})$/,
  );
  if (named) {
    const months: Record<string, number> = {
      jan: 1,
      january: 1,
      feb: 2,
      february: 2,
      mar: 3,
      march: 3,
      apr: 4,
      april: 4,
      may: 5,
      jun: 6,
      june: 6,
      jul: 7,
      july: 7,
      aug: 8,
      august: 8,
      sep: 9,
      sept: 9,
      september: 9,
      oct: 10,
      october: 10,
      nov: 11,
      november: 11,
      dec: 12,
      december: 12,
    };
    const month = months[named[2]!.toLowerCase()];
    let year = Number(named[3]);
    if (year < 100) year += 2000;
    const day = Number(named[1]);
    if (month && day >= 1 && day <= 31) {
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }

  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

export function guessMapping(headers: string[]): Partial<ColumnMapping> {
  const lower = headers.map((h) => ({ h, l: h.toLowerCase() }));
  const find = (...needles: string[]) =>
    lower.find(({ l }) => needles.some((n) => l.includes(n)))?.h;

  return {
    date: find("date", "posted", "transaction date", "value date"),
    description: find(
      "description",
      "details",
      "narrative",
      "memo",
      "particulars",
      "payee",
    ),
    amount: find("amount", "transaction amount", "value"),
    debit: find("debit", "withdrawal", "money out", "outflow"),
    credit: find("credit", "deposit", "money in", "inflow"),
    balance: find("balance", "running"),
    category: find("category", "type"),
  };
}

export function applyMapping(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
): NormalizedRow[] {
  const out: NormalizedRow[] = [];

  for (const row of rows) {
    const date = parseDate(row[mapping.date]);
    const description = String(row[mapping.description] ?? "").trim();
    if (!date || !description) continue;

    let amount: number | null = null;
    if (mapping.amount) {
      amount = parseAmount(row[mapping.amount]);
    } else if (mapping.debit || mapping.credit) {
      const debit = parseAmount(mapping.debit ? row[mapping.debit] : undefined) ?? 0;
      const credit = parseAmount(mapping.credit ? row[mapping.credit] : undefined) ?? 0;
      if (debit === 0 && credit === 0) continue;
      amount = credit - debit;
    }

    if (amount == null || !Number.isFinite(amount)) continue;

    const balance = mapping.balance
      ? parseAmount(row[mapping.balance])
      : null;
    const category = mapping.category
      ? String(row[mapping.category] ?? "").trim() || null
      : null;

    out.push({
      date,
      description,
      amount,
      balance,
      category,
    });
  }

  return out;
}

export function parseAndMapCsv(
  text: string,
  mapping: ColumnMapping,
): NormalizedRow[] {
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (h) => h.trim(),
  });
  const rows = (parsed.data ?? []).filter((row) =>
    Object.values(row).some((v) => String(v ?? "").trim() !== ""),
  );
  return applyMapping(rows, mapping);
}
