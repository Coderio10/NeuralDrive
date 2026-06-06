import { Zap } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)]">
        <Zap className="h-5 w-5" fill="currentColor" />
      </div>
      {!compact && (
        <div className="leading-tight">
          <div className="text-base font-semibold tracking-tight text-foreground">
            ChargeNG
          </div>
          <div className="text-[11px] text-muted-foreground">Power Your Journey</div>
        </div>
      )}
    </div>
  );
}