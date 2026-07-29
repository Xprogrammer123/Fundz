import { Button, buttonVariants } from "@/components/ui/button";
import { useVault } from "@/db/vault";
import { cn, formatMoney } from "@/lib/utils";
import {
  downloadBlob,
  transactionsToExcelBlob,
} from "@funds/core";
import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export function TransactionsPage() {
  const { transactions, account, updateCategory, txCount } = useVault();
  const location = useLocation();
  const importedCount =
    typeof location.state === "object" &&
    location.state &&
    "importedCount" in location.state
      ? Number((location.state as { importedCount?: number }).importedCount)
      : null;
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter(
      (t) =>
        t.description.toLowerCase().includes(q) ||
        (t.category ?? "").toLowerCase().includes(q) ||
        t.date.includes(q),
    );
  }, [transactions, query]);

  function exportExcel() {
    const blob = transactionsToExcelBlob(transactions);
    downloadBlob(
      blob,
      `funds-transactions-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  }

  return (
    <div className="space-y-6">
      {importedCount != null && !Number.isNaN(importedCount) ? (
        <div className="flex flex-col gap-3 rounded-3xl border border-border/70 bg-mist/55 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink">
            Imported <strong>{importedCount}</strong> transactions into your
            local vault.
          </p>
          <Link
            to="/charts"
            className={cn(buttonVariants({ size: "sm" }), "w-fit")}
          >
            Open charts
          </Link>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl">Transactions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {txCount} rows in local vault
            {account ? ` · ${account.currency}` : ""}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="control w-full text-sm sm:min-w-[12rem] sm:flex-1"
          />
          <Button variant="outline" onClick={exportExcel} disabled={!transactions.length} className="w-full sm:w-auto">
            Export Excel
          </Button>
        </div>
      </div>

      {!filtered.length ? (
        <p className="panel p-8 text-sm text-muted-foreground">
          No transactions yet. Import a CSV to get started.
        </p>
      ) : (
        <div className="panel overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted/70 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-t border-border/50">
                  <td className="px-4 py-3 whitespace-nowrap">{t.date}</td>
                  <td className="px-4 py-3 max-w-md truncate">{t.description}</td>
                  <td className="px-4 py-3">
                    <input
                      defaultValue={t.category ?? ""}
                      placeholder="Uncategorized"
                      className="w-full min-w-[7rem] max-w-[10rem] rounded-lg border border-transparent bg-transparent px-2 py-1 hover:border-border focus:border-border focus:bg-paper focus:outline-none"
                      onBlur={(e) => {
                        const next = e.target.value.trim() || null;
                        if (next !== (t.category ?? null)) {
                          void updateCategory(t.id, next);
                        }
                      }}
                    />
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-medium whitespace-nowrap ${
                      t.amount < 0 ? "text-ink-soft" : "text-ink"
                    }`}
                  >
                    {formatMoney(t.amount, account?.currency ?? "USD")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
