import { OfflineBadge } from "@/components/offline-badge";
import { cn } from "@/lib/utils";
import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/import", label: "Import" },
  { to: "/transactions", label: "Transactions" },
  { to: "/charts", label: "Charts" },
  { to: "/settings", label: "Settings" },
];

export function AppLayout() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 pb-24 pt-6 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-4xl tracking-tight text-ink sm:text-5xl">
            Funds
          </p>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Processing happens only on your device. We never receive your
            statements.
          </p>
        </div>
        <nav className="flex flex-wrap gap-1 rounded-2xl border border-border/80 bg-white/50 p-1 backdrop-blur">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  "rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <OfflineBadge />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
