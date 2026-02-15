export type PendingRun = {
  level: number;
  time: number;
  rating: string;
  createdAt: number;
};

const KEY = "super-slide:pending-run";

export function savePendingRun(run: PendingRun) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(run));
}

export function loadPendingRun(): PendingRun | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingRun;
  } catch {
    return null;
  }
}

export function clearPendingRun() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
