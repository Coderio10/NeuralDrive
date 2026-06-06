import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Battery, Bookmark, Leaf, Wallet, Zap } from "lucide-react";
import { stations } from "@/data/stations";
import { StatusBadge } from "@/components/charge/StatusBadge";
import { useRef, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Driver Dashboard — ChargeNG" },
      { name: "description", content: "Your charging history, savings and saved stations." },
    ],
  }),
  component: Dashboard,
});

const sessions = [
  { date: "06 Jun 2026", station: "Lekki Phase 1 Hub", duration: "42 min", kwh: 28, cost: 6160 },
  { date: "03 Jun 2026", station: "Wuse II Power Plaza", duration: "18 min", kwh: 22, cost: 5280 },
  { date: "30 May 2026", station: "Yaba Tech Park", duration: "55 min", kwh: 34, cost: 0 },
  { date: "27 May 2026", station: "Bodija Main Hub", duration: "28 min", kwh: 19, cost: 4180 },
  { date: "22 May 2026", station: "Ikoyi Bridge Fast Lane", duration: "12 min", kwh: 25, cost: 7000 },
];

function Dashboard() {
  const saved = stations.slice(0, 4);
  const sessionsRef = useRef<HTMLDivElement>(null);
  const [showAll, setShowAll] = useState(false);
  const [threshold, setThreshold] = useState(20);
  const totals = sessions.reduce(
    (a, s) => ({ kwh: a.kwh + s.kwh, cost: a.cost + s.cost }),
    { kwh: 0, cost: 0 },
  );
  const visibleSessions = showAll ? sessions : sessions.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to map
        </Link>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Welcome back, Ada</h1>
            <p className="mt-1 text-sm text-muted-foreground">Your charging activity at a glance.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={Zap} label="Total charges" value={String(sessions.length * 7)} hint="this year" />
          <Stat icon={Battery} label="kWh consumed" value={`${totals.kwh * 7}`} hint="≈ 6,400 km driven" />
          <Stat icon={Leaf} label="CO₂ saved" value={`${(totals.kwh * 7 * 0.42).toFixed(0)} kg`} hint="vs petrol equivalent" />
          <Stat icon={Wallet} label="Money spent" value={`₦${(totals.cost * 7).toLocaleString()}`} hint="all-time" />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <section ref={sessionsRef} className="rounded-3xl bg-card p-6 shadow-[var(--shadow-soft)] lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Recent sessions</h2>
              <button
                type="button"
                onClick={() => {
                  setShowAll((v) => !v);
                  setTimeout(() => sessionsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
                }}
                className="text-xs font-medium text-primary hover:underline"
              >
                {showAll ? "Show less" : "View all"}
              </button>
            </div>
            <div className="mt-4 divide-y divide-border">
              {visibleSessions.map((s) => (
                <div key={s.date} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <div className="truncate font-medium text-foreground">{s.station}</div>
                    <div className="text-xs text-muted-foreground">{s.date} · {s.duration}</div>
                  </div>
                  <div className="flex items-center gap-6 text-xs">
                    <div className="text-muted-foreground"><span className="font-semibold text-foreground">{s.kwh}</span> kWh</div>
                    <div className="w-20 text-right font-semibold text-foreground">
                      {s.cost === 0 ? "Free" : `₦${s.cost.toLocaleString()}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-card p-6 shadow-[var(--shadow-soft)]">
            <h2 className="text-base font-semibold">Battery reminder</h2>
            <p className="mt-1 text-xs text-muted-foreground">Get suggestions when battery drops below your threshold.</p>
            <BatteryDial value={threshold} />
            <input
              type="range"
              min={5}
              max={50}
              step={5}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="mt-3 w-full accent-[color:var(--color-primary)]"
              aria-label="Battery alert threshold"
            />
            <button
              type="button"
              onClick={() =>
                toast.success("Preference saved", {
                  description: `We'll alert you when battery drops below ${threshold}%.`,
                })
              }
              className="mt-4 h-10 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] hover:brightness-105"
            >
              Save preference
            </button>
          </section>
        </div>

        <section className="mt-4 rounded-3xl bg-card p-6 shadow-[var(--shadow-soft)]">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Saved stations</h2>
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {saved.map((s) => (
              <Link
                key={s.id}
                to="/station/$id"
                params={{ id: s.id }}
                className="rounded-2xl bg-muted/40 p-4 transition hover:bg-muted/70"
              >
                <StatusBadge status={s.status} />
                <div className="mt-2 text-sm font-semibold">{s.name}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{s.operator} · {s.city}</div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Zap;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-3.5 w-3.5" />
        </span>
        {label}
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{value}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>
    </div>
  );
}

function BatteryDial({ value }: { value: number }) {
  const r = 56;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="mt-4 grid place-items-center">
      <div className="relative">
        <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90">
          <circle cx="80" cy="80" r={r} stroke="var(--color-muted)" strokeWidth="14" fill="none" />
          <circle
            cx="80" cy="80" r={r}
            stroke="var(--color-primary)"
            strokeWidth="14"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={c}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className="text-3xl font-semibold text-foreground">{value}%</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">alert at</div>
          </div>
        </div>
      </div>
    </div>
  );
}