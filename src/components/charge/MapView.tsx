import { useMemo, useState, useEffect, useRef } from "react";
import { Bike, Footprints, MapPin, Minus, Navigation, Plug, Plus, Zap } from "lucide-react";
import type { Station } from "@/data/stations";
import { cityCenters } from "@/data/stations";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

type RouteMode = "driving" | "walking" | "cycling";

function formatDistance(meters: number) {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
}

function formatDuration(seconds: number) {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function buildInstruction(step: any) {
  const { maneuver, name, rotary_name, exit } = step;
  const type = maneuver?.type;
  const modifier = maneuver?.modifier;

  if (type === "depart") return `Head ${modifier ?? "forward"}${name ? ` on ${name}` : ""}`;
  if (type === "arrive") return `Arrive at destination${name ? ` on ${name}` : ""}`;
  if (type === "roundabout") return `Enter roundabout${exit ? ` and take exit ${exit}` : ""}${rotary_name ? ` onto ${rotary_name}` : name ? ` onto ${name}` : ""}`;
  if (type === "merge") return `Merge ${modifier ?? ""}${name ? ` onto ${name}` : ""}`;
  if (type === "continue") return `Continue ${modifier ?? ""}${name ? ` on ${name}` : ""}`;
  if (type === "turn") return `Turn ${modifier ?? ""}${name ? ` onto ${name}` : ""}`;
  if (type === "fork") return `Take the ${modifier ?? ""} fork${name ? ` onto ${name}` : ""}`;
  return `${type ? `${type.charAt(0).toUpperCase() + type.slice(1)}${modifier ? ` ${modifier}` : ""}` : "Follow the route"}${name ? ` onto ${name}` : ""}`;
}

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
  const [routeMode, setRouteMode] = useState<RouteMode>("driving");
  const [routeTargetId, setRouteTargetId] = useState<string | null>(null);
  const [pathPoints, setPathPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [vehiclePos, setVehiclePos] = useState<{ x: number; y: number } | null>(null);
  const [vehicleHeading, setVehicleHeading] = useState(0);
  const [instructions, setInstructions] = useState<Array<{ label: string; distance: number; duration: number }>>([]);
  const [routeSummary, setRouteSummary] = useState<{ distance: number; duration: number } | null>(null);
  const rafRef = useRef<number | null>(null);
  const distancesRef = useRef<number[]>([]);
  const totalDistRef = useRef<number>(0);

  // If the station page sent a pending navigation, restore it after mount.
  useEffect(() => {
    const pending = window.localStorage.getItem("navigate-to-station");
    if (pending) {
      onSelect(pending);
      setRouteTargetId(pending);
      window.localStorage.removeItem("navigate-to-station");
    }
  }, [onSelect]);

  // Listen for in-app navigation events (station page -> map)
  useEffect(() => {
    function onNavigate(e: Event) {
      const detail = (e as CustomEvent).detail as { id: string } | undefined;
      if (!detail?.id) return;
      onSelect(detail.id);
      setRouteTargetId(detail.id);
    }
    window.addEventListener("navigate-to-station", onNavigate as EventListener);
    return () => window.removeEventListener("navigate-to-station", onNavigate as EventListener);
  }, [onSelect]);

  // Fetch route from OSRM (public) when routeTargetId changes
  useEffect(() => {
    let mounted = true;
    if (!routeTargetId) {
      setPathPoints([]);
      setVehiclePos(null);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }
    const target = stations.find((s) => s.id === routeTargetId);
    if (!target) return;

    const origin = cityCenters[city];
    const osrm = (import.meta.env.VITE_OSRM_URL as string) || "https://router.project-osrm.org";
    const url = `${osrm}/route/v1/${routeMode}/${origin.lng},${origin.lat};${target.lng},${target.lat}?overview=full&geometries=geojson&steps=true`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        const route = data?.routes?.[0];
        const coords: Array<[number, number]> = route?.geometry?.coordinates || [];
        const pts = coords.map(([lng, lat]) => project(lat, lng, city));
        setPathPoints(pts);
        if (pts.length > 0) setVehiclePos(pts[0]);

        const legs = route?.legs || [];
        const steps = legs?.[0]?.steps || [];
        setInstructions(
          steps.map((step: any) => ({
            label: buildInstruction(step),
            distance: step.distance || 0,
            duration: step.duration || 0,
          })),
        );
        setRouteSummary({
          distance: route?.distance ?? 0,
          duration: route?.duration ?? 0,
        });

        const dists: number[] = [];
        let total = 0;
        for (let i = 0; i + 1 < pts.length; i++) {
          const dx = pts[i + 1].x - pts[i].x;
          const dy = pts[i + 1].y - pts[i].y;
          const d = Math.hypot(dx, dy);
          dists.push(d);
          total += d;
        }
        distancesRef.current = dists;
        totalDistRef.current = total;
      })
      .catch(() => {
        setPathPoints([]);
        setVehiclePos(null);
        setInstructions([]);
        setRouteSummary(null);
      });

    return () => {
      mounted = false;
    };
  }, [routeTargetId, stations, city, routeMode]);

  // Animate vehicle along pathPoints
  useEffect(() => {
    if (!pathPoints || pathPoints.length < 2) return;
    let last = performance.now();
    let traveled = 0; // percent units along route length
    const speed = 18; // percent units per second

    function step(now: number) {
      const dt = Math.max(0, now - last) / 1000;
      last = now;
      traveled += speed * dt;

      const total = totalDistRef.current || 0;
      if (total <= 0) return;
      if (traveled >= total) {
        setVehiclePos(pathPoints[pathPoints.length - 1]);
        const final = pathPoints[pathPoints.length - 2] ?? pathPoints[pathPoints.length - 1];
        const lastPoint = pathPoints[pathPoints.length - 1];
        const angle = Math.atan2(lastPoint.y - final.y, lastPoint.x - final.x) * (180 / Math.PI);
        setVehicleHeading(angle);
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        return;
      }

      let acc = 0;
      let idx = 0;
      while (idx < distancesRef.current.length && acc + distancesRef.current[idx] < traveled) {
        acc += distancesRef.current[idx];
        idx++;
      }

      const segDist = distancesRef.current[idx] || 0.0001;
      const t = Math.min(1, (traveled - acc) / segDist);
      const a = pathPoints[idx] ?? pathPoints[0];
      const b = pathPoints[idx + 1] ?? a;
      const x = a.x + (b.x - a.x) * t;
      const y = a.y + (b.y - a.y) * t;
      setVehiclePos({ x, y });
      const angle = Math.atan2(b.y - a.y, b.x - a.x) * (180 / Math.PI);
      setVehicleHeading(angle);

      rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [pathPoints]);

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
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
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

      {/* Route overlay (drawn from fetched route points if available, otherwise fallback curve) */}
      <svg className="absolute inset-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto" markerUnits="strokeWidth">
            <path d="M0 0 L8 4 L0 8 z" fill="var(--color-primary)" />
          </marker>
        </defs>
        {/** fallback: simple curve if no precise route fetched */}
        {routeTargetId && pathPoints.length === 0 && (() => {
          const target = stations.find((s) => s.id === routeTargetId);
          if (!target) return null;
          const { x: tx, y: ty } = project(target.lat, target.lng, city);
          const sx = user.x;
          const sy = user.y;
          const cx = (sx + tx) / 2;
          const cy = Math.min(98, Math.max(2, (sy + ty) / 2 - 8));
          const d = `M ${sx} ${sy} Q ${cx} ${cy} ${tx} ${ty}`;
          return (
            <g>
              <path d={d} fill="none" stroke="var(--color-primary)" strokeWidth={0.9} strokeLinecap="round" strokeLinejoin="round" opacity={0.95} markerEnd="url(#arrow)" />
              <circle cx={tx} cy={ty} r={1.4} fill="white" stroke="var(--color-primary)" strokeWidth={0.35} />
            </g>
          );
        })()}
      </svg>

      {/* If we have a precise path, render polyline and animated vehicle */}
      {pathPoints.length > 0 && (
        <svg className="absolute inset-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <polyline
            points={pathPoints.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth={0.9}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.95}
          />
          <circle cx={pathPoints[pathPoints.length - 1].x} cy={pathPoints[pathPoints.length - 1].y} r={1.2} fill="white" stroke="var(--color-primary)" strokeWidth={0.35} />
        </svg>
      )}

      {vehiclePos && (
        <div
          className="pointer-events-none absolute"
          style={{
            left: `${vehiclePos.x}%`,
            top: `${vehiclePos.y}%`,
            transform: `translate(-50%, -50%) rotate(${vehicleHeading}deg)`,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.2)]">
            <path d="M3 11h1l1-3h12l1 3h1v6a1 1 0 0 1-1 1h-1l-1-2H6l-1 2H4a1 1 0 0 1-1-1v-6z" fill="var(--color-primary)" />
          </svg>
        </div>
      )}

      {routeTargetId && routeSummary && (
        <div className="pointer-events-auto absolute left-4 bottom-28 w-full max-w-sm rounded-3xl bg-card/95 p-4 shadow-[var(--shadow-elevated)] ring-1 ring-border backdrop-blur">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <div className="text-xs text-muted-foreground">{routeMode.charAt(0).toUpperCase() + routeMode.slice(1)} route</div>
              <div className="text-sm font-semibold text-foreground">
                {formatDistance(routeSummary.distance)} · {formatDuration(routeSummary.duration)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setRouteTargetId(null)}
              className="rounded-full bg-card p-2 text-foreground shadow-[var(--shadow-soft)] hover:bg-muted"
            >
              Clear
            </button>
          </div>
          <ol className="space-y-2 text-xs text-muted-foreground">
            {instructions.slice(0, 6).map((step, index) => (
              <li key={index} className="rounded-2xl bg-muted/70 p-3">
                <div className="font-medium text-foreground">{step.label}</div>
                <div className="mt-1 text-[10px] text-muted-foreground">
                  {formatDistance(step.distance)} · {formatDuration(step.duration)}
                </div>
              </li>
            ))}
            {instructions.length > 6 && (
              <li className="text-right text-[10px] font-medium text-primary">+{instructions.length - 6} more steps</li>
            )}
          </ol>
        </div>
      )}

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
              onMouseLeave={() => {
                if (activeId !== s.id) onHover(null);
              }}
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
              onClick={() => {
                if (!active) return;
                onSelect(active.id);
                setRouteTargetId(active.id);
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow)] hover:brightness-105"
            >
              <Navigation className="h-3.5 w-3.5" /> Navigate
            </button>
          </div>
        </div>
      )}

      {/* Map controls */}
      <div className="absolute right-4 top-4 flex flex-col gap-2">
        <div className="grid grid-cols-3 gap-2 rounded-3xl bg-card/95 p-2 shadow-[var(--shadow-soft)]">
          <button
            type="button"
            aria-label="Driving"
            onClick={() => setRouteMode("driving")}
            className={cn(
              "grid h-9 w-9 place-items-center rounded-2xl text-foreground shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-elevated)]",
              routeMode === "driving" ? "bg-primary text-primary-foreground" : "bg-card",
            )}
          >
            <Navigation className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Walking"
            onClick={() => setRouteMode("walking")}
            className={cn(
              "grid h-9 w-9 place-items-center rounded-2xl text-foreground shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-elevated)]",
              routeMode === "walking" ? "bg-primary text-primary-foreground" : "bg-card",
            )}
          >
            <Footprints className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Cycling"
            onClick={() => setRouteMode("cycling")}
            className={cn(
              "grid h-9 w-9 place-items-center rounded-2xl text-foreground shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-elevated)]",
              routeMode === "cycling" ? "bg-primary text-primary-foreground" : "bg-card",
            )}
          >
            <Bike className="h-4 w-4" />
          </button>
        </div>
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
        <button
          type="button"
          aria-label={routeTargetId ? "Clear route" : "Show route to selected"}
          onClick={() => {
            if (routeTargetId) setRouteTargetId(null);
            else if (active) setRouteTargetId(active.id);
          }}
          className="grid h-9 w-9 place-items-center rounded-xl bg-card text-foreground shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-elevated)]"
        >
          <Navigation className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
