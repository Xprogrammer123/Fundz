import {
  BANK_PRESETS,
  matchPresetByHeaders,
  resolveMappingForHeaders,
} from "@funds/banks";
import {
  applyMapping,
  guessMapping,
  parseCsvText,
} from "@funds/core/csv";
import { downloadBlob, transactionsToExcelBlob } from "@funds/core/excel";
import type { ColumnMapping, NormalizedRow, Transaction } from "@funds/core/types";

const STORAGE_KEY = "funds.extension.transactions";

const fileInput = document.getElementById("file") as HTMLInputElement;
const statusEl = document.getElementById("status") as HTMLParagraphElement;
const exportBtn = document.getElementById("export") as HTMLButtonElement;
const wipeBtn = document.getElementById("wipe") as HTMLButtonElement;

function setStatus(message: string, isError = false): void {
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#a3a3a3" : "#ffffff";
}

async function loadStored(): Promise<NormalizedRow[]> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  const rows = result[STORAGE_KEY];
  return Array.isArray(rows) ? (rows as NormalizedRow[]) : [];
}

async function saveStored(rows: NormalizedRow[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: rows });
}

function toMapping(partial: Partial<ColumnMapping>): ColumnMapping | null {
  if (!partial.date || !partial.description) return null;
  if (!partial.amount && !(partial.debit || partial.credit)) return null;
  return {
    date: partial.date,
    description: partial.description,
    amount: partial.amount,
    debit: partial.debit,
    credit: partial.credit,
    balance: partial.balance,
    category: partial.category,
  };
}

async function refreshExportState(): Promise<void> {
  const rows = await loadStored();
  exportBtn.disabled = rows.length === 0;
  if (rows.length) {
    setStatus(`${rows.length} transactions stored locally in this extension.`);
  }
}

fileInput.addEventListener("change", async () => {
  const file = fileInput.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const preview = parseCsvText(text, Number.MAX_SAFE_INTEGER);
    const matched = matchPresetByHeaders(preview.headers);
    const mapping = toMapping(
      matched
        ? resolveMappingForHeaders(matched, preview.headers)
        : guessMapping(preview.headers),
    );

    if (!mapping) {
      setStatus("Could not detect required CSV columns.", true);
      return;
    }

    const rows = applyMapping(preview.rows, mapping);
    if (!rows.length) {
      setStatus("No valid rows found in this CSV.", true);
      return;
    }

    const existing = await loadStored();
    const merged = [...existing, ...rows];
    await saveStored(merged);
    setStatus(
      `Imported ${rows.length} rows${
        matched ? ` via ${matched.name}` : ` (generic · ${BANK_PRESETS[0]?.name})`
      }. Total: ${merged.length}.`,
    );
    exportBtn.disabled = false;
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Import failed", true);
  } finally {
    fileInput.value = "";
  }
});

exportBtn.addEventListener("click", async () => {
  const rows = await loadStored();
  if (!rows.length) return;

  const asTransactions: Transaction[] = rows.map((row, index) => ({
    id: `ext_${index}`,
    accountId: "extension",
    importId: "extension",
    date: row.date,
    description: row.description,
    amount: row.amount,
    balance: row.balance ?? null,
    category: row.category ?? null,
    rawJson: null,
  }));

  const blob = transactionsToExcelBlob(asTransactions);
  downloadBlob(
    blob,
    `funds-extension-${new Date().toISOString().slice(0, 10)}.xlsx`,
  );
  setStatus(`Exported ${rows.length} rows to Excel.`);
});

wipeBtn.addEventListener("click", async () => {
  await chrome.storage.local.remove(STORAGE_KEY);
  exportBtn.disabled = true;
  setStatus("Local extension data wiped.");
});

void refreshExportState();
