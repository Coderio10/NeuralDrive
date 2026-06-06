import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Station } from "@/data/stations";
import { StationCard } from "./StationCard";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type Filter = "all" | "available" | "fast" | "24/7" | "free";

const filterOptions: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "available", label: "Available" },
  { id: "fast", label: "Fast Charge" },
  { id: "24/7", label: "24/7" },
  { id: "free", label: "Free" },
];

export function Sidebar({
  stations,
  activeId,
  onSelect,
  onHover,
  query,
  onQuery,
  filter,
  onFilter,
}: {
  stations: Station[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  query: string;
  onQuery: (q: string) => void;
  filter: Filter;
  onFilter: (f: Filter) => void;
}) {
  return (
    <aside className="flex h-full w-[320px] shrink-0 flex-col gap-4 rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
      <Logo />

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Find a charger near you…"
          className="h-11 w-full rounded-2xl bg-muted/50 pl-9 pr-10 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          type="button"
          onClick={() => toast.info("Advanced filters coming soon", { description: "Use the quick filters below for now." })}
          aria-label="Advanced filters"
          className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg bg-card text-muted-foreground shadow-[var(--shadow-soft)] hover:text-foreground"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {filterOptions.map((f) => (
          <button
            key={f.id}
            onClick={() => onFilter(f.id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-[11px] font-medium transition",
              filter === f.id
                ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                : "bg-muted/60 text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{stations.length} stations</span>
        <span>Sorted by distance</span>
      </div>

      <div className="-mr-1.5 flex-1 space-y-2.5 overflow-y-auto pr-1.5">
        {stations.map((s) => (
          <StationCard
            key={s.id}
            station={s}
            active={s.id === activeId}
            onHover={onHover}
            onSelect={onSelect}
          />
        ))}
        {stations.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No stations match your filters.
          </div>
        )}
      </div>
    </aside>
  );
}