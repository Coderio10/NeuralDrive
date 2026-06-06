import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Clock, Navigation, Plug, Zap } from "lucide-react";
import type { Station } from "@/data/stations";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";
import { directionsUrl } from "@/lib/charge-utils";

export function StationCard({
  station,
  active,
  onHover,
  onSelect,
}: {
  station: Station;
  active?: boolean;
  onHover?: (id: string | null) => void;
  onSelect?: (id: string) => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onMouseEnter={() => onHover?.(station.id)}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onSelect?.(station.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.(station.id);
        }
      }}
      className={cn(
        "group w-full cursor-pointer rounded-2xl border border-transparent bg-card p-4 text-left shadow-[var(--shadow-soft)] transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        "hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]",
        active && "border-primary/40 shadow-[var(--shadow-elevated)] ring-1 ring-primary/30",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-foreground">{station.name}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {station.operator} · {station.distanceKm.toFixed(1)} km away
          </div>
        </div>
        <StatusBadge status={station.status} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Plug className="h-3 w-3" /> {station.connectors.join(" · ")}
        </span>
        <span className="inline-flex items-center gap-1">
          <Zap className="h-3 w-3 text-primary" /> {station.powerKw} kW
        </span>
        {station.status !== "available" && station.waitMins > 0 && (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> ~{station.waitMins} min wait
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <Link
          to="/station/$id"
          params={{ id: station.id }}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-xs font-medium text-foreground/70 hover:text-foreground"
        >
          View details <ArrowUpRight className="h-3 w-3" />
        </Link>
        <a
          href={directionsUrl(station)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition group-hover:brightness-105"
        >
          <Navigation className="h-3 w-3" /> Directions
        </a>
      </div>
    </div>
  );
}