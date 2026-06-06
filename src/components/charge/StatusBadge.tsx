import type { StationStatus } from "@/data/stations";
import { cn } from "@/lib/utils";

const labels: Record<StationStatus, string> = {
  available: "Available",
  busy: "Busy",
  offline: "Offline",
};

const dot: Record<StationStatus, string> = {
  available: "bg-status-available",
  busy: "bg-status-busy",
  offline: "bg-status-offline",
};

export function StatusBadge({ status, className }: { status: StationStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-muted/70 px-2.5 py-1 text-[11px] font-medium text-foreground",
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dot[status])} />
      {labels[status]}
    </span>
  );
}