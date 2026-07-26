import { HandArrow, HandArrowScribble } from "@/components/hand-arrow";
import { useVault } from "@/db/vault";
import { formatMoney } from "@/lib/utils";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

export function HomePage() {
  const { txCount, cashflow, account, chartSession } = useVault();
  const latest = cashflow[cashflow.length - 1];
  const chartsTo = chartSession?.transactions.length ? "/charts" : "/import";

  return (
    <div className="space-y-20">
      {/* Full-bleed poster composition — copy lives in corners, brand owns the center */}
      <section className="relative min-h-[calc(100dvh-5rem)] w-full">
        {/* TOP LEFT */}
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="font-display absolute top-0 left-0 z-10 text-[11px] tracking-[0.32em] text-ink uppercase"
        >
          Local first
        </motion.p>

        {/* TOP RIGHT */}
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="font-display absolute top-0 right-0 z-10 text-right text-[11px] tracking-[0.32em] text-ink uppercase"
        >
          No cloud
          <span className="mt-1 block tracking-[0.2em] text-ink/50">2026</span>
        </motion.p>

        {/* CENTER — brand spans the field */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="font-display absolute top-1/2 left-1/2 w-[min(100%,52rem)] -translate-x-1/2 -translate-y-[55%] text-center text-ink"
        >
          <span className="block text-[clamp(4.5rem,18vw,11rem)] leading-[0.82] tracking-[-0.04em]">
            FUN
          </span>
          <span className="relative mt-1 block text-[clamp(4.5rem,18vw,11rem)] leading-[0.82] tracking-[-0.04em]">
            <span className="relative inline-block">
              <span
                aria-hidden
                className="absolute -top-[0.92em] left-[0.12em] h-[1.85em] w-[0.1em] bg-ink"
              />
              <span className="relative">D</span>
            </span>
            <span>S</span>
          </span>
        </motion.h1>

        {/* MID-LEFT — hand note pointing into the mark */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="font-hand absolute top-[38%] left-0 z-10 max-w-[11rem] text-base leading-snug text-ink sm:top-[34%] sm:max-w-[13rem] sm:text-lg"
        >
          <HandArrow
            direction="up-right"
            className="mb-1 h-12 rotate-12"
          />
          your vault never leaves this tab
        </motion.div>

        {/* MID-RIGHT — second hand note */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.38, duration: 0.5 }}
          className="font-hand absolute top-[42%] right-0 z-10 max-w-[10rem] text-right text-base leading-snug text-ink sm:max-w-[12rem] sm:text-lg"
        >
          <span className="inline-flex flex-col items-end">
            <HandArrowScribble className="mb-1 scale-x-[-1]" />
            parse · chart · export
          </span>
        </motion.div>

        {/* BOTTOM LEFT — supporting line */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="font-hand absolute bottom-16 left-0 z-10 max-w-[16rem] text-lg leading-snug text-ink sm:bottom-20 sm:max-w-xs sm:text-xl md:bottom-24"
        >
          Drop a statement. Nothing is uploaded. Airplane mode still works.
        </motion.p>

        {/* BOTTOM RIGHT — CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.48, duration: 0.5 }}
          className="absolute right-0 bottom-16 z-10 flex flex-col items-end gap-3 text-right sm:bottom-20 md:bottom-24"
        >
          <Link
            to="/import"
            className="font-display relative text-xl text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:bg-ink sm:text-2xl md:text-3xl"
          >
            Import statement
          </Link>
          <Link
            to={chartsTo}
            className="font-hand text-base text-ink/55 transition-colors hover:text-ink sm:text-lg"
          >
            {chartSession?.transactions.length
              ? "open charts →"
              : "import to chart →"}
          </Link>
        </motion.div>

        {/* BOTTOM CENTER — quiet ledger atmosphere */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="pointer-events-none absolute inset-x-0 bottom-0 hidden justify-center md:flex"
          aria-hidden
        >
          <svg
            viewBox="0 0 640 40"
            className="w-full max-w-xl text-ink/15"
            fill="none"
          >
            {[8, 20, 32].map((y, i) => (
              <path
                key={y}
                d={`M40 ${y} H ${600 - i * 40}`}
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            ))}
          </svg>
        </motion.div>
      </section>

      <section className="grid gap-10 border-t border-ink/15 pt-12 sm:grid-cols-3">
        <Stat label="Account" value={account?.name ?? "—"} />
        <Stat label="Transactions" value={String(txCount)} />
        <Stat
          label="Latest month net"
          value={
            latest ? formatMoney(latest.net, account?.currency ?? "USD") : "—"
          }
        />
      </section>

      <section className="max-w-lg border-t border-ink/15 pt-12">
        <h2 className="font-display text-3xl text-ink">Trust, briefly</h2>
        <ul className="mt-5 space-y-3 font-hand text-lg text-ink/70">
          <li>Parsed in this tab — never uploaded.</li>
          <li>SQLite vault lives on this device.</li>
          <li>Works offline after first load.</li>
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-hand text-base text-ink/50">{label}</p>
      <p className="mt-1 font-display text-3xl tracking-tight text-ink">
        {value}
      </p>
    </div>
  );
}
