import { HandArrow, HandArrowScribble } from "@/components/hand-arrow";
import { useVault } from "@/db/vault";
import { cn, formatMoney } from "@/lib/utils";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

const LETTERS = ["F", "u", "n", "d", "s"] as const;

export function HomePage() {
  const { txCount, cashflow, account, chartSession } = useVault();
  const latest = cashflow[cashflow.length - 1];
  const chartsTo = chartSession?.transactions.length ? "/charts" : "/import";

  return (
    <div className="space-y-20">
      <section className="relative min-h-[calc(100dvh-5rem)] w-full overflow-hidden">
        {/* Kinetic ink splatches */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute top-[18%] left-[8%] size-24 rounded-full bg-ink/[0.04] blur-2xl sm:size-40"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute right-[10%] bottom-[22%] size-32 rounded-full bg-ink/[0.05] blur-3xl sm:size-48"
          animate={{ scale: [1.1, 0.95, 1.1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Diagonal scrap banner */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          aria-hidden
          className="pointer-events-none absolute top-[12%] -left-4 z-[5] -rotate-6 sm:top-[14%] sm:left-0"
        >
          <p className="font-hand border border-ink/30 bg-paper/80 px-3 py-1 text-sm text-ink shadow-[2px_2px_0_rgba(17,17,17,0.12)] backdrop-blur-sm sm:text-base">
            ★ private by architecture
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
          No cloud
          <span className="mt-1 block tracking-[0.2em] text-ink/45">2026</span>
        </motion.p>

        {/* CENTER — readable FUNDS with stagger + print offset */}
        <div className="absolute top-[40%] left-1/2 z-10 w-[min(100%,58rem)] -translate-x-1/2 -translate-y-1/2 text-center">
          {/* Ghost misprint layer */}
          <motion.p
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.12 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="font-display pointer-events-none absolute inset-0 translate-x-[0.12em] translate-y-[0.06em] text-[clamp(3.75rem,15vw,9.5rem)] leading-none tracking-[-0.04em] text-ink select-none"
          >
            Funds
          </motion.p>

          <h1 className="font-display relative text-[clamp(3.75rem,15vw,9.5rem)] leading-none tracking-[-0.04em] text-ink">
            <span className="sr-only">Funds</span>
            <span className="inline-flex" aria-hidden>
              {LETTERS.map((letter, i) => (
                <motion.span
                  key={`${letter}-${i}`}
                  initial={{ opacity: 0, y: 48, rotate: i % 2 === 0 ? -6 : 6 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{
                    delay: 0.08 + i * 0.07,
                    duration: 0.55,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={{
                    y: -10,
                    rotate: i % 2 === 0 ? -4 : 4,
                    transition: { type: "spring", stiffness: 400, damping: 14 },
                  }}
                  className="inline-block cursor-default"
                >
                  {letter}
                </motion.span>
              ))}
            </span>
          </h1>

          {/* Hand scribble underline that draws in */}
          <motion.svg
            viewBox="0 0 320 24"
            className="mx-auto mt-2 h-5 w-[min(90%,28rem)] text-ink sm:h-6"
            fill="none"
            aria-hidden
          >
            <motion.path
              d="M8 14 C 60 4, 120 22, 160 10 C 200 -2, 250 18, 312 8"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.9, ease: "easeOut" }}
            />
          </motion.svg>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="font-hand mt-4 text-xl text-ink sm:text-2xl"
          >
            your statements. your machine.
          </motion.p>
        </div>

        {/* MID-LEFT note */}
        <motion.div
          initial={{ opacity: 0, x: -16, rotate: -4 }}
          animate={{ opacity: 1, x: 0, rotate: -2 }}
          transition={{ delay: 0.45, duration: 0.55 }}
          className="font-hand absolute top-[24%] left-0 z-10 max-w-[12rem] text-base leading-snug text-ink sm:top-[26%] sm:max-w-[14rem] sm:text-lg"
        >
          <motion.span
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block"
          >
            <HandArrow direction="up-right" className="mb-1 h-12 rotate-12" />
          </motion.span>
          your vault never leaves this tab
        </motion.div>

        {/* MID-RIGHT note */}
        <motion.div
          initial={{ opacity: 0, x: 16, rotate: 4 }}
          animate={{ opacity: 1, x: 0, rotate: 2 }}
          transition={{ delay: 0.52, duration: 0.55 }}
          className="font-hand absolute top-[26%] right-0 z-10 max-w-[11rem] text-right text-base leading-snug text-ink sm:max-w-[13rem] sm:text-lg"
        >
          <span className="inline-flex flex-col items-end">
            <motion.span
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <HandArrowScribble className="mb-1 scale-x-[-1]" />
            </motion.span>
            parse · chart · export
          </span>
        </motion.div>

        {/* Spinning ink stamp */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6, rotate: -24 }}
          animate={{ opacity: 1, scale: 1, rotate: -12 }}
          transition={{ delay: 0.7, type: "spring", stiffness: 180, damping: 14 }}
          className="pointer-events-none absolute top-[58%] right-[4%] z-[5] hidden select-none sm:block md:right-[8%]"
          aria-hidden
        >
          <motion.div
            animate={{ rotate: [-12, -8, -12] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="flex size-28 items-center justify-center rounded-full border-[3px] border-dashed border-ink/50 md:size-32"
          >
            <div className="flex size-[5.25rem] items-center justify-center rounded-full border-2 border-ink/35 md:size-[6.5rem]">
              <p className="font-hand text-center text-xs leading-tight text-ink md:text-sm">
                DEVICE
                <br />
                ONLY
                <br />
                ★
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* BOTTOM LEFT */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="font-hand absolute bottom-16 left-0 z-10 max-w-[17rem] text-lg leading-snug text-ink sm:bottom-20 sm:max-w-sm sm:text-xl md:bottom-24"
        >
          Drop a statement. Chart it. Export Excel.
          <span className="mt-1 block text-ink/60">Nothing is uploaded. Ever.</span>
        </motion.p>

        {/* BOTTOM RIGHT CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.62 }}
          className="absolute right-0 bottom-16 z-10 flex flex-col items-end gap-3 text-right sm:bottom-20 md:bottom-24"
        >
          <Link
            to="/import"
            className={cn(
              "font-display group relative inline-block text-xl text-ink sm:text-2xl md:text-3xl",
              "after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:origin-left after:bg-ink",
              "after:transition-transform after:duration-300 hover:after:scale-x-110",
            )}
          >
            Import statement
            <span
              className="font-hand absolute -top-6 -left-2 -rotate-8 text-sm text-ink/70 opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden
            >
              go!
            </span>
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
