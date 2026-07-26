import { buttonVariants } from "@/components/ui/button";
import { useVault } from "@/db/vault";
import { cn, formatMoney } from "@/lib/utils";
import { Link } from "react-router-dom";

export function HomePage() {
  const { txCount, cashflow, account } = useVault();
  const latest = cashflow[cashflow.length - 1];

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-mist/55 px-6 py-10 sm:px-10 sm:py-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "linear-gradient(rgb(61 79 99 / 0.45) 1px, transparent 1px), linear-gradient(90deg, rgb(61 79 99 / 0.45) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative max-w-xl">
          <p className="font-hand text-xl text-ink-soft">local-first finance</p>
          <h1 className="font-display mt-2 text-5xl leading-tight text-ink sm:text-6xl">
            Your statements. Your machine.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Import a bank CSV, store it in a local SQLite vault, chart cashflow,
            and export Excel — without sending a byte of transaction data to a
            server.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/import" className={cn(buttonVariants())}>
              Import statement
            </Link>
            <Link
              to="/charts"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "border-border bg-transparent text-ink hover:bg-sand/50",
              )}
            >
              View charts
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Stat label="Account" value={account?.name ?? "—"} />
        <Stat label="Transactions" value={String(txCount)} />
        <Stat
          label="Latest month net"
          value={
            latest
              ? formatMoney(latest.net, account?.currency ?? "USD")
              : "—"
          }
        />
      </section>

      <section className="panel p-6">
        <h2 className="font-display text-2xl text-ink">How trust works here</h2>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>Files are parsed in your browser tab — never uploaded.</li>
          <li>SQLite lives in IndexedDB on this device (optionally encrypted).</li>
          <li>
            After the first load, try airplane mode — the app keeps working.
          </li>
          <li>Open DevTools → Network: no statement payloads leave this origin.</li>
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel px-5 py-4">
      <p className="font-hand text-base text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl text-ink">{value}</p>
    </div>
  );
}
