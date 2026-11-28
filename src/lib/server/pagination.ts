export function parsePositiveIntLimit(
  rawValue: string | null,
  fallback = 50,
  max = 50
): number {
  if (!rawValue) return fallback;
  const parsed = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.min(parsed, max);
}
