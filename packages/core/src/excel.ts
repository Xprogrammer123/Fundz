import * as XLSX from "xlsx";
import type { Transaction } from "./types.js";

export function transactionsToExcelBlob(transactions: Transaction[]): Blob {
  const rows = transactions.map((t) => ({
    Date: t.date,
    Description: t.description,
    Amount: t.amount,
    Balance: t.balance ?? "",
    Category: t.category ?? "",
  }));

  const sheet = XLSX.utils.json_to_sheet(rows);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Transactions");
  const array = XLSX.write(book, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
  return new Blob([array], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
