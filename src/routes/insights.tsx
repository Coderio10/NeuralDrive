import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Activity, MapPin, TrendingUp, Zap } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Market Insights — ChargeNG" },
      { name: "description", content: "Charging demand intelligence across Nigerian cities." },
    ],
  }),
  component: Insights,
});

const hourly = [
  { h: "6a", v: 12 }, { h: "8a", v: 28 }, { h: "10a", v: 22 }, { h: "12p", v: 36 },
  { h: "2p", v: 30 }, { h: "4p", v: 44 }, { h: "6p", v: 58 }, { h: "8p", v: 41 },
  { h: "10p", v: 24 }, { h: "12a", v: 10 },
];

const busy = [
  { name: "Wuse II", v: 92 },
  { name: "Lekki P1", v: 86 },
  { name: "VI Energy", v: 78 },
  { name: "Ring Rd", v: 64 },
  { name: "Bodija", v: 51 },
];

const regions = [
  { city: "Lagos", demand: 92, coverage: 68 },
  { city: "Abuja", demand: 71, coverage: 74 },
  { city: "Port Harcourt", demand: 48, coverage: 32 },
  { city: "Ibadan", demand: 41, coverage: 36 },
  { city: "Kano", demand: 28, coverage: 8 },
  { city: "Benin City", demand: 22, coverage: 6 },
];

function Insights() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to map
        </Link>

        <div className="mt-4">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Market intelligence</h1>
          <p className="mt-1 text-sm text-muted-foreground">Operator & investor view — Nigeria EV charging demand.</p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KPI icon={Zap} label="Active stations" value="142" hint="+12 this month" />
          <KPI icon={Activity} label="Sessions today" value="3,284" hint="+8.2% vs yesterday" />
          <KPI icon={TrendingUp} label="Avg uptime" value="96.4%" hint="last 30 days" />
          <KPI icon={MapPin} label="Demand gaps" value="6 cities" hint="under-served regions" />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <section className="rounded-3xl bg-card p-6 shadow-[var(--shadow-soft)] lg:col-span-2">
            <h2 className="text-base font-semibold">Peak usage hours</h2>
            <p className="text-xs text-muted-foreground">Sessions per hour, last 7 days</p>
            <div className="mt-4 h-64">
              <ResponsiveContainer>
                <BarChart data={hourly}>
                  <CartesianGrid strokeDasharray="3 6" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="h" tickLine={false} axisLine={false} fontSize={11} stroke="var(--color-muted-foreground)" />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="var(--color-muted-foreground)" />
                  <Tooltip
                    cursor={{ fill: "var(--color-muted)" }}
                    contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", fontSize: 12 }}
                  />
                  <Bar dataKey="v" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-3xl bg-card p-6 shadow-[var(--shadow-soft)]">
            <h2 className="text-base font-semibold">Busiest stations</h2>
            <div className="mt-4 space-y-3">
              {busy.map((s) => (
                <div key={s.name}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{s.name}</span>
                    <span className="text-muted-foreground">{s.v}%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${s.v}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-4 rounded-3xl bg-card p-6 shadow-[var(--shadow-soft)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Demand vs coverage</h2>
              <p className="text-xs text-muted-foreground">Amber rows indicate under-served regions.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            {regions.map((r) => {
              const gap = r.demand - r.coverage;
              const underserved = gap > 20;
              return (
                <div
                  key={r.city}
                  className="grid grid-cols-12 items-center gap-3 rounded-2xl bg-muted/40 px-4 py-3"
                  style={underserved ? { background: "oklch(0.97 0.06 80)" } : undefined}
                >
                  <div className="col-span-3 text-sm font-medium text-foreground">{r.city}</div>
                  <div className="col-span-7 space-y-1.5">
                    <Bar2 label="Demand" v={r.demand} color="var(--color-primary)" />
                    <Bar2 label="Coverage" v={r.coverage} color="oklch(0.6 0.05 220)" />
                  </div>
                  <div className="col-span-2 text-right text-xs font-semibold" style={{ color: underserved ? "oklch(0.5 0.18 70)" : "var(--color-muted-foreground)" }}>
                    {underserved ? `Gap +${gap}` : `Balanced`}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function KPI({ icon: Icon, label, value, hint }: { icon: typeof Zap; label: string; value: string; hint: string }) {
  return (
    <div className="rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-3.5 w-3.5" />
        </span>
        {label}
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>
    </div>
  );
}

function Bar2({ label, v, color }: { label: string; v: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-card">
        <div className="h-full rounded-full" style={{ width: `${v}%`, background: color }} />
      </div>
      <span className="w-8 text-right text-[11px] font-medium text-foreground">{v}%</span>
    </div>
  );
}