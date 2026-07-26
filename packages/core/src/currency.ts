/** Common ISO codes we accept from CSV headers, cells, or filenames. */
const KNOWN_CODES = [
  "USD",
  "GBP",
  "EUR",
  "NGN",
  "CAD",
  "AUD",
  "JPY",
  "INR",
  "ZAR",
  "KES",
  "GHS",
  "CHF",
  "CNY",
  "BRL",
  "MXN",
  "NZD",
  "SGD",
  "HKD",
  "AED",
  "PKR",
] as const;

const CODE_SET = new Set<string>(KNOWN_CODES);

const SYMBOL_TO_CODE: Array<{ symbol: string; code: string }> = [
  { symbol: "₦", code: "NGN" },
  { symbol: "£", code: "GBP" },
  { symbol: "€", code: "EUR" },
  { symbol: "₹", code: "INR" },
  { symbol: "₵", code: "GHS" },
  { symbol: "R$", code: "BRL" },
  { symbol: "¥", code: "JPY" },
  { symbol: "A$", code: "AUD" },
  { symbol: "C$", code: "CAD" },
  { symbol: "HK$", code: "HKD" },
  { symbol: "NZ$", code: "NZD" },
  { symbol: "$", code: "USD" },
];

const FILENAME_HINTS: Array<{ re: RegExp; code: string }> = [
  { re: /gtbank|gtb|nigeria|ngn/i, code: "NGN" },
  { re: /hsbc[-_]?uk|sterling|gbp/i, code: "GBP" },
  { re: /chase|wellsfargo|bankofamerica|bofa|usd/i, code: "USD" },
  { re: /euro|sepa|eur\b/i, code: "EUR" },
  { re: /rupee|inr/i, code: "INR" },
  { re: /cad|canada/i, code: "CAD" },
  { re: /aud|australia/i, code: "AUD" },
];

function normalizeCode(value: string): string | null {
  const code = value.trim().toUpperCase();
  return CODE_SET.has(code) ? code : null;
}

function findCodeInText(text: string): string | null {
  const re = /\b([A-Z]{3})\b/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const code = normalizeCode(match[1]!);
    if (code) return code;
  }
  return null;
}

function findSymbolInText(text: string): string | null {
  for (const { symbol, code } of SYMBOL_TO_CODE) {
    if (text.includes(symbol)) return code;
  }
  return null;
}

function currencyHeader(headers: string[]): string | null {
  for (const h of headers) {
    const n = h.trim().toLowerCase();
    if (n === "currency" || n === "curr" || n === "ccy" || n === "currency code") {
      return h;
    }
  }
  return null;
}

export type DetectCurrencyInput = {
  text?: string;
  headers?: string[];
  rows?: Record<string, string>[];
  filename?: string | null;
  /** Hint from a matched bank preset when the file has no currency markers. */
  presetCurrency?: string | null;
};

/**
 * Infer an ISO 4217 currency from CSV content, filename, or bank preset.
 * Preference: currency column → symbols/codes in cells → headers/body → filename → preset → USD.
 */
export function detectCurrency(input: DetectCurrencyInput): string {
  const { headers = [], rows = [], text = "", filename, presetCurrency } = input;

  const currCol = currencyHeader(headers);
  if (currCol) {
    for (const row of rows) {
      const code = normalizeCode(String(row[currCol] ?? ""));
      if (code) return code;
    }
  }

  const sampleCells: string[] = [];
  for (const row of rows.slice(0, 40)) {
    for (const v of Object.values(row)) {
      if (v) sampleCells.push(String(v));
    }
  }
  const cellBlob = sampleCells.join(" ");
  const fromSymbol = findSymbolInText(cellBlob);
  if (fromSymbol) return fromSymbol;
  const fromCells = findCodeInText(cellBlob);
  if (fromCells) return fromCells;

  const headerBlob = headers.join(" ");
  const fromHeaders = findCodeInText(headerBlob) ?? findSymbolInText(headerBlob);
  if (fromHeaders) return fromHeaders;

  const fromText = findCodeInText(text) ?? findSymbolInText(text.slice(0, 8000));
  if (fromText) return fromText;

  if (filename) {
    for (const hint of FILENAME_HINTS) {
      if (hint.re.test(filename)) return hint.code;
    }
    const fromName = findCodeInText(filename);
    if (fromName) return fromName;
  }

  const preset = presetCurrency ? normalizeCode(presetCurrency) : null;
  if (preset) return preset;

  return "USD";
}

export function isValidCurrencyCode(code: string): boolean {
  try {
    new Intl.NumberFormat(undefined, { style: "currency", currency: code }).format(1);
    return true;
  } catch {
    return false;
  }
}

export { KNOWN_CODES };
