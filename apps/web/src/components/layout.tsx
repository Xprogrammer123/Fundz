import { OfflineBadge } from "@/components/offline-badge";
import { cn } from "@/lib/utils";
import {
  Analytics01Icon,
  BookOpen01Icon,
  Home01Icon,
  ListViewIcon,
  Settings01Icon,
  Upload04Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/", label: "Home", end: true, icon: Home01Icon },
  { to: "/import", label: "Import", icon: Upload04Icon },
  { to: "/transactions", label: "Transactions", icon: ListViewIcon },
  { to: "/charts", label: "Charts", icon: Analytics01Icon },
  { to: "/docs", label: "Docs", icon: BookOpen01Icon },
  { to: "/settings", label: "Settings", icon: Settings01Icon },
] as const;

export function AppLayout() {
  return (
    <div className="relative min-h-dvh w-full">
      <aside
        className={cn(
          "group/sidebar fixed inset-y-0 left-0 z-50 flex w-18 flex-col border-r border-white/20 bg-white/[0.04] backdrop-blur-xl",
          "transition-[width] duration-300 ease-out hover:w-56",
        )}
        aria-label="Main navigation"
      >
        <div className="flex h-16 items-center gap-3 px-3.5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/25">
            <span className="font-display text-base leading-none tracking-wider text-white">
              F
            </span>
          </div>
          <div
            className={cn(
              "min-w-0 overflow-hidden opacity-0 transition-opacity duration-200",
              "group-hover/sidebar:opacity-100",
            )}
          >
            <p className="font-display truncate text-lg text-white">Funds</p>
            <p className="font-hand truncate text-sm text-white/55">local-first</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-2.5 py-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={"end" in link ? link.end : false}
              title={link.label}
              className={({ isActive }) =>
                cn(
                  "flex h-12 items-center gap-3 rounded-xl px-2.5 transition-colors",
                  isActive
                    ? "bg-white text-[#0a0a0a]"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                )
              }
            >
              <HugeiconsIcon
                icon={link.icon}
                size={28}
                strokeWidth={1.5}
                className="shrink-0"
                aria-hidden
              />
              <span
                className={cn(
                  "truncate text-sm font-medium opacity-0 transition-opacity duration-200",
                  "group-hover/sidebar:opacity-100",
                )}
              >
                {link.label}
              </span>
            </NavLink>
          ))}
        </nav>

        <p
          className={cn(
            "px-4 pb-4 text-[11px] leading-snug text-white/40 opacity-0 transition-opacity duration-200",
            "group-hover/sidebar:opacity-100",
          )}
        >
          Data stays on this device.
        </p>
      </aside>

      <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 pt-6 pb-24 pl-[5.5rem] sm:px-6 sm:pl-24 lg:px-8">
        <header className="mb-8">
          <p className="font-display text-6xl leading-none text-ink sm:text-7xl md:text-8xl">
            Funds
          </p>
          <p className="font-hand mt-3 max-w-xl text-xl text-ink-soft">
            Processing happens only on your device. We never receive your
            statements.
          </p>
        </header>
        <OfflineBadge />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
