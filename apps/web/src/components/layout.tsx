import { HandArrowScribble } from "@/components/hand-arrow";
import { OfflineBadge } from "@/components/offline-badge";
import {
  SidebarBrand,
  SidebarFlyout,
  SidebarRail,
  flyoutLinkClass,
  railLinkClass,
} from "@/components/sidebar-chrome";
import { useVault } from "@/db/vault";
import { cn } from "@/lib/utils";
import {
  Analytics01Icon,
  BookOpen01Icon,
  ChartIcon,
  Home01Icon,
  Settings01Icon,
  TransactionHistoryIcon,
  Upload04Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

const baseLinks = [
  { to: "/", label: "Home", end: true, icon: Home01Icon, hint: "start" },
  { to: "/import", label: "Import", icon: Upload04Icon, hint: "CSV →" },
  {
    to: "/transactions",
    label: "Transactions",
    icon: TransactionHistoryIcon,
    hint: "rows",
  },
  { to: "/charts", label: "Charts", icon: Analytics01Icon, hint: "viz ★" },
  { to: "/docs", label: "Docs", icon: BookOpen01Icon, hint: "read" },
  { to: "/settings", label: "Settings", icon: Settings01Icon, hint: "gear" },
] as const;

export function AppLayout() {
  const { pathname } = useLocation();
  const { chartSession, txCount } = useVault();
  const hasChartSession = Boolean(chartSession?.transactions.length);
  const isChartsStudio = pathname.startsWith("/charts") && hasChartSession;
  const isHome = pathname === "/";

  const links = hasChartSession
    ? baseLinks
    : baseLinks.filter((link) => link.to !== "/charts");

  return (
    <div className="relative min-h-dvh w-full">
      {!isChartsStudio ? (
        <aside
          className="group/sidebar fixed top-0 bottom-0 left-0 z-50 flex items-stretch"
          aria-label="Main navigation"
        >
          <SidebarRail>
            <Link
              to="/"
              title="Home"
              className="relative z-10 mb-2 flex size-12 shrink-0 items-center justify-center rounded-full transition-transform hover:-rotate-6 hover:scale-105"
            >
              <HugeiconsIcon icon={ChartIcon} size={22} strokeWidth={1.6} />
              <span className="sr-only">Funds home</span>
            </Link>

            <nav className="relative z-10 flex flex-1 flex-col items-center gap-1.5 mt-8">
              {links.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <NavLink
                    to={link.to}
                    end={"end" in link ? link.end : false}
                    title={link.label}
                    className={({ isActive }) => railLinkClass(isActive)}
                  >
                    <HugeiconsIcon
                      icon={link.icon}
                      size={22}
                      strokeWidth={1.6}
                      aria-hidden
                    />
                    <span className="sr-only">{link.label}</span>
                  </NavLink>
                </motion.div>
              ))}
            </nav>
          </SidebarRail>

          <SidebarFlyout
            widthClass="group-hover/sidebar:w-56"
            innerWidthClass="w-56"
          >
            <SidebarBrand title="Funds" note="local-first vault" />

            <nav className="flex flex-1 flex-col px-2">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={"end" in link ? link.end : false}
                  className={({ isActive }) => flyoutLinkClass(isActive)}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span>{link.label}</span>
                    <span className="text-xs opacity-60">{link.hint}</span>
                  </span>
                </NavLink>
              ))}
            </nav>

            <div className="mt-auto px-4 pt-3">
              <p className="font-hand text-xs leading-snug text-ink/50">
                {txCount
                  ? `${txCount} rows ready to chart`
                  : "import a CSV to wake the charts"}
              </p>
              <p className="font-hand mt-2 -rotate-2 text-[11px] text-ink/40">
                device only ★
              </p>
            </div>
          </SidebarFlyout>
        </aside>
      ) : null}

      <div
        className={cn(
          "mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 pt-6 pb-24 sm:px-6 lg:px-8",
          isChartsStudio && "max-w-7xl",
          "pl-[6.5rem] sm:pl-28",
        )}
      >
        {!isChartsStudio && !isHome ? (
          <header className="mb-8">
            <p className="font-display text-6xl leading-none text-ink sm:text-7xl md:text-8xl">
              Funds
            </p>
            <p className="font-hand mt-3 flex items-start gap-2 text-xl text-ink-soft">
              <HandArrowScribble className="mt-1" />
              <span>
                Processing happens only on your device. We never receive your
                statements.
              </span>
            </p>
          </header>
        ) : null}
        {!isChartsStudio ? <OfflineBadge /> : null}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
