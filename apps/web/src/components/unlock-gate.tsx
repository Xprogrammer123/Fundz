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
        <h1 className="font-display text-5xl text-ink">Funds</h1>
        <p className="mt-3 text-muted-foreground">
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
              className="w-full rounded-xl border border-border bg-white/70 px-3 py-2 outline-none ring-ring focus:ring-2"
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
      <h1 className="font-display text-5xl text-ink">Unlock</h1>
      <p className="mt-3 text-muted-foreground">
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
            className="w-full rounded-xl border border-border bg-white/70 px-3 py-2 outline-none ring-ring focus:ring-2"
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
