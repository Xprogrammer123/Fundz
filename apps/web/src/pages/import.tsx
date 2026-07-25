import { Button } from "@/components/ui/button";
import { useVault } from "@/db/vault";
import {
  BANK_PRESETS,
  matchPresetByHeaders,
  resolveMappingForHeaders,
} from "@funds/banks";
import {
  applyMapping,
  extractPdfText,
  guessMapping,
  parseCsvText,
  parsePdfTransactionsHeuristic,
  type ColumnMapping,
  type CsvPreview,
  type NormalizedRow,
} from "@funds/core";
import * as pdfjs from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { useMemo, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const FIELD_KEYS = [
  "date",
  "description",
  "amount",
  "debit",
  "credit",
  "balance",
  "category",
] as const;

export function ImportPage() {
  const { importRows } = useVault();
  const navigate = useNavigate();
  const [filename, setFilename] = useState<string | null>(null);
  const [preview, setPreview] = useState<CsvPreview | null>(null);
  const [pdfRows, setPdfRows] = useState<NormalizedRow[] | null>(null);
  const [mapping, setMapping] = useState<Partial<ColumnMapping>>({});
  const [detectedPreset, setDetectedPreset] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const mappedCount = useMemo(() => {
    if (pdfRows) return pdfRows.length;
    if (!preview || !mapping.date || !mapping.description) return 0;
    if (!mapping.amount && !(mapping.debit || mapping.credit)) return 0;
    return applyMapping(preview.rows, mapping as ColumnMapping).length;
  }, [preview, mapping, pdfRows]);

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setMessage(null);
    setPdfRows(null);
    setDetectedPreset(null);
    setFilename(file.name);

    const lower = file.name.toLowerCase();
    if (lower.endsWith(".pdf") || file.type === "application/pdf") {
      try {
        const buffer = await file.arrayBuffer();
        const extracted = await extractPdfText(buffer, pdfjs);
        const rows = parsePdfTransactionsHeuristic(extracted.text);
        setPreview(null);
        setPdfRows(rows);
        setDetectedPreset("generic-pdf");
        if (!rows.length) {
          setError(
            "No transaction-like lines found in this PDF. Try a CSV export, or a text-based statement.",
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "PDF parse failed");
      }
      return;
    }

    const text = await file.text();
    const next = parseCsvText(text, 40);
    setPreview(next);
    const matched = matchPresetByHeaders(next.headers);
    if (matched) {
      setDetectedPreset(matched.id);
      setMapping(resolveMappingForHeaders(matched, next.headers));
    } else {
      setMapping(guessMapping(next.headers));
    }
  }

  function applyPreset(id: string) {
    const preset = BANK_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setDetectedPreset(id);
    if (preset.format === "pdf") {
      setMessage("PDF mode uses heuristic line parsing after you upload a PDF.");
      return;
    }
    if (!preview) return;
    setMapping(resolveMappingForHeaders(preset, preview.headers));
  }

  async function onCommit() {
    setBusy(true);
    setError(null);
    try {
      let rows: NormalizedRow[] = [];
      let format: "csv" | "pdf" = "csv";
      if (pdfRows) {
        rows = pdfRows;
        format = "pdf";
      } else {
        if (!preview || !mapping.date || !mapping.description) return;
        if (!mapping.amount && !(mapping.debit || mapping.credit)) {
          setError("Map either Amount, or Debit + Credit.");
          return;
        }
        const full = parseCsvText(preview.rawText, Number.MAX_SAFE_INTEGER);
        rows = applyMapping(full.rows, mapping as ColumnMapping);
      }

      if (!rows.length) {
        setError("No valid rows after mapping. Check date/amount columns.");
        return;
      }
      const count = await importRows(filename, rows, format);
      setMessage(`Imported ${count} transactions. Opening transactions…`);
      setPreview(null);
      setPdfRows(null);
      setFilename(null);
      window.setTimeout(() => {
        navigate("/transactions", {
          replace: false,
          state: { importedCount: count },
        });
      }, 450);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Import</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Drop a CSV or PDF bank export. Mapping runs locally; the file never
          leaves this device.
        </p>
      </div>

      <label className="panel flex cursor-pointer flex-col items-center justify-center border-dashed px-6 py-12 text-center transition hover:border-ink-soft/40 hover:bg-mist/85">
        <span className="font-medium text-ink">Choose CSV or PDF file</span>
        <span className="mt-1 text-sm text-muted-foreground">
          {filename ?? "No file selected"}
        </span>
        <input
          type="file"
          accept=".csv,text/csv,.pdf,application/pdf"
          className="sr-only"
          onChange={onFile}
        />
      </label>

      <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
        <span>Samples:</span>
        {BANK_PRESETS.filter((p) => p.samplePath).map((p) => (
          <a
            key={p.id}
            href={p.samplePath}
            className="text-ink-soft underline-offset-2 hover:underline"
            download
          >
            {p.name}
          </a>
        ))}
      </div>

      {pdfRows ? (
        <div className="panel space-y-4 p-5">
          <p className="text-sm text-muted-foreground">
            PDF heuristic extracted {pdfRows.length} rows
            {detectedPreset ? ` · preset ${detectedPreset}` : ""}.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-muted/80">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Description</th>
                  <th className="px-3 py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {pdfRows.slice(0, 12).map((row, i) => (
                  <tr key={i} className="border-t border-border/60">
                    <td className="px-3 py-2">{row.date}</td>
                    <td className="px-3 py-2">{row.description}</td>
                    <td className="px-3 py-2">{row.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button onClick={onCommit} disabled={busy || !pdfRows.length}>
            {busy ? "Importing…" : "Confirm import"}
          </Button>
        </div>
      ) : null}

      {preview ? (
        <div className="panel space-y-4 p-5">
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-sm">
              <span className="mb-1 block text-muted-foreground">Preset</span>
              <select
                className="control"
                value={detectedPreset ?? ""}
                onChange={(e) => e.target.value && applyPreset(e.target.value)}
              >
                <option value="" disabled>
                  Apply bank preset…
                </option>
                {BANK_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {p.format === "pdf" ? " (PDF)" : ""}
                  </option>
                ))}
              </select>
            </label>
            <p className="text-sm text-muted-foreground">
              Preview rows mapped: {mappedCount} / {preview.rows.length}
              {detectedPreset ? ` · detected ${detectedPreset}` : ""}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FIELD_KEYS.map((key) => (
              <label key={key} className="text-sm">
                <span className="mb-1 block capitalize text-muted-foreground">
                  {key}
                  {key === "date" || key === "description" ? " *" : ""}
                </span>
                <select
                  className="control"
                  value={mapping[key] ?? ""}
                  onChange={(e) =>
                    setMapping((m) => ({
                      ...m,
                      [key]: e.target.value || undefined,
                    }))
                  }
                >
                  <option value="">—</option>
                  {preview.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-muted/80">
                <tr>
                  {preview.headers.map((h) => (
                    <th key={h} className="px-3 py-2 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.slice(0, 8).map((row, i) => (
                  <tr key={i} className="border-t border-border/60">
                    {preview.headers.map((h) => (
                      <td key={h} className="px-3 py-2 whitespace-nowrap">
                        {row[h]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Button onClick={onCommit} disabled={busy}>
            {busy ? "Importing…" : "Confirm import"}
          </Button>
        </div>
      ) : null}

      {message ? <p className="font-hand text-lg text-ink-soft">{message}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
