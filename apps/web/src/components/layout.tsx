import { HandArrowScribble } from "@/components/hand-arrow";
import { OfflineBadge } from "@/components/offline-badge";
import { useVault } from "@/db/vault";
import { cn } from "@/lib/utils";
import {
  Analytics01Icon,
  BookOpen01Icon,
  Home01Icon,
  Settings01Icon,
  TransactionHistoryIcon,
  Upload04Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

const baseLinks = [
  { to: "/", label: "Home", end: true, icon: Home01Icon },
  { to: "/import", label: "Import", icon: Upload04Icon },
  { to: "/transactions", label: "Transactions", icon: TransactionHistoryIcon },
  { to: "/charts", label: "Charts", icon: Analytics01Icon },
  { to: "/docs", label: "Docs", icon: BookOpen01Icon },
  { to: "/settings", label: "Settings", icon: Settings01Icon },
] as const;

export function AppLayout() {
  const { pathname } = useLocation();
  const { chartSession } = useVault();
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
          <div className="mt-5 mb-5 ml-5 flex w-16 shrink-0 flex-col items-center gap-1 rounded-full border border-ink/20 bg-white/40 px-1.5 py-3 backdrop-blur-xl">
            <div className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border border-ink/25">
              <span className="font-display text-base leading-none tracking-wider text-ink">
                F
              </span>
            </div>

            <nav className="flex flex-1 flex-col items-center gap-1">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={"end" in link ? link.end : false}
                  title={link.label}
                  className={({ isActive }) =>
                    cn(
                      "flex size-11 items-center justify-center rounded-full transition-colors",
                      isActive
                        ? "bg-ink text-paper"
                        : "text-ink/65 hover:bg-ink/10 hover:text-ink",
                    )
                  }
                >
                  <HugeiconsIcon
                    icon={link.icon}
                    size={24}
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <span className="sr-only">{link.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div
            className={cn(
              "pointer-events-none my-5 ml-3 w-0 overflow-hidden opacity-0",
              "rounded-3xl border border-ink/20 bg-white/45 backdrop-blur-xl",
              "transition-[width,opacity] duration-300 ease-out",
              "group-hover/sidebar:pointer-events-auto group-hover/sidebar:w-52 group-hover/sidebar:opacity-100",
            )}
          >
            <div className="flex h-full w-52 flex-col py-4">
              <div className="mb-3 px-4 pb-2">
                <p className="font-display text-lg text-ink">Funds</p>
                <p className="font-hand mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
                  <HandArrowScribble />
                  local-first
                </p>
              </div>

              <nav className="flex flex-1 flex-col gap-0.5 px-2">
                {links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={"end" in link ? link.end : false}
                    className={({ isActive }) =>
                      cn(
                        "mb-3 rounded-full px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-ink text-paper"
                          : "text-ink/70 hover:bg-ink/10 hover:text-ink",
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
        </aside>
      ) : null}

      <div
        className={cn(
          "mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 pt-6 pb-24 sm:px-6 lg:px-8",
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
