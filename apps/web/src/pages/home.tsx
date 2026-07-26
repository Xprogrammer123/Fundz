import { HandArrow, HandArrowScribble } from "@/components/hand-arrow";
import {
  InkArea,
  InkBars,
  InkPie,
  InkSparkline,
} from "@/components/hero-ink-charts";
import { useVault } from "@/db/vault";
import { cn, formatMoney } from "@/lib/utils";
import { motion } from "motion/react";
import { useMemo } from "react";
import { Link } from "react-router-dom";

const LETTERS = ["F", "u", "n", "d", "s"] as const;

const DEMO_BARS = [42, 68, 35, 90, 55, 78, 48, 95, 60, 72, 40, 88];
const DEMO_LINE = [20, 28, 22, 40, 35, 55, 48, 70, 62, 85, 78, 92];

export function HomePage() {
  const { txCount, cashflow, account, chartSession } = useVault();
  const latest = cashflow[cashflow.length - 1];
  const chartsTo = chartSession?.transactions.length ? "/charts" : "/import";

  const { bars, line } = useMemo(() => {
    if (cashflow.length >= 3) {
      const slice = cashflow.slice(-12);
      return {
        bars: slice.map((b) => Math.abs(b.expense) || Math.abs(b.income) || 1),
        line: slice.map((b) => b.net),
      };
    }
    return { bars: DEMO_BARS, line: DEMO_LINE };
  }, [cashflow]);

  return (
    <div className="space-y-20">
      <section className="relative min-h-[calc(100dvh-5rem)] w-full overflow-hidden">
        {/* Area wash — cashflow mountain behind everything */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] opacity-90">
          <InkArea points={line} className="h-full w-full" />
        </div>

        {/* Left skyline bars */}
        <div className="pointer-events-none absolute bottom-[18%] left-0 z-[1] flex h-[38%] w-[26%] max-w-[11rem] flex-col sm:w-[20%] sm:max-w-[13rem] md:left-2">
          <div className="min-h-0 flex-1">
            <InkBars values={bars} />
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="font-hand mt-1 shrink-0 text-center text-[11px] text-ink/50 sm:text-xs"
          >
            spend ↑
          </motion.p>
        </div>

        {/* Right pie */}
        <motion.div
          initial={{ opacity: 0, rotate: -20, scale: 0.8 }}
          animate={{ opacity: 1, rotate: -8, scale: 1 }}
          transition={{ delay: 0.55, type: "spring", stiffness: 160 }}
          className="pointer-events-none absolute top-[20%] right-0 z-[1] w-28 sm:top-[18%] sm:w-36 md:right-4 md:w-40"
        >
          <InkPie className="w-full" />
          <p className="font-hand absolute -bottom-1 left-1/2 w-max -translate-x-1/2 -rotate-3 text-xs text-ink sm:text-sm">
            categories
          </p>
        </motion.div>

        {/* TOP LEFT */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display absolute top-0 left-0 z-10 text-[11px] tracking-[0.32em] text-ink uppercase"
        >
          Local first
        </motion.p>

        {/* TOP RIGHT */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="font-display absolute top-0 right-0 z-10 text-right text-[11px] tracking-[0.32em] text-ink uppercase"
        >
          Chart studio
          <span className="mt-1 block tracking-[0.2em] text-ink/45">2026</span>
        </motion.p>

        {/* Scrap: CSV → chart story */}
        <motion.div
          initial={{ opacity: 0, x: -30, rotate: -8 }}
          animate={{ opacity: 1, x: 0, rotate: -5 }}
          transition={{ delay: 0.4 }}
          className="absolute top-[11%] left-[18%] z-10 hidden sm:block"
        >
          <p className="font-hand border border-ink/25 bg-paper/70 px-2.5 py-1 text-sm text-ink backdrop-blur-sm">
            CSV in
          </p>
          <HandArrow
            direction="up-right"
            className="ml-8 mt-1 h-10 rotate-[55deg]"
          />
          <p className="font-hand ml-10 -mt-1 text-sm text-ink">charts out</p>
        </motion.div>

        {/* CENTER brand + sparkline through it */}
        <div className="absolute top-[42%] left-1/2 z-10 w-[min(100%,58rem)] -translate-x-1/2 -translate-y-1/2 text-center">
          <motion.p
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            className="font-display pointer-events-none absolute inset-0 translate-x-[0.1em] translate-y-[0.05em] text-[clamp(3.5rem,14vw,9rem)] leading-none tracking-[-0.04em] text-ink select-none"
          >
            Funds
          </motion.p>

          <h1 className="font-display relative text-[clamp(3.5rem,14vw,9rem)] leading-none tracking-[-0.04em] text-ink">
            <span className="sr-only">Funds</span>
            <span className="inline-flex" aria-hidden>
              {LETTERS.map((letter, i) => (
                <motion.span
                  key={`${letter}-${i}`}
                  initial={{ opacity: 0, y: 40, rotate: i % 2 === 0 ? -5 : 5 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{
                    delay: 0.1 + i * 0.07,
                    duration: 0.55,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={{
                    y: -12,
                    transition: { type: "spring", stiffness: 420, damping: 12 },
                  }}
                  className="inline-block cursor-default"
                >
                  {letter}
                </motion.span>
              ))}
            </span>
          </h1>

          {/* Sparkline as the underline — the chart IS the underline */}
          <div className="relative mx-auto mt-1 w-[min(95%,30rem)]">
            <InkSparkline points={line} className="h-14 w-full sm:h-16" />
            <p className="font-hand absolute -right-2 -bottom-1 hidden text-xs text-ink/55 sm:block">
              cashflow →
            </p>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="font-hand mt-3 text-xl text-ink sm:text-2xl"
          >
            statements become charts — on this machine only
          </motion.p>
        </div>

        {/* MID notes */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="font-hand absolute top-[30%] left-0 z-10 max-w-[10rem] text-base leading-snug text-ink sm:max-w-[12rem] sm:text-lg"
        >
          <HandArrowScribble className="mb-1" />
          bars from your real vault
          {txCount ? (
            <span className="mt-1 block text-ink/55">{txCount} rows</span>
          ) : null}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.55 }}
          className="font-hand absolute right-0 bottom-[38%] z-10 max-w-[10rem] text-right text-base leading-snug text-ink sm:max-w-[12rem] sm:text-lg md:bottom-[42%]"
        >
          <span className="inline-flex flex-col items-end">
            <HandArrow direction="up" className="mb-1 h-10 rotate-[30deg]" />
            pie · area · bar · line
          </span>
        </motion.div>

        {/* BOTTOM LEFT */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="font-hand absolute bottom-14 left-0 z-10 max-w-[15rem] text-lg leading-snug text-ink sm:bottom-16 sm:max-w-xs sm:text-xl md:bottom-20"
        >
          Import a CSV. Watch it become ink charts.
          <span className="mt-1 block text-ink/55">Nothing is uploaded.</span>
        </motion.p>

        {/* BOTTOM RIGHT CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.68 }}
          className="absolute right-0 bottom-14 z-10 flex flex-col items-end gap-3 text-right sm:bottom-16 md:bottom-20"
        >
          <Link
            to="/import"
            className={cn(
              "font-display group relative inline-block text-xl text-ink sm:text-2xl md:text-3xl",
              "after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:origin-left after:bg-ink",
              "after:transition-transform hover:after:scale-x-110",
            )}
          >
            Import statement
            <span
              className="font-hand absolute -top-6 -left-1 -rotate-8 text-sm text-ink/70 opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden
            >
              then chart it
            </span>
          </Link>
          <Link
            to={chartsTo}
            className="font-hand text-base text-ink/55 transition-colors hover:text-ink sm:text-lg"
          >
            {chartSession?.transactions.length
              ? "open chart studio →"
              : "import to chart →"}
          </Link>
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
