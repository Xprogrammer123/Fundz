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
    label: "Txns",
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

  // Bottom bar on phones
  const mobileLinks = links;

  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden">
      {/* Desktop left rail */}
      {!isChartsStudio ? (
        <aside
          className="group/sidebar fixed top-0 bottom-0 left-0 z-50 hidden items-stretch md:flex"
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

            <nav className="relative z-10 mt-8 flex flex-1 flex-col items-center gap-1.5 overflow-y-auto">
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
                    <span>{link.label === "Txns" ? "Transactions" : link.label}</span>
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

      {/* Mobile bottom tab bar */}
      {!isChartsStudio ? (
        <nav
          className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-ink/20 bg-paper/95 px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden"
          aria-label="Mobile navigation"
        >
          <ul className="mx-auto flex max-w-lg items-stretch justify-between gap-0.5">
            {mobileLinks.map((link) => (
              <li key={link.to} className="min-w-0 flex-1">
                <NavLink
                  to={link.to}
                  end={"end" in link ? link.end : false}
                  className={({ isActive }) =>
                    cn(
                      "font-hand flex flex-col items-center gap-0.5 rounded-2xl px-1 py-1.5 text-[10px] transition-colors",
                      isActive
                        ? "bg-ink text-paper"
                        : "text-ink/60 active:bg-ink/8",
                    )
                  }
                >
                  <HugeiconsIcon
                    icon={link.icon}
                    size={18}
                    strokeWidth={1.6}
                    aria-hidden
                  />
                  <span className="truncate">{link.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <div
        className={cn(
          "mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8",
          // Room for bottom tabs on phones; left rail only from md up
          "pb-[calc(5.25rem+env(safe-area-inset-bottom))] md:pb-10",
          isChartsStudio
            ? "max-w-7xl pb-8 pl-4 sm:pl-6 md:pl-28"
            : "md:pl-28",
        )}
      >
        {!isChartsStudio && !isHome ? (
          <header className="mb-6 sm:mb-8">
            <p className="font-display text-4xl leading-none text-ink sm:text-6xl md:text-7xl lg:text-8xl">
              Funds
            </p>
            <p className="font-hand mt-2 flex items-start gap-2 text-base text-ink-soft sm:mt-3 sm:text-xl">
              <HandArrowScribble className="mt-1 hidden sm:inline" />
              <span>
                Processing happens only on your device. We never receive your
                statements.
              </span>
            </p>
          </header>
        ) : null}
        {!isChartsStudio ? <OfflineBadge /> : null}
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
