import {
  FundsDb,
  hasStoredDb,
  type Account,
  type BalancePoint,
  type CategorySpend,
  type MonthlyCashflow,
  type NormalizedRow,
  type Transaction,
} from "@funds/core";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type VaultState = {
  ready: boolean;
  locked: boolean;
  hasVault: boolean;
  error: string | null;
  account: Account | null;
  transactions: Transaction[];
  txCount: number;
  cashflow: MonthlyCashflow[];
  categories: CategorySpend[];
  balances: BalancePoint[];
  unlock: (passphrase: string | null) => Promise<void>;
  createVault: (passphrase: string | null) => Promise<void>;
  importRows: (
    filename: string | null,
    rows: NormalizedRow[],
    format?: "csv" | "pdf",
  ) => Promise<number>;
  refresh: () => Promise<void>;
  updateCategory: (id: string, category: string | null) => Promise<void>;
  wipe: () => Promise<void>;
  setPassphraseAndSave: (passphrase: string | null) => Promise<void>;
};

const VaultContext = createContext<VaultState | null>(null);

function locateFile(file: string): string {
  // Browser build asks for sql-wasm-browser.wasm; node build asks for sql-wasm.wasm.
  if (file.includes("sql-wasm")) {
    if (file.includes("browser")) return "/sql-wasm-browser.wasm";
    return "/sql-wasm.wasm";
  }
  return `/${file}`;
}

export function VaultProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<FundsDb | null>(null);
  const [ready, setReady] = useState(false);
  const [hasVault, setHasVault] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txCount, setTxCount] = useState(0);
  const [cashflow, setCashflow] = useState<MonthlyCashflow[]>([]);
  const [categories, setCategories] = useState<CategorySpend[]>([]);
  const [balances, setBalances] = useState<BalancePoint[]>([]);

  const hydrate = useCallback(async (instance: FundsDb) => {
    const acct = instance.ensureDefaultAccount("Primary");
    setAccount(acct);
    setTransactions(instance.listTransactions(500, 0));
    setTxCount(instance.countTransactions());
    setCashflow(instance.monthlyCashflow());
    setCategories(instance.categorySpend());
    setBalances(instance.balanceSeries());
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const exists = await hasStoredDb();
      if (cancelled) return;
      setHasVault(exists);
      if (exists) {
        // Auto-open unencrypted vaults; encrypted ones stay locked.
        try {
          const instance = await FundsDb.open(null, locateFile);
          if (cancelled) {
            instance.close();
            return;
          }
          setDb(instance);
          await hydrate(instance);
        } catch {
          // Needs passphrase — leave locked.
        }
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrate]);

  const unlock = useCallback(
    async (passphrase: string | null) => {
      setError(null);
      try {
        const instance = await FundsDb.open(passphrase, locateFile);
        setDb(instance);
        await hydrate(instance);
        setHasVault(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not unlock vault");
        throw e;
      }
    },
    [hydrate],
  );

  const createVault = useCallback(
    async (passphrase: string | null) => {
      await FundsDb.wipe();
      const instance = await FundsDb.open(passphrase, locateFile);
      instance.ensureDefaultAccount("Primary");
      await instance.persist();
      setDb(instance);
      await hydrate(instance);
      setHasVault(true);
      setError(null);
    },
    [hydrate],
  );

  const refresh = useCallback(async () => {
    if (!db) return;
    await hydrate(db);
  }, [db, hydrate]);

  const importRows = useCallback(
    async (
      filename: string | null,
      rows: NormalizedRow[],
      format: "csv" | "pdf" = "csv",
    ) => {
      if (!db || !account) throw new Error("Vault is not open");
      const record = db.importRows(account.id, filename, rows, format);
      await db.persist();
      await hydrate(db);
      return record.rowCount;
    },
    [account, db, hydrate],
  );

  const updateCategory = useCallback(
    async (id: string, category: string | null) => {
      if (!db) return;
      db.updateTransactionCategory(id, category);
      await db.persist();
      await hydrate(db);
    },
    [db, hydrate],
  );

  const wipe = useCallback(async () => {
    db?.close();
    setDb(null);
    await FundsDb.wipe();
    setAccount(null);
    setTransactions([]);
    setTxCount(0);
    setCashflow([]);
    setCategories([]);
    setBalances([]);
    setHasVault(false);
  }, [db]);

  const setPassphraseAndSave = useCallback(
    async (passphrase: string | null) => {
      if (!db) return;
      db.setPassphrase(passphrase);
      await db.persist();
    },
    [db],
  );

  const value = useMemo<VaultState>(
    () => ({
      ready,
      locked: ready && hasVault && !db,
      hasVault,
      error,
      account,
      transactions,
      txCount,
      cashflow,
      categories,
      balances,
      unlock,
      createVault,
      importRows,
      refresh,
      updateCategory,
      wipe,
      setPassphraseAndSave,
    }),
    [
      ready,
      hasVault,
      db,
      error,
      account,
      transactions,
      txCount,
      cashflow,
      categories,
      balances,
      unlock,
      createVault,
      importRows,
      refresh,
      updateCategory,
      wipe,
      setPassphraseAndSave,
    ],
  );

  return (
    <VaultContext.Provider value={value}>{children}</VaultContext.Provider>
  );
}

export function useVault(): VaultState {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error("useVault must be used within VaultProvider");
  return ctx;
}
