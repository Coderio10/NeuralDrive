import { useMemo, useState } from "react";
import { MapPin, Minus, Navigation, Plug, Plus, Zap } from "lucide-react";
import type { Station } from "@/data/stations";
import { cityCenters } from "@/data/stations";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { openDirections } from "@/lib/charge-utils";

type City = keyof typeof cityCenters;

const statusFill: Record<Station["status"], string> = {
  available: "var(--color-status-available)",
  busy: "var(--color-status-busy)",
  offline: "var(--color-status-offline)",
};

function project(lat: number, lng: number, city: City) {
  const center = cityCenters[city];
  // ~0.12° window around the city center
  const span = 0.18;
  const x = ((lng - center.lng) / span + 0.5) * 100;
  const y = ((center.lat - lat) / span + 0.5) * 100;
  return { x: Math.min(96, Math.max(4, x)), y: Math.min(94, Math.max(6, y)) };
}

export function MapView({
  stations,
  city,
  activeId,
  onSelect,
  onHover,
}: {
  stations: Station[];
  city: City;
  activeId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const active = useMemo(() => stations.find((s) => s.id === activeId) ?? null, [stations, activeId]);
  const user = { x: 50, y: 50 };
  const [zoom, setZoom] = useState(1);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-card shadow-[var(--shadow-soft)]">
      {/* Zoomable canvas */}
      <div
        className="absolute inset-0 origin-center transition-transform duration-300"
        style={{ transform: `scale(${zoom})` }}
      >
        <div
          className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, oklch(0.97 0.04 145) 0%, oklch(0.96 0.01 150) 40%, oklch(0.94 0.005 150) 100%)",
        }}
        />
      {/* Grid lines */}
      <svg className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <pattern id="grid" width="56" height="56" patternUnits="userSpaceOnUse">
            <path d="M 56 0 L 0 0 0 56" fill="none" stroke="oklch(0.88 0.01 150)" strokeWidth="0.6" />
          </pattern>
          <pattern id="grid-lg" width="280" height="280" patternUnits="userSpaceOnUse">
            <path d="M 280 0 L 0 0 0 280" fill="none" stroke="oklch(0.82 0.02 150)" strokeWidth="0.8" />
          </pattern>
          <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <rect width="100%" height="100%" fill="url(#grid-lg)" />
        {/* Roads */}
        <g stroke="oklch(0.92 0.005 150)" strokeWidth="14" strokeLinecap="round" opacity="0.9">
          <path d="M -20 220 Q 300 140 700 360" fill="none" />
          <path d="M 120 -20 Q 200 340 480 720" fill="none" />
          <path d="M -20 480 L 800 420" fill="none" />
          <path d="M 560 -20 Q 520 320 760 700" fill="none" />
        </g>
        <g stroke="white" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 14" opacity="0.7">
          <path d="M -20 220 Q 300 140 700 360" fill="none" />
          <path d="M 120 -20 Q 200 340 480 720" fill="none" />
          <path d="M -20 480 L 800 420" fill="none" />
          <path d="M 560 -20 Q 520 320 760 700" fill="none" />
        </g>
        {/* Water shape */}
        <path
          d="M 0 600 Q 220 540 460 620 T 900 600 L 900 800 L 0 800 Z"
          fill="oklch(0.93 0.04 220)"
          opacity="0.7"
        />
      </svg>

      {/* User location */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${user.x}%`, top: `${user.y}%` }}
      >
        <span className="absolute inset-0 -z-10 h-4 w-4 rounded-full bg-sky-400/40 [animation:pulse-ring_1.8s_ease-out_infinite]" />
        <span className="block h-4 w-4 rounded-full border-2 border-white bg-sky-500 shadow-md" />
      </div>

      {/* Pins */}
      {stations.map((s) => {
        const { x, y } = project(s.lat, s.lng, city);
        const isActive = activeId === s.id;
        return (
          <button
            key={s.id}
            type="button"
            onMouseEnter={() => onHover(s.id)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onSelect(s.id)}
            className={cn(
              "group absolute -translate-x-1/2 -translate-y-full transition-transform",
              isActive ? "z-30 scale-110" : "z-10 hover:scale-110",
            )}
            style={{ left: `${x}%`, top: `${y}%` }}
            aria-label={s.name}
          >
            <svg width="34" height="42" viewBox="0 0 34 42" className="drop-shadow-[0_6px_8px_rgba(0,0,0,0.18)]">
              <path
                d="M17 0c9.4 0 17 7.4 17 16.6C34 28 17 42 17 42S0 28 0 16.6C0 7.4 7.6 0 17 0z"
                fill={statusFill[s.status]}
              />
              <circle cx="17" cy="16" r="7" fill="white" />
            </svg>
            <Zap
              className="pointer-events-none absolute left-1/2 top-[14px] h-3.5 w-3.5 -translate-x-1/2"
              style={{ color: statusFill[s.status] }}
              fill="currentColor"
            />
          </button>
        );
      })}
      </div>

      {/* City label */}
      <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-card/90 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-[var(--shadow-soft)] backdrop-blur">
        <MapPin className="h-3.5 w-3.5 text-primary" /> {city}, Nigeria
      </div>

      {/* Active station floating card */}
      {active && (
        <div className="pointer-events-auto absolute inset-x-4 bottom-4 mx-auto max-w-md rounded-2xl bg-card p-4 shadow-[var(--shadow-elevated)] ring-1 ring-border">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-foreground">{active.name}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {active.operator} · {active.distanceKm.toFixed(1)} km
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Plug className="h-3 w-3" /> {active.connectors.join(" · ")}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Zap className="h-3 w-3 text-primary" /> {active.powerKw} kW
                </span>
                <span>{active.pricePerKwh === 0 ? "Free" : `₦${active.pricePerKwh}/kWh`}</span>
              </div>
            </div>
            <div
              className="rounded-full px-2.5 py-1 text-[11px] font-medium text-white"
              style={{ backgroundColor: statusFill[active.status] }}
            >
              {active.status === "available" ? "Open now" : active.status === "busy" ? `~${active.waitMins} min` : "Offline"}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <Link
              to="/station/$id"
              params={{ id: active.id }}
              className="text-xs font-medium text-foreground/70 hover:text-foreground"
            >
              View station →
            </Link>
            <button
              type="button"
              onClick={() => openDirections(active)}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow)] hover:brightness-105"
            >
              <Navigation className="h-3.5 w-3.5" /> Navigate
            </button>
          </div>
        </div>
      )}

      {/* Map controls */}
      <div className="absolute right-4 top-4 flex flex-col gap-2">
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => setZoom((z) => Math.min(2, +(z + 0.15).toFixed(2)))}
          className="grid h-9 w-9 place-items-center rounded-xl bg-card text-foreground shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-elevated)]"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.15).toFixed(2)))}
          className="grid h-9 w-9 place-items-center rounded-xl bg-card text-foreground shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-elevated)]"
        >
          <Minus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}