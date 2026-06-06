import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock, Flag, MapPin, Navigation, Plug, Star, Zap } from "lucide-react";
import { getStation, type Port, type Review } from "@/data/stations";
import { StatusBadge } from "@/components/charge/StatusBadge";
import { cn } from "@/lib/utils";
import { directionsUrl } from "@/lib/charge-utils";
import { toast } from "sonner";

export const Route = createFileRoute("/station/$id")({
  loader: ({ params }) => {
    const station = getStation(params.id);
    if (!station) throw notFound();
    return { station };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.station.name} — ChargeNG` },
          { name: "description", content: `Live status, ports, pricing and reviews for ${loaderData.station.name}.` },
          { property: "og:title", content: `${loaderData.station.name} — ChargeNG` },
          { property: "og:image", content: loaderData.station.image },
        ]
      : [],
  }),
  component: StationPage,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center bg-background p-6 text-center">
      <div>
        <h1 className="text-xl font-semibold">Station not found</h1>
        <Link to="/" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
          ← Back to map
        </Link>
      </div>
    </div>
  ),
  errorComponent: () => (
    <div className="grid min-h-screen place-items-center bg-background p-6 text-center">
      <div>
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <Link to="/" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
          ← Back to map
        </Link>
      </div>
    </div>
  ),
});

function StationPage() {
  const { station } = Route.useLoaderData();
  const total = station.ports.length;
  const free = station.ports.filter((p: Port) => !p.occupied).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to map
        </Link>

        <div className="mt-4 overflow-hidden rounded-3xl bg-card shadow-[var(--shadow-soft)]">
          <div
            className="h-56 w-full bg-cover bg-center sm:h-72"
            style={{ backgroundImage: `linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.55)), url(${station.image})` }}
          />
          <div className="-mt-12 px-6 pb-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <StatusBadge status={station.status} className="bg-card shadow-[var(--shadow-soft)]" />
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {station.name}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <span>{station.operator}</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {station.address}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {station.rating.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    toast.success("Report submitted", {
                      description: `Thanks — our team will check ${station.name} shortly.`,
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                >
                  <Flag className="h-3.5 w-3.5" /> Report issue
                </button>
                <a
                  href={directionsUrl(station)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow)] hover:brightness-105"
                >
                  <Navigation className="h-3.5 w-3.5" /> Directions
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <section className="md:col-span-2 rounded-3xl bg-card p-6 shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Live availability</h2>
              <div className="text-xs text-muted-foreground">
                {station.status === "offline"
                  ? "Station offline"
                  : `${free} of ${total} ports available`}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {station.ports.map((p: Port) => (
                <div
                  key={p.id}
                  className={cn(
                    "rounded-2xl p-3 text-xs",
                    p.occupied
                      ? "bg-[oklch(0.95_0.03_27)] text-[oklch(0.45_0.18_27)]"
                      : "bg-[oklch(0.95_0.07_145)] text-[oklch(0.35_0.15_145)]",
                  )}
                >
                  <div className="text-[10px] uppercase tracking-wider opacity-70">Port {p.id.toUpperCase()}</div>
                  <div className="mt-1 font-semibold">{p.type}</div>
                  <div className="mt-1 text-[10px]">{p.occupied ? "Occupied" : "Free"}</div>
                </div>
              ))}
            </div>

            {station.status === "busy" && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[oklch(0.97_0.08_80)] px-3 py-2 text-xs font-medium text-[oklch(0.4_0.13_70)]">
                <Clock className="h-3.5 w-3.5" /> Estimated wait ~{station.waitMins} min
              </div>
            )}
          </section>

          <section className="rounded-3xl bg-card p-6 shadow-[var(--shadow-soft)]">
            <h2 className="text-base font-semibold">Specs</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <Spec icon={Plug} label="Connectors" value={station.connectors.join(", ")} />
              <Spec icon={Zap} label="Max power" value={`${station.powerKw} kW`} />
              <Spec
                icon={MapPin}
                label="Pricing"
                value={station.pricePerKwh === 0 ? "Free" : `₦${station.pricePerKwh}/kWh`}
              />
              <Spec icon={Clock} label="Hours" value={station.open24 ? "Open 24/7" : "Open 7am – 10pm"} />
            </dl>
          </section>
        </div>

        <section className="mt-6 rounded-3xl bg-card p-6 shadow-[var(--shadow-soft)]">
          <h2 className="text-base font-semibold">Reviews</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {station.reviews.map((r: Review, i: number) => (
              <div key={i} className="rounded-2xl bg-muted/40 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{r.user}</div>
                  <div className="inline-flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, k) => (
                      <Star
                        key={k}
                        className={cn(
                          "h-3.5 w-3.5",
                          k < r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40",
                        )}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Spec({ icon: Icon, label, value }: { icon: typeof Plug; label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-right text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}