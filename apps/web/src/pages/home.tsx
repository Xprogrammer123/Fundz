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
const DEMO_LINE = [18, 26, 22, 38, 32, 52, 44, 68, 58, 82, 74, 96];

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
        {/* Bold area mountain — bottom-right, like the poster */}
        <div className="pointer-events-none absolute right-[-4%] bottom-0 z-[1] h-[42%] w-[72%] max-w-[42rem] sm:w-[62%] md:right-0 md:w-[58%]">
          <InkArea points={line} className="h-full w-full" />
        </div>

        {/* Mid-left bar skyline */}
        <div className="pointer-events-none absolute top-[34%] left-0 z-[2] flex h-[34%] w-[42%] max-w-[16rem] flex-col sm:top-[32%] sm:w-[30%] sm:max-w-[15rem] md:left-1 md:max-w-[16rem]">
          <div className="min-h-0 flex-1">
            <InkBars values={bars} />
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="font-hand mt-1 shrink-0 text-center text-sm text-ink/60"
          >
            spend
          </motion.p>
        </div>

        {/* Top-right pie */}
        <motion.div
          initial={{ opacity: 0, rotate: -18, scale: 0.82 }}
          animate={{ opacity: 1, rotate: -10, scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 160 }}
          className="pointer-events-none absolute top-[14%] right-0 z-[2] w-24 sm:top-[12%] sm:w-32 md:right-2 md:w-36"
        >
          <InkPie className="w-full" />
          <p className="font-hand absolute -bottom-0.5 left-1/2 w-max -translate-x-1/2 -rotate-3 text-sm text-ink">
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

        {/* Scrap: CSV → charts */}
        <motion.div
          initial={{ opacity: 0, x: -24, rotate: -8 }}
          animate={{ opacity: 1, x: 0, rotate: -5 }}
          transition={{ delay: 0.35 }}
          className="absolute top-[10%] left-[14%] z-10 hidden sm:block md:left-[18%]"
        >
          <p className="font-hand border border-ink/30 bg-paper/80 px-2.5 py-1 text-sm text-ink shadow-[2px_2px_0_rgba(17,17,17,0.06)]">
            CSV in
          </p>
          <HandArrow
            direction="up-right"
            className="ml-8 mt-1 h-10 rotate-[55deg]"
          />
          <p className="font-hand ml-10 -mt-1 text-sm text-ink">charts out</p>
        </motion.div>

        {/* CENTER brand */}
        <div className="absolute top-[40%] left-1/2 z-10 w-[min(100%,58rem)] -translate-x-1/2 -translate-y-1/2 text-center sm:top-[42%]">
          <motion.p
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.12 }}
            className="font-display pointer-events-none absolute inset-0 translate-x-[0.08em] translate-y-[0.04em] text-[clamp(3.75rem,15vw,9.5rem)] leading-none tracking-[-0.04em] text-ink select-none"
          >
            Funds
          </motion.p>

          <h1 className="font-display relative text-[clamp(3.75rem,15vw,9.5rem)] leading-none tracking-[-0.04em] text-ink">
            <span className="sr-only">Funds</span>
            <span className="inline-flex" aria-hidden>
              {LETTERS.map((letter, i) => (
                <motion.span
                  key={`${letter}-${i}`}
                  initial={{ opacity: 0, y: 36, rotate: i % 2 === 0 ? -4 : 4 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{
                    delay: 0.08 + i * 0.07,
                    duration: 0.55,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={{
                    y: -10,
                    transition: { type: "spring", stiffness: 420, damping: 12 },
                  }}
                  className="inline-block cursor-default"
                >
                  {letter}
                </motion.span>
              ))}
            </span>
          </h1>

          <div className="relative mx-auto mt-0.5 w-[min(92%,22rem)]">
            <InkSparkline points={line} className="h-12 w-full sm:h-14" />
            <p className="font-hand absolute -right-1 -bottom-0.5 text-xs text-ink/55 sm:text-sm">
              cashflow →
            </p>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="mt-4 text-sm tracking-wide text-ink/75 sm:text-base"
          >
            statements become charts — on this machine only
          </motion.p>
        </div>

        {/* Note above bars */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.45 }}
          className="font-hand absolute top-[22%] left-0 z-10 max-w-[11rem] text-base leading-snug text-ink sm:top-[24%] sm:max-w-[13rem] sm:text-lg"
        >
          <HandArrowScribble className="mb-1" />
          bars from your real vault
          {txCount ? (
            <span className="mt-1 block text-ink/55">{txCount} rows</span>
          ) : (
            <span className="mt-1 block text-ink/45">demo ink for now</span>
          )}
        </motion.div>

        {/* Chart-type note pointing at area peak */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.55 }}
          className="font-hand absolute right-[8%] bottom-[44%] z-10 max-w-[11rem] text-right text-base leading-snug text-ink sm:right-[14%] sm:bottom-[46%] sm:text-lg md:right-[18%]"
        >
          <span className="inline-flex flex-col items-end">
            <HandArrow direction="up" className="mb-0.5 h-9 rotate-[28deg]" />
            pie · area · bar · line
          </span>
        </motion.div>

        {/* BOTTOM LEFT */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="font-hand absolute bottom-12 left-0 z-10 max-w-[14rem] text-lg leading-snug text-ink sm:bottom-14 sm:max-w-xs sm:text-xl md:bottom-16"
        >
          Import a CSV. Watch it become ink charts.
          <span className="mt-1 block text-ink/55">Nothing is uploaded.</span>
        </motion.p>

        {/* BOTTOM RIGHT CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.62 }}
          className="absolute right-0 bottom-12 z-10 flex flex-col items-end gap-2 text-right sm:bottom-14 md:bottom-16"
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
