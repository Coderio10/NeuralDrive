import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, User, Briefcase, LineChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { toast } from "sonner";

type Role = "Driver" | "Operator" | "Investor";

export function AuthModal({
  open,
  onOpenChange,
  onAuthed,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onAuthed?: (role: Role) => void;
}) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<Role>("Driver");
  const [email, setEmail] = useState("");

  const roles: { id: Role; icon: typeof User; desc: string }[] = [
    { id: "Driver", icon: User, desc: "Find chargers & track sessions" },
    { id: "Operator", icon: Briefcase, desc: "Manage stations & uptime" },
    { id: "Investor", icon: LineChart, desc: "View market intelligence" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl border-0 p-0 shadow-[var(--shadow-elevated)] sm:max-w-md">
        <div className="p-6">
          <DialogHeader className="space-y-3">
            <Logo />
            <DialogTitle className="text-xl">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {mode === "login"
                ? "Sign in to access live charger status and your dashboard."
                : "Join thousands of Nigerian EV drivers powering smarter journeys."}
            </p>
          </DialogHeader>

          {mode === "signup" && (
            <div className="mt-5">
              <Label className="text-xs text-muted-foreground">I am a…</Label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {roles.map((r) => {
                  const Icon = r.icon;
                  const active = role === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setRole(r.id)}
                      className={cn(
                        "rounded-2xl border bg-card p-3 text-left transition-all",
                        active
                          ? "border-primary/50 shadow-[var(--shadow-glow)]"
                          : "border-border hover:border-primary/30",
                      )}
                    >
                      <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
                      <div className="mt-2 text-xs font-semibold text-foreground">{r.id}</div>
                      <div className="mt-0.5 text-[10px] leading-tight text-muted-foreground">{r.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <form
            className="mt-5 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              onAuthed?.(role);
              onOpenChange(false);
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-muted-foreground">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-11 rounded-xl pl-9"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs text-muted-foreground">Password</Label>
              <Input id="password" type="password" required placeholder="••••••••" className="h-11 rounded-xl" />
            </div>

            <button
              type="submit"
              className="h-11 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-105"
            >
              {mode === "login" ? "Sign in" : "Create account"}
            </button>

            <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
            </div>

            <button
              type="button"
              onClick={() => {
                toast("Google sign-in", {
                  description: "Connect Lovable Cloud to enable real Google authentication.",
                });
                onAuthed?.(role);
                onOpenChange(false);
              }}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-medium text-foreground transition hover:bg-muted"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M21.6 12.227c0-.71-.064-1.39-.182-2.045H12v3.868h5.39a4.605 4.605 0 0 1-2 3.022v2.51h3.235c1.894-1.745 2.985-4.314 2.985-7.355z"/><path fill="#34A853" d="M12 22c2.7 0 4.965-.895 6.62-2.418l-3.235-2.51c-.895.6-2.04.955-3.385.955-2.605 0-4.81-1.76-5.595-4.123H3.064v2.59A9.996 9.996 0 0 0 12 22z"/><path fill="#FBBC05" d="M6.405 13.905A6.013 6.013 0 0 1 6.09 12c0-.66.113-1.302.314-1.905V7.505H3.064A9.996 9.996 0 0 0 2 12c0 1.614.386 3.14 1.064 4.495l3.34-2.59z"/><path fill="#EA4335" d="M12 5.972c1.468 0 2.786.505 3.823 1.495l2.868-2.868C16.96 2.99 14.695 2 12 2A9.996 9.996 0 0 0 3.064 7.505l3.34 2.59C7.19 7.732 9.395 5.972 12 5.972z"/></svg>
              Continue with Google
            </button>

            <div className="text-center text-xs text-muted-foreground">
              {mode === "login" ? "New here? " : "Have an account? "}
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="font-semibold text-primary hover:underline"
              >
                {mode === "login" ? "Create an account" : "Sign in"}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}