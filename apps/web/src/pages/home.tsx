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
import { Link } from "react-router-dom";

const LETTERS = ["F", "u", "n", "d", "s"] as const;

/** Fixed poster silhouettes — locked to the approved hero frame. */
const POSTER_BARS = [36, 58, 42, 74, 50, 88, 56, 70, 46, 94, 62, 78, 52, 84];
const POSTER_AREA = [14, 38, 22, 52, 30, 68, 40, 82, 48, 96, 58, 90, 64, 98];
const POSTER_SPARK = [30, 48, 36, 62, 44, 72, 52, 78];

export function HomePage() {
  const { txCount, cashflow, account, chartSession } = useVault();
  const latest = cashflow[cashflow.length - 1];
  const chartsTo = chartSession?.transactions.length ? "/charts" : "/import";
  const rowsLabel = txCount ? `${txCount} rows` : "22 rows";

  return (
    <div className="space-y-20">
      {/*
        Poster composition — absolute placement mirrors the approved frame.
        Aspect ~1024×609; charts are real SVG/HTML, not a screenshot.
      */}
      <section className="relative aspect-[1024/680] w-full min-h-[24rem] overflow-hidden sm:min-h-[32rem]">
        {/* Bottom area chart — full width light wash */}
        <div className="pointer-events-none absolute inset-x-[-1%] bottom-0 z-[1] h-[34%]">
          <InkArea points={POSTER_AREA} className="h-full w-full" />
        </div>

        {/* Mid-left bars */}
        <div className="pointer-events-none absolute top-[38%] left-0 z-[2] flex h-[38%] w-[48%] max-w-[20rem] flex-col sm:left-1 sm:w-[34%] sm:max-w-[19rem]">
          <div className="min-h-0 flex-1">
            <InkBars values={POSTER_BARS} />
          </div>
          <p className="font-hand mt-1 shrink-0 text-center text-[13px] text-ink/65 sm:text-sm">
            spend
          </p>
        </div>

        {/* Top-right pie */}
        <div className="pointer-events-none absolute top-[10%] right-1 z-[2] w-[5.5rem] -rotate-[9deg] sm:right-2 sm:w-[7.5rem] md:w-32">
          <InkPie className="w-full" />
          <p className="font-hand absolute -bottom-1 left-1/2 w-max -translate-x-1/2 -rotate-2 text-[13px] text-ink sm:text-sm">
            categories
          </p>
        </div>

        {/* Corners */}
        <p className="font-display absolute top-0 left-0 z-10 text-[10px] tracking-[0.3em] text-ink uppercase sm:text-[11px] sm:tracking-[0.32em]">
          Local first
        </p>
        <p className="font-display absolute top-0 right-0 z-10 text-right text-[10px] tracking-[0.3em] text-ink uppercase sm:text-[11px] sm:tracking-[0.32em]">
          Chart studio
          <span className="mt-0.5 block tracking-[0.18em] text-ink/45">
            2026
          </span>
        </p>

        {/* CSV scrap */}
        <div className="absolute top-[7%] left-[12%] z-10 hidden sm:block md:left-[14%]">
          <p className="font-hand border border-ink/30 bg-paper/80 px-2 py-0.5 text-[13px] text-ink sm:text-sm">
            CSV in
          </p>
          <HandArrow
            direction="up-right"
            className="ml-7 mt-0.5 h-9 rotate-[55deg]"
          />
          <p className="font-hand ml-9 -mt-1 text-[13px] text-ink sm:text-sm">
            charts out
          </p>
        </div>

        {/* Center brand */}
        <div className="absolute top-[38%] left-1/2 z-10 w-[min(100%,56rem)] -translate-x-1/2 -translate-y-1/2 text-center">
          <p
            aria-hidden
            className="font-display pointer-events-none absolute inset-0 translate-x-[0.07em] translate-y-[0.035em] text-[clamp(3.25rem,13.5vw,8.75rem)] leading-none tracking-[-0.04em] text-ink/12 select-none"
          >
            Funds
          </p>
          <h1 className="font-display relative text-[clamp(3.25rem,13.5vw,8.75rem)] leading-none tracking-[-0.04em] text-ink">
            <span className="sr-only">Funds</span>
            <span className="inline-flex" aria-hidden>
              {LETTERS.map((letter, i) => (
                <motion.span
                  key={`${letter}-${i}`}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.06 + i * 0.05,
                    duration: 0.45,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="inline-block"
                >
                  {letter}
                </motion.span>
              ))}
            </span>
          </h1>

          <div className="relative mx-auto mt-4 w-[min(85%,18rem)]">
            <InkSparkline points={POSTER_SPARK} className="h-10 w-full" />
            <p className="font-hand absolute -right-1 bottom-0 text-[11px] text-ink/55 sm:text-xs">
              cashflow →
            </p>
          </div>

          <p className="mt-4 text-[13px] tracking-wide text-ink/80 sm:text-sm">
            statements become charts — on this machine only
          </p>
        </div>

        {/* Note above bars */}
        <div className="font-hand absolute top-[14%] left-0 z-10 max-w-[10.5rem] text-[15px] leading-snug text-ink sm:max-w-[12rem] sm:text-base">
          <HandArrowScribble className="mb-0.5" />
          bars from your real vault
          <span className="mt-0.5 block text-ink/55">{rowsLabel}</span>
        </div>

        {/* Chart types → area peak */}
        <div className="font-hand absolute right-[6%] bottom-[38%] z-10 text-right text-[15px] leading-snug text-ink sm:right-[12%] sm:bottom-[40%] sm:text-base">
          <span className="inline-flex flex-col items-end">
            <HandArrow direction="up" className="mb-0.5 h-8 rotate-[28deg]" />
            pie · area · bar · line
          </span>
        </div>

        {/* Bottom left copy */}
        <p className="font-hand absolute bottom-[8%] left-0 z-10 max-w-[14rem] text-base leading-snug text-ink sm:bottom-[9%] sm:max-w-[17rem] sm:text-lg">
          Import a CSV. Watch it become ink charts.
          <span className="mt-0.5 block text-ink/55">Nothing is uploaded.</span>
        </p>

        {/* Bottom right CTAs */}
        <div className="absolute right-0 bottom-[8%] z-10 flex flex-col items-end gap-2 text-right sm:bottom-[9%]">
          <Link
            to="/import"
            className={cn(
              "font-display relative inline-block text-lg text-ink sm:text-2xl md:text-[1.75rem]",
              "after:absolute after:inset-x-0 after:bottom-0 after:h-[2.5px] after:bg-ink",
            )}
          >
            Import statement
          </Link>
          <Link
            to={chartsTo}
            className="font-hand text-sm text-ink/55 transition-colors hover:text-ink sm:text-base"
          >
            {chartSession?.transactions.length
              ? "open chart studio →"
              : "import to chart →"}
          </Link>
        </div>
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
