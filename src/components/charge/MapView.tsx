import { useMemo, useState, useEffect, useRef } from "react";
import {
  Bike,
  Footprints,
  MapPin,
  Minus,
  Navigation,
  Plug,
  Plus,
  Zap,
} from "lucide-react";
import type { Station } from "@/data/stations";
import { cityCenters } from "@/data/stations";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

type RouteMode = "driving" | "walking" | "cycling";

type City = keyof typeof cityCenters;

type Country = "Nigeria";


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
  if (type === "roundabout")
    return `Enter roundabout${exit ? ` and take exit ${exit}` : ""}${rotary_name ? ` onto ${rotary_name}` : name ? ` onto ${name}` : ""}`;
  if (type === "merge") return `Merge ${modifier ?? ""}${name ? ` onto ${name}` : ""}`;
  if (type === "continue") return `Continue ${modifier ?? ""}${name ? ` on ${name}` : ""}`;
  if (type === "turn") return `Turn ${modifier ?? ""}${name ? ` onto ${name}` : ""}`;
  if (type === "fork") return `Take the ${modifier ?? ""} fork${name ? ` onto ${name}` : ""}`;
  return `${type ? `${type.charAt(0).toUpperCase() + type.slice(1)}${modifier ? ` ${modifier}` : ""}` : "Follow the route"}${name ? ` onto ${name}` : ""}`;
}

const statusFill: Record<Station["status"], string> = {
  available: "var(--color-status-available)",
  busy: "var(--color-status-busy)",
  offline: "var(--color-status-offline)",
};

// Leaflet circleMarker colors (fallback to CSS vars converted to safe colors if needed)
const statusStroke: Record<Station["status"], string> = {
  available: "#B2FF59", // green
  busy: "#FFD600", // amber
  offline: "#FF6D00", // red/offline
};

export function MapView({
  stations,
  city,
  country,

  activeId,
  onSelect,
  onHover,
}: {
  stations: Station[];
  city: City;
  country: Country;

  activeId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const active = useMemo(() => stations.find((s) => s.id === activeId) ?? null, [stations, activeId]);

  const [zoom, setZoom] = useState(1);
  const [routeMode, setRouteMode] = useState<RouteMode>("driving");
  const [routeTargetId, setRouteTargetId] = useState<string | null>(null);
  const [instructions, setInstructions] = useState<Array<{ label: string; distance: number; duration: number }>>([]);
  const [routeSummary, setRouteSummary] = useState<{ distance: number; duration: number } | null>(null);

  // OSRM route -> for animated "vehicle" we keep the old percent-based animation state
  const rafRef = useRef<number | null>(null);
  const distancesRef = useRef<number[]>([]);
  const totalDistRef = useRef<number>(0);

  // Leaflet refs
  const mapHostRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any | null>(null);
  const leafletReadyRef = useRef(false);
  const stationMarkersRef = useRef<Record<string, any>>({});
  const routePolylineRef = useRef<any | null>(null);
  const routeVehicleMarkerRef = useRef<any | null>(null);

  // Minimal animation overlay (we'll keep the same state names but drive them by map polyline coords)
  const [vehiclePos, setVehiclePos] = useState<{ x: number; y: number } | null>(null);
  const [vehicleHeading, setVehicleHeading] = useState(0);
  const [pathPoints, setPathPoints] = useState<Array<[number, number]>>([]); // percent-like points (legacy) for existing animation logic

  const [userLatLng, setUserLatLng] = useState<{ lat: number; lng: number } | null>(null);

  function project(lat: number, lng: number, cityName: City) {
    const center = cityCenters[cityName];
    const span = 0.18;
    const x = ((lng - center.lng) / span + 0.5) * 100;
    const y = ((center.lat - lat) / span + 0.5) * 100;
    return { x: Math.min(96, Math.max(4, x)), y: Math.min(94, Math.max(6, y)) };
  }

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

  // Dynamically load Leaflet assets via CDN
  useEffect(() => {
    if (typeof window === "undefined") return;

    const L = (window as any).L;
    if (L) {
      leafletReadyRef.current = true;
      return;
    }

    const cssHref = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    const jsSrc = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

    const ensureLink = () => {
      if (document.querySelector(`link[href="${cssHref}"]`)) return;
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = cssHref;
      document.head.appendChild(link);
    };

    const ensureScript = () => {
      if (document.querySelector(`script[src="${jsSrc}"]`)) return;
      const script = document.createElement("script");
      script.src = jsSrc;
      script.async = true;
      script.onload = () => {
        leafletReadyRef.current = true;
      };
      document.head.appendChild(script);
    };

    ensureLink();
    ensureScript();
  }, []);

  // Get user's real GPS location
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLatLng({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        // fall back to city center when denied
        setUserLatLng({ lat: cityCenters[city].lat, lng: cityCenters[city].lng });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 },
    );
  }, [city]);

  // Initialize Leaflet map once
  useEffect(() => {
    if (!leafletReadyRef.current) return;
    if (!mapHostRef.current) return;
    if (mapRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    const center = userLatLng ?? cityCenters[city];

    const map = L.map(mapHostRef.current, {
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: true,
    }).setView([center.lat, center.lng], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    mapRef.current = map;

    // Push overlays beneath overlay UI, above tiles
    // (Leaflet sets its own container z-index; we explicitly keep it low.)
    const leafletRoot = map.getContainer();
    leafletRoot.style.zIndex = "0";

    // Create a vehicle marker used when route is active
    routeVehicleMarkerRef.current = L.circleMarker([center.lat, center.lng], {
      radius: 7,
      color: "var(--color-primary)",
      fillColor: "var(--color-primary)",
      fillOpacity: 1,
      weight: 2,
    });

    routeVehicleMarkerRef.current.addTo(map);

    // Initial sizing for Leaflet
    setTimeout(() => map.invalidateSize(), 0);
  }, [city, userLatLng]);

  // Ensure map pans when city changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const center = cityCenters[city];
    map.panTo([center.lat, center.lng]);
  }, [city]);

  // Ensure map pans when active station changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!activeId) return;
    const s = stations.find((st) => st.id === activeId);
    if (!s) return;
    map.panTo([s.lat, s.lng]);
  }, [activeId, stations]);

  // Render/update station pins
  useEffect(() => {
    if (!leafletReadyRef.current) return;
    const map = mapRef.current;
    if (!map) return;

    // remove stale markers
    const existingIds = Object.keys(stationMarkersRef.current);
    const nextIds = new Set(stations.map((s) => s.id));

    existingIds.forEach((id) => {
      if (!nextIds.has(id)) {
        const marker = stationMarkersRef.current[id];
        if (marker) marker.remove();
        delete stationMarkersRef.current[id];
      }
    });

    stations.forEach((s) => {
      const color = statusStroke[s.status];
      const radius = s.id === activeId ? 10 : 8;

      if (!stationMarkersRef.current[s.id]) {
        const marker = (window as any).L.circleMarker([s.lat, s.lng], {
          radius,
          color,
          fillColor: color,
          fillOpacity: 0.9,
          weight: 2,
        });

        marker.on("click", () => {
          onSelect(s.id);
        });

        marker.bindPopup(
          `<div style="font-family:monospace;max-width:220px">` +
            `<strong>${s.name}</strong><br/>` +
            `${s.address || ""}<br/>` +
            `<span style="color:${color}">● ${s.status}</span><br/>` +
            `Points: ${s.connectors.length}<br/>` +
            `</div>`,
        );

        marker.addTo(map);
        stationMarkersRef.current[s.id] = marker;
      } else {
        const marker = stationMarkersRef.current[s.id];
        marker.setLatLng([s.lat, s.lng]);
        marker.setStyle({
          radius,
          color,
          fillColor: color,
          fillOpacity: 0.9,
        });
      }
    });
  }, [stations, activeId, onSelect]);

  // Fetch route from OSRM (public) when routeTargetId changes
  useEffect(() => {
    let mounted = true;

    if (!routeTargetId) {
      setPathPoints([]);
      setVehiclePos(null);
      setInstructions([]);
      setRouteSummary(null);
      if (routePolylineRef.current) {
        routePolylineRef.current.remove();
        routePolylineRef.current = null;
      }
      if (routeVehicleMarkerRef.current) {
        routeVehicleMarkerRef.current.setLatLng([
          (userLatLng ?? cityCenters[city]).lat,
          (userLatLng ?? cityCenters[city]).lng,
        ]);
      }

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

        // Map polyline uses real lat/lng
        const latLngs: Array<[number, number]> = coords.map(([lng, lat]) => [lat, lng]);

        // For legacy animation logic we also create projected points (percent coordinates)
        const projectedPts = coords.map(([lng, lat]) => {
          const p = project(lat, lng, city);
          return [p.x, p.y] as [number, number];
        });

        setPathPoints(projectedPts);
        setVehiclePos({ x: projectedPts[0][0], y: projectedPts[0][1] });


        // Draw/remove polyline on Leaflet
        const map = mapRef.current;
        if (map) {
          if (routePolylineRef.current) routePolylineRef.current.remove();
          routePolylineRef.current = (window as any).L.polyline(latLngs, {
            color: "var(--color-primary)",
            weight: 4,
            opacity: 0.9,
          }).addTo(map);

          // Fit route bounds
          try {
            map.fitBounds(routePolylineRef.current.getBounds(), { padding: [40, 40] });
          } catch {
            // ignore
          }
        }

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
        for (let i = 0; i + 1 < projectedPts.length; i++) {
          const dx = projectedPts[i + 1][0] - projectedPts[i][0];
          const dy = projectedPts[i + 1][1] - projectedPts[i][1];
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
        if (routePolylineRef.current) {
          routePolylineRef.current.remove();
          routePolylineRef.current = null;
        }
      });

    return () => {
      mounted = false;
    };
  }, [routeTargetId, stations, city, routeMode, userLatLng]);

  // Animate vehicle along pathPoints (legacy percent coords)
  useEffect(() => {
    if (!pathPoints || pathPoints.length < 2) return;

    let last = performance.now();
    let traveled = 0;
    const speed = 18;

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
        const angle = Math.atan2(lastPoint[1] - final[1], lastPoint[0] - final[0]) * (180 / Math.PI);
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

      const x = a[0] + (b[0] - a[0]) * t;
      const y = a[1] + (b[1] - a[1]) * t;
      setVehiclePos({ x, y });

      const angle = Math.atan2(b[1] - a[1], b[0] - a[0]) * (180 / Math.PI);
      setVehicleHeading(angle);

      rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [pathPoints]);

  // Drive mode button zoom + pan behavior still uses zoom state
  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-card shadow-[var(--shadow-soft)]">
      {/* Leaflet map */}
      <div
        ref={mapHostRef}
        className="absolute inset-0"
        style={{ zIndex: 0 }}
      />

      {/* overlays above tiles */}
      {/* City label */}
      <div className="absolute left-5 top-5 z-[999] inline-flex items-center gap-2 rounded-full bg-card/90 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-[var(--shadow-soft)] backdrop-blur">
        <MapPin className="h-3.5 w-3.5 text-primary" /> {country}, Nigeria
      </div>

      {/* Active station floating card */}
      {active && (
        <div className="pointer-events-auto absolute inset-x-4 bottom-4 z-[999] mx-auto max-w-md rounded-2xl bg-card p-4 shadow-[var(--shadow-elevated)] ring-1 ring-border">
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
            <Link to="/station/$id" params={{ id: active.id }} className="text-xs font-medium text-foreground/70 hover:text-foreground">
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

      {/* Route summary card */}
      {routeTargetId && routeSummary && (
        <div className="pointer-events-auto absolute left-4 bottom-28 z-[999] w-full max-w-sm rounded-3xl bg-card/95 p-4 shadow-[var(--shadow-elevated)] ring-1 ring-border backdrop-blur">
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

      {/* Map controls (wire zoom buttons to Leaflet zoom) */}
      <div className="absolute right-4 top-4 z-[999] flex flex-col gap-2">
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
          onClick={() => {
            setZoom((z) => Math.min(2, +(z + 0.15).toFixed(2)));
            const map = mapRef.current;
            if (map) map.zoomIn();
          }}
          className="grid h-9 w-9 place-items-center rounded-xl bg-card text-foreground shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-elevated)]"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => {
            setZoom((z) => Math.max(0.6, +(z - 0.15).toFixed(2)));
            const map = mapRef.current;
            if (map) map.zoomOut();
          }}
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

      {/* Legacy vehicle overlay remains for now; it doesn't block UI and keeps existing visuals */}
      {vehiclePos && (
        <div
          className="pointer-events-none absolute z-[999]"
          style={{
            left: `${vehiclePos.x}%`,
            top: `${vehiclePos.y}%`,
            transform: `translate(-50%, -50%) rotate(${vehicleHeading}deg)`,
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.2)]"
          >
            <path
              d="M3 11h1l1-3h12l1 3h1v6a1 1 0 0 1-1 1h-1l-1-2H6l-1 2H4a1 1 0 0 1-1-1v-6z"
              fill="var(--color-primary)"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

