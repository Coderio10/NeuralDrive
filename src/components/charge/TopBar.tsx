import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, ChevronDown, LayoutDashboard, LineChart, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type City = "Lagos" | "Abuja" | "Port Harcourt" | "Ibadan";
export type ViewMode = "map" | "list";

const cities: City[] = ["Lagos", "Abuja", "Port Harcourt", "Ibadan"];

export function TopBar({
  city,
  onCityChange,
  view,
  onViewChange,
  onSignIn,
}: {
  city: City;
  onCityChange: (c: City) => void;
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  onSignIn: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navItems = [
    { to: "/", label: "Map", icon: Map },
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/insights", label: "Insights", icon: LineChart },
  ] as const;

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-card px-4 py-2.5 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-2">
        <div className="relative">
          <select
            value={city}
            onChange={(e) => onCityChange(e.target.value as City)}
            className="h-9 cursor-pointer appearance-none rounded-xl border border-border bg-muted/40 pl-3 pr-8 text-sm font-medium text-foreground outline-none transition focus:ring-2 focus:ring-primary/30"
          >
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        </div>

        <div className="inline-flex h-9 items-center rounded-xl bg-muted/50 p-1">
          {(["map", "list"] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={cn(
                "rounded-lg px-3 text-xs font-medium capitalize transition",
                view === v
                  ? "bg-card text-foreground shadow-[var(--shadow-soft)]"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {v} view
            </button>
          ))}
        </div>
      </div>

      <nav className="hidden items-center gap-1 md:flex">
        {navItems.map((n) => {
          const Icon = n.icon;
          const active = pathname === n.to;
          return (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" /> {n.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Notifications"
          onClick={() =>
            toast("No new notifications", {
              description: "You're all caught up — we'll ping you when a saved station opens up.",
            })
          }
          className="grid h-9 w-9 place-items-center rounded-xl bg-muted/50 text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
        </button>
        <button
          onClick={onSignIn}
          className="hidden h-9 items-center gap-2 rounded-xl bg-foreground px-3 text-xs font-semibold text-background transition hover:opacity-90 sm:inline-flex"
        >
          Sign in
        </button>
        <Link
          to="/dashboard"
          aria-label="Open your dashboard"
          className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-[oklch(0.55_0.18_160)] text-xs font-semibold text-primary-foreground transition hover:brightness-110"
        >
          AO
        </Link>
      </div>
    </div>
  );
}