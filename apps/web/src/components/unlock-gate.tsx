import { Button } from "@/components/ui/button";
import { useVault } from "@/db/vault";
import { useState, type FormEvent } from "react";

export function UnlockGate({ children }: { children: React.ReactNode }) {
  const { ready, locked, hasVault, error, unlock, createVault } = useVault();
  const [passphrase, setPassphrase] = useState("");
  const [busy, setBusy] = useState(false);

  if (!ready) {
    return (
      <div className="grid min-h-dvh place-items-center text-muted-foreground">
        Opening local vault…
      </div>
    );
  }

  if (!locked && hasVault) {
    return children;
  }

  if (!hasVault) {
    async function onCreate(e: FormEvent) {
      e.preventDefault();
      setBusy(true);
      try {
        await createVault(passphrase.trim() || null);
      } finally {
        setBusy(false);
      }
    }

    return (
      <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4">
        <h1 className="font-display text-6xl leading-none text-ink sm:text-7xl">
          Funds
        </h1>
        <p className="font-hand mt-3 text-xl text-ink-soft">
          A local-first statement analyzer. Your SQLite vault stays in this
          browser — nothing is uploaded.
        </p>
        <form onSubmit={onCreate} className="mt-8 space-y-4">
          <label className="block space-y-2 text-sm">
            <span className="font-medium">Optional passphrase</span>
            <input
              type="password"
              autoComplete="new-password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Leave blank for no encryption"
              className="control"
            />
          </label>
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? "Creating…" : "Create local vault"}
          </Button>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </form>
      </div>
    );
  }

  async function onUnlock(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await unlock(passphrase.trim() || null);
    } catch {
      // error surfaced via vault.error
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4">
      <h1 className="font-display text-6xl leading-none text-ink sm:text-7xl">
        Unlock
      </h1>
      <p className="font-hand mt-3 text-xl text-ink-soft">
        Enter the passphrase for the vault stored on this device.
      </p>
      <form onSubmit={onUnlock} className="mt-8 space-y-4">
        <label className="block space-y-2 text-sm">
          <span className="font-medium">Passphrase</span>
          <input
            type="password"
            autoComplete="current-password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            className="control"
          />
        </label>
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "Unlocking…" : "Unlock vault"}
        </Button>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </form>
    </div>
  );
}
