import type { ColumnMapping } from "@funds/core";

export type BankPreset = {
  id: string;
  name: string;
  format: "csv" | "pdf";
  /** Exact or near-exact header names expected in exports */
  mapping: ColumnMapping;
  /** Alternate header labels accepted when auto-matching */
  aliases?: Partial<Record<keyof ColumnMapping, string[]>>;
  samplePath?: string;
  notes?: string;
};

export const BANK_PRESETS: BankPreset[] = [
  {
    id: "generic-amount",
    name: "Generic (Date / Description / Amount)",
    format: "csv",
    mapping: {
      date: "Date",
      description: "Description",
      amount: "Amount",
      balance: "Balance",
      category: "Category",
    },
    samplePath: "/samples/generic-amount.csv",
  },
  {
    id: "generic-debit-credit",
    name: "Generic (Date / Description / Debit / Credit)",
    format: "csv",
    mapping: {
      date: "Date",
      description: "Description",
      debit: "Debit",
      credit: "Credit",
      balance: "Balance",
    },
    samplePath: "/samples/generic-debit-credit.csv",
  },
  {
    id: "chase-csv",
    name: "Chase (CSV export)",
    format: "csv",
    mapping: {
      date: "Posting Date",
      description: "Description",
      amount: "Amount",
      balance: "Balance",
      category: "Type",
    },
    aliases: {
      date: ["Post Date", "Transaction Date", "Posting Date"],
      description: ["Description", "Memo"],
      amount: ["Amount"],
      balance: ["Balance", "Running Balance"],
      category: ["Type", "Category"],
    },
    samplePath: "/samples/chase.csv",
    notes: "Matches common Chase credit/debit CSV column names.",
  },
  {
    id: "hsbc-uk-csv",
    name: "HSBC UK (CSV export)",
    format: "csv",
    mapping: {
      date: "Date",
      description: "Description",
      amount: "Amount",
      balance: "Balance",
    },
    aliases: {
      date: ["Date", "Transaction date"],
      description: ["Description", "Payment type and details"],
      amount: ["Amount", "Paid out", "Paid in"],
      balance: ["Balance"],
    },
    samplePath: "/samples/hsbc-uk.csv",
    notes: "Signed Amount column (outflows negative).",
  },
  {
    id: "gtbank-csv",
    name: "GTBank (CSV export)",
    format: "csv",
    mapping: {
      date: "Trans Date",
      description: "Remarks",
      debit: "Debit",
      credit: "Credit",
      balance: "Balance",
    },
    aliases: {
      date: ["Trans Date", "Transaction Date", "Value Date"],
      description: ["Remarks", "Narration", "Description"],
      debit: ["Debit", "Withdrawal"],
      credit: ["Credit", "Deposit"],
      balance: ["Balance", "Closing Balance"],
    },
    samplePath: "/samples/gtbank.csv",
    notes: "Debit/Credit columns typical of Nigerian bank exports.",
  },
  {
    id: "generic-pdf",
    name: "Generic PDF (heuristic lines)",
    format: "pdf",
    mapping: {
      date: "Date",
      description: "Description",
      amount: "Amount",
    },
    notes:
      "Extracts lines shaped like: DATE DESCRIPTION AMOUNT. Bank-specific PDF adapters can replace this.",
  },
];

export function getPreset(id: string): BankPreset | undefined {
  return BANK_PRESETS.find((p) => p.id === id);
}

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Pick the best CSV preset whose required columns exist in the file headers
 * (using aliases when provided).
 */
export function matchPresetByHeaders(headers: string[]): BankPreset | null {
  const available = new Set(headers.map(normalizeHeader));
  let best: { preset: BankPreset; score: number } | null = null;

  for (const preset of BANK_PRESETS) {
    if (preset.format !== "csv") continue;
    const required: (keyof ColumnMapping)[] = ["date", "description"];
    if (preset.mapping.amount) required.push("amount");
    if (preset.mapping.debit || preset.mapping.credit) {
      required.push("debit", "credit");
    }

    let score = 0;
    let ok = true;
    for (const key of required) {
      const candidates = [
        preset.mapping[key],
        ...(preset.aliases?.[key] ?? []),
      ].filter(Boolean) as string[];
      const hit = candidates.some((c) => available.has(normalizeHeader(c)));
      if (!hit) {
        ok = false;
        break;
      }
      score += 1;
    }
    if (!ok) continue;
    if (!best || score > best.score) best = { preset, score };
  }

  return best?.preset ?? null;
}

/** Resolve a mapping against actual file headers using aliases. */
export function resolveMappingForHeaders(
  preset: BankPreset,
  headers: string[],
): ColumnMapping {
  const byNorm = new Map(
    headers.map((h) => [normalizeHeader(h), h] as const),
  );

  const pick = (key: keyof ColumnMapping): string | undefined => {
    const candidates = [
      preset.mapping[key],
      ...(preset.aliases?.[key] ?? []),
    ].filter(Boolean) as string[];
    for (const c of candidates) {
      const hit = byNorm.get(normalizeHeader(c));
      if (hit) return hit;
    }
    return undefined;
  };

  const date = pick("date");
  const description = pick("description");
  if (!date || !description) {
    return preset.mapping;
  }

  return {
    date,
    description,
    amount: pick("amount"),
    debit: pick("debit"),
    credit: pick("credit"),
    balance: pick("balance"),
    category: pick("category"),
  };
}
