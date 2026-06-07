export type DashboardUser = {
  name: string;
  createdAt: number;
};

export const USER_STORAGE_KEY = "nd:user";

export type UserSessionStats = {
  // total milliseconds across all visits to the platform
  totalMs: number;
  // timestamp when the current session started
  activeSince: number | null;
};

export const SESSION_STATS_KEY = "nd:session-stats";

function safeParseJSON<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function getStoredUser(): DashboardUser | null {
  if (typeof window === "undefined") return null;
  return safeParseJSON<DashboardUser>(window.localStorage.getItem(USER_STORAGE_KEY));
}

export function setStoredUser(user: DashboardUser) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function getStoredSessionStats(): UserSessionStats {
  if (typeof window === "undefined") return { totalMs: 0, activeSince: null };
  const parsed = safeParseJSON<UserSessionStats>(window.localStorage.getItem(SESSION_STATS_KEY));
  return parsed ?? { totalMs: 0, activeSince: null };
}

export function setStoredSessionStats(stats: UserSessionStats) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_STATS_KEY, JSON.stringify(stats));
}

export function formatMs(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

