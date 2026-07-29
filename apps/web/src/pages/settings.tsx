import { Button } from "@/components/ui/button";
import { useVault } from "@/db/vault";
import { useState, type FormEvent } from "react";

export function SettingsPage() {
  const { wipe, setPassphraseAndSave, txCount, hasVault } = useVault();
  const [passphrase, setPassphrase] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSavePassphrase(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      await setPassphraseAndSave(passphrase.trim() || null);
      setMessage(
        passphrase.trim()
          ? "Vault re-encrypted with the new passphrase."
          : "Vault saved without passphrase encryption.",
      );
      setPassphrase("");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  async function onWipe() {
    if (
      !confirm(
        "Delete all local Funds data on this device? This cannot be undone.",
      )
    ) {
      return;
    }
    await wipe();
    setMessage("Local vault wiped.");
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <h1 className="font-display text-4xl sm:text-5xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything below only affects data stored in this browser.
        </p>
      </div>

      <section className="panel p-5">
        <h2 className="font-medium">Privacy</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Funds is local-first. Statement parsing, SQLite storage, charts, and
          Excel export run on your device. There is no account server and no
          sync.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Vault status: {hasVault ? `active · ${txCount} transactions` : "empty"}
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>After first load, airplane mode still works (service worker + local DB).</li>
          <li>DevTools → Network: no statement payloads leave this origin.</li>
          <li>Optional passphrase encrypts the IndexedDB vault with AES-GCM.</li>
        </ul>
      </section>

      <section className="panel p-5">
        <h2 className="font-medium">Passphrase</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Encrypt the IndexedDB vault with AES-GCM. Leave blank to store the DB
          blob without a passphrase (still local-only).
        </p>
        <form onSubmit={onSavePassphrase} className="mt-4 space-y-3">
          <input
            type="password"
            autoComplete="new-password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder="New passphrase"
            className="control"
          />
          <Button type="submit" disabled={busy} className="w-full sm:w-auto">
            {busy ? "Saving…" : "Update encryption"}
          </Button>
        </form>
      </section>

      <section className="panel border-destructive/30 p-5">
        <h2 className="font-medium text-destructive">Danger zone</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Permanently delete the local vault from this browser.
        </p>
        <Button
          variant="destructive"
          className="mt-4"
          onClick={() => void onWipe()}
        >
          Wipe local data
        </Button>
      </section>

      {message ? <p className="font-hand text-lg text-ink-soft">{message}</p> : null}
    </div>
  );
}
