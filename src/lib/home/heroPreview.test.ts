import test from "node:test";
import assert from "node:assert/strict";
import {
  clampSeekSeconds,
  computeCourseOverallPct,
  computeLessonProgressPct,
  formatSecondsToTime,
  getPlaybackSpeedMultiplier,
  parseTimeToSeconds,
} from "./heroPreview";

test("parseTimeToSeconds and formatSecondsToTime round-trip cleanly", () => {
  assert.equal(parseTimeToSeconds("03:12"), 192);
  assert.equal(parseTimeToSeconds("12:45"), 765);
  assert.equal(parseTimeToSeconds("invalid"), 0);

  assert.equal(formatSecondsToTime(192), "03:12");
  assert.equal(formatSecondsToTime(765), "12:45");
  assert.equal(formatSecondsToTime(-10), "00:00");
});

test("computeLessonProgressPct clamps between 0 and 100", () => {
  assert.equal(computeLessonProgressPct(192, 765), 25);
  assert.equal(computeLessonProgressPct(0, 765), 0);
  assert.equal(computeLessonProgressPct(900, 765), 100);
  assert.equal(computeLessonProgressPct(10, 0), 0);
});

test("computeCourseOverallPct reflects completed lessons plus active progress", () => {
  assert.equal(computeCourseOverallPct(0, 0, 765, 3), 0);
  assert.equal(computeCourseOverallPct(0, 765, 765, 3), 33);
  assert.equal(computeCourseOverallPct(1, 550, 1100, 3), 50);
  assert.equal(computeCourseOverallPct(2, 1450, 1450, 3), 100);
});

test("clampSeekSeconds and getPlaybackSpeedMultiplier handle edge values", () => {
  assert.equal(clampSeekSeconds(0.5, 765), 383);
  assert.equal(clampSeekSeconds(-0.4, 765), 0);
  assert.equal(clampSeekSeconds(1.5, 765), 765);

  assert.equal(getPlaybackSpeedMultiplier("1x"), 1);
  assert.equal(getPlaybackSpeedMultiplier("1.25x"), 1.25);
  assert.equal(getPlaybackSpeedMultiplier("1.5x"), 1.5);
  assert.equal(getPlaybackSpeedMultiplier("bad"), 1);
});
