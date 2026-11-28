export function computeMilestoneProgressPct(index: number, total: number): number {
  if (total <= 0) return 0;
  const clampedIdx = Math.max(0, Math.min(total - 1, index));
  return Math.round(((clampedIdx + 1) / total) * 100);
}

export function computeProgressArcOffset(percent: number, circumference: number): number {
  if (circumference <= 0) return 0;
  const clampedPct = Math.max(0, Math.min(100, percent));
  return Number((circumference * (1 - clampedPct / 100)).toFixed(2));
}

export function computeOrbitalAngle(index: number, total: number): number {
  if (total <= 0) return 0;
  const normalizedIdx = ((index % total) + total) % total;
  return Math.round((normalizedIdx / total) * 360);
}

export function formatStreamClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}
