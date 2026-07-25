import type { NormalizedRow } from "./types.js";

export type PdfExtractResult = {
  text: string;
  pages: number;
};

/** Minimal pdf.js surface used by extractPdfText (avoids hard dependency). */
export type PdfJsLike = {
  getDocument: (src: { data: ArrayBuffer }) => {
    promise: Promise<{
      numPages: number;
      getPage: (n: number) => Promise<{
        getTextContent: () => Promise<{
          items: Array<Record<string, unknown>>;
        }>;
      }>;
    }>;
  };
};

/**
 * Extract plain text from a PDF in the browser using pdf.js.
 * Caller supplies pdfjs to keep @funds/core free of bundler coupling.
 */
export async function extractPdfText(
  data: ArrayBuffer,
  pdfjs: PdfJsLike,
): Promise<PdfExtractResult> {
  const doc = await pdfjs.getDocument({ data }).promise;
  const chunks: string[] = [];
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const line = content.items
      .map((item) => (typeof item.str === "string" ? item.str : ""))
      .join(" ");
    chunks.push(line);
  }
  return { text: chunks.join("\n"), pages: doc.numPages };
}

/**
 * Heuristic PDF row parser for simple text statements:
 * lines containing a date + description + amount.
 * Bank-specific adapters can replace this once real samples exist.
 */
export function parsePdfTransactionsHeuristic(text: string): NormalizedRow[] {
  const rows: NormalizedRow[] = [];
  const lineRe =
    /(\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\s+(.+?)\s+(-?[\d,]+(?:\.\d{2})?)\s*$/;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/\s+/g, " ").trim();
    if (!line) continue;
    const match = line.match(lineRe);
    if (!match) continue;
    const date = normalizePdfDate(match[1]!);
    const description = match[2]!.trim();
    const amount = Number(match[3]!.replace(/,/g, ""));
    if (!date || !description || !Number.isFinite(amount)) continue;
    rows.push({ date, description, amount });
  }
  return rows;
}

function normalizePdfDate(value: string): string | null {
  const iso = value.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (iso) {
    return `${iso[1]}-${iso[2]!.padStart(2, "0")}-${iso[3]!.padStart(2, "0")}`;
  }
  const dmy = value.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})$/);
  if (!dmy) return null;
  let year = Number(dmy[3]);
  if (year < 100) year += 2000;
  const day = Number(dmy[1]);
  const month = Number(dmy[2]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
