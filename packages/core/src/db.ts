import type { Database, SqlJsStatic } from "sql.js";
import { createId } from "./id.js";
import { loadDb, saveDb, wipeStoredDb } from "./persist.js";
import type {
  Account,
  BalancePoint,
  CategorySpend,
  ImportRecord,
  MonthlyCashflow,
  NormalizedRow,
  Transaction,
} from "./types.js";

type InitSqlJs = (config?: {
  locateFile?: (file: string) => string;
}) => Promise<SqlJsStatic>;

async function loadInitSqlJs(): Promise<InitSqlJs> {
  // sql.js ships CJS (module.exports). Vite may expose it as default or as the
  // module namespace itself depending on prebundling.
  const mod = await import("sql.js");
  const candidate = (mod as { default?: InitSqlJs }).default ?? mod;
  if (typeof candidate !== "function") {
    throw new Error("Failed to load sql.js initializer");
  }
  return candidate as InitSqlJs;
}

function mapTransactionRow(r: Record<string, unknown>): Transaction {
  return {
    id: String(r.id),
    accountId: String(r.account_id),
    importId: String(r.import_id),
    date: String(r.date),
    description: String(r.description),
    amount: Number(r.amount),
    balance: r.balance == null ? null : Number(r.balance),
    category: r.category == null ? null : String(r.category),
    rawJson: r.raw_json == null ? null : String(r.raw_json),
  };
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  bank_id TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS imports (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id),
  source_filename TEXT,
  format TEXT NOT NULL,
  imported_at TEXT NOT NULL,
  row_count INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id),
  import_id TEXT NOT NULL REFERENCES imports(id),
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  balance REAL,
  category TEXT,
  raw_json TEXT
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  keywords TEXT
);

CREATE INDEX IF NOT EXISTS idx_tx_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_tx_account ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_tx_category ON transactions(category);
`;

let sqlPromise: Promise<SqlJsStatic> | null = null;

export type SqlJsLocateFile = (file: string) => string;

export function initSql(locateFile?: SqlJsLocateFile): Promise<SqlJsStatic> {
  if (!sqlPromise) {
    sqlPromise = loadInitSqlJs().then((initSqlJs) =>
      initSqlJs({
        locateFile:
          locateFile ??
          ((file) => {
            // Prefer local public assets; fall back to CDN only if needed.
            if (file.endsWith(".wasm")) return `/${file}`;
            return `/${file}`;
          }),
      }),
    );
  }
  return sqlPromise;
}

export class FundsDb {
  private db: Database;
  private passphrase: string | null;

  private constructor(db: Database, passphrase: string | null) {
    this.db = db;
    this.passphrase = passphrase;
  }

  static async open(
    passphrase: string | null,
    locateFile?: SqlJsLocateFile,
  ): Promise<FundsDb> {
    const SQL = await initSql(locateFile);
    const stored = await loadDb(passphrase);
    const db = stored ? new SQL.Database(stored) : new SQL.Database();
    const funds = new FundsDb(db, passphrase);
    funds.migrate();
    if (!stored) {
      await funds.persist();
    }
    return funds;
  }

  static async wipe(): Promise<void> {
    await wipeStoredDb();
  }

  private migrate(): void {
    this.db.run(SCHEMA);
    const version = this.getMeta("schema_version");
    if (!version) {
      this.setMeta("schema_version", "1");
    }
  }

  getMeta(key: string): string | null {
    const stmt = this.db.prepare("SELECT value FROM meta WHERE key = ?");
    stmt.bind([key]);
    if (!stmt.step()) {
      stmt.free();
      return null;
    }
    const row = stmt.getAsObject() as { value: string };
    stmt.free();
    return row.value;
  }

  setMeta(key: string, value: string): void {
    this.db.run(
      "INSERT INTO meta(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      [key, value],
    );
  }

  async persist(): Promise<void> {
    const bytes = this.db.export();
    await saveDb(bytes, this.passphrase);
  }

  setPassphrase(passphrase: string | null): void {
    this.passphrase = passphrase;
  }

  ensureDefaultAccount(name = "Primary"): Account {
    const existing = this.listAccounts()[0];
    if (existing) return existing;
    return this.createAccount(name);
  }

  createAccount(name: string, currency = "USD", bankId: string | null = null): Account {
    const account: Account = {
      id: createId("acct"),
      name,
      bankId,
      currency,
      createdAt: new Date().toISOString(),
    };
    this.db.run(
      "INSERT INTO accounts(id, name, bank_id, currency, created_at) VALUES(?, ?, ?, ?, ?)",
      [account.id, account.name, account.bankId, account.currency, account.createdAt],
    );
    return account;
  }

  listAccounts(): Account[] {
    const result = this.db.exec(
      "SELECT id, name, bank_id, currency, created_at FROM accounts ORDER BY created_at",
    );
    if (!result[0]) return [];
    return result[0].values.map((row) => ({
      id: String(row[0]),
      name: String(row[1]),
      bankId: row[2] == null ? null : String(row[2]),
      currency: String(row[3]),
      createdAt: String(row[4]),
    }));
  }

  importRows(
    accountId: string,
    filename: string | null,
    rows: NormalizedRow[],
    format: "csv" | "pdf" = "csv",
  ): ImportRecord {
    const importId = createId("imp");
    const importedAt = new Date().toISOString();
    this.db.run(
      "INSERT INTO imports(id, account_id, source_filename, format, imported_at, row_count) VALUES(?, ?, ?, ?, ?, ?)",
      [importId, accountId, filename, format, importedAt, rows.length],
    );

    const insert = this.db.prepare(
      `INSERT INTO transactions(
        id, account_id, import_id, date, description, amount, balance, category, raw_json
      ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );

    for (const row of rows) {
      insert.run([
        createId("tx"),
        accountId,
        importId,
        row.date,
        row.description,
        row.amount,
        row.balance ?? null,
        row.category ?? null,
        null,
      ]);
    }
    insert.free();

    return {
      id: importId,
      accountId,
      sourceFilename: filename,
      format,
      importedAt,
      rowCount: rows.length,
    };
  }

  listTransactions(limit = 500, offset = 0): Transaction[] {
    const stmt = this.db.prepare(
      `SELECT id, account_id, import_id, date, description, amount, balance, category, raw_json
       FROM transactions
       ORDER BY date DESC, rowid DESC
       LIMIT ? OFFSET ?`,
    );
    stmt.bind([limit, offset]);
    const rows: Transaction[] = [];
    while (stmt.step()) {
      rows.push(mapTransactionRow(stmt.getAsObject() as Record<string, unknown>));
    }
    stmt.free();
    return rows;
  }

  /** Transactions from a single import batch (for session charts). */
  listTransactionsByImport(importId: string): Transaction[] {
    const stmt = this.db.prepare(
      `SELECT id, account_id, import_id, date, description, amount, balance, category, raw_json
       FROM transactions
       WHERE import_id = ?
       ORDER BY date ASC, rowid ASC`,
    );
    stmt.bind([importId]);
    const rows: Transaction[] = [];
    while (stmt.step()) {
      rows.push(mapTransactionRow(stmt.getAsObject() as Record<string, unknown>));
    }
    stmt.free();
    return rows;
  }

  countTransactions(): number {
    const result = this.db.exec("SELECT COUNT(*) FROM transactions");
    return Number(result[0]?.values[0]?.[0] ?? 0);
  }

  updateTransactionCategory(id: string, category: string | null): void {
    this.db.run("UPDATE transactions SET category = ? WHERE id = ?", [
      category,
      id,
    ]);
  }

  monthlyCashflow(): MonthlyCashflow[] {
    const result = this.db.exec(`
      SELECT
        substr(date, 1, 7) AS month,
        SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) AS income,
        SUM(CASE WHEN amount < 0 THEN -amount ELSE 0 END) AS expense
      FROM transactions
      GROUP BY substr(date, 1, 7)
      ORDER BY month
    `);
    if (!result[0]) return [];
    return result[0].values.map((row) => {
      const income = Number(row[1] ?? 0);
      const expense = Number(row[2] ?? 0);
      return {
        month: String(row[0]),
        income,
        expense,
        net: income - expense,
      };
    });
  }

  categorySpend(): CategorySpend[] {
    const result = this.db.exec(`
      SELECT COALESCE(NULLIF(TRIM(category), ''), 'Uncategorized') AS category,
             SUM(-amount) AS total
      FROM transactions
      WHERE amount < 0
      GROUP BY COALESCE(NULLIF(TRIM(category), ''), 'Uncategorized')
      ORDER BY total DESC
    `);
    if (!result[0]) return [];
    return result[0].values.map((row) => ({
      category: String(row[0]),
      total: Number(row[1] ?? 0),
    }));
  }

  balanceSeries(): BalancePoint[] {
    const withBalance = this.db.exec(`
      SELECT date, balance
      FROM transactions
      WHERE balance IS NOT NULL
      ORDER BY date ASC, rowid ASC
    `);
    if (withBalance[0]?.values.length) {
      return withBalance[0].values.map((row) => ({
        date: String(row[0]),
        balance: Number(row[1]),
      }));
    }

    // Fallback: running sum of amounts
    const result = this.db.exec(`
      SELECT date, amount
      FROM transactions
      ORDER BY date ASC, rowid ASC
    `);
    if (!result[0]) return [];
    let running = 0;
    return result[0].values.map((row) => {
      running += Number(row[1] ?? 0);
      return { date: String(row[0]), balance: running };
    });
  }

  close(): void {
    this.db.close();
  }
}
