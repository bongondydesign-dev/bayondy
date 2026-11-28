export function parseTimeToSeconds(mmss: string): number {
  const parts = mmss.trim().split(":");
  if (parts.length !== 2) return 0;
  const mins = Number(parts[0]);
  const secs = Number(parts[1]);
  if (!Number.isFinite(mins) || !Number.isFinite(secs) || mins < 0 || secs < 0) {
    return 0;
  }
  return Math.floor(mins) * 60 + Math.floor(secs);
}

export function formatSecondsToTime(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(Number.isFinite(totalSeconds) ? totalSeconds : 0));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function computeLessonProgressPct(elapsedSeconds: number, totalSeconds: number): number {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return 0;
  const ratio = Math.max(0, Math.min(1, elapsedSeconds / totalSeconds));
  return Math.round(ratio * 100);
}

export function computeCourseOverallPct(
  activeIdx: number,
  lessonElapsedSec: number,
  lessonTotalSec: number,
  totalLessons: number
): number {
  if (!Number.isFinite(totalLessons) || totalLessons <= 0) return 0;
  const clampedIdx = Math.max(0, Math.min(totalLessons - 1, activeIdx));
  const currentRatio =
    lessonTotalSec > 0
      ? Math.max(0, Math.min(1, lessonElapsedSec / lessonTotalSec))
      : 0;
  const totalProgress = (clampedIdx + currentRatio) / totalLessons;
  return Math.max(0, Math.min(100, Math.round(totalProgress * 100)));
}

export function clampSeekSeconds(ratio: number, totalSeconds: number): number {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return 0;
  const safeRatio = Math.max(0, Math.min(1, Number.isFinite(ratio) ? ratio : 0));
  return Math.round(safeRatio * totalSeconds);
}

export function getPlaybackSpeedMultiplier(speedLabel: string): number {
  const parsed = Number.parseFloat(speedLabel.replace(/x$/i, ""));
  if (!Number.isFinite(parsed) || parsed <= 0) return 1;
  return parsed;
}
