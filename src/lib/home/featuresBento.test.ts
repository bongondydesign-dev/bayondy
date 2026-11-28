import test from "node:test";
import assert from "node:assert/strict";
import {
  computeMilestoneProgressPct,
  computeOrbitalAngle,
  computeProgressArcOffset,
  formatStreamClock,
} from "./featuresBento";

test("computeMilestoneProgressPct maps 3 checkpoints accurately", () => {
  assert.equal(computeMilestoneProgressPct(0, 3), 33);
  assert.equal(computeMilestoneProgressPct(1, 3), 67);
  assert.equal(computeMilestoneProgressPct(2, 3), 100);
  assert.equal(computeMilestoneProgressPct(9, 3), 100);
  assert.equal(computeMilestoneProgressPct(-1, 3), 33);
});

test("computeProgressArcOffset calculates SVG dashoffset cleanly", () => {
  const circ = 251.33;
  assert.equal(computeProgressArcOffset(100, circ), 0);
  assert.equal(computeProgressArcOffset(0, circ), circ);
  assert.equal(computeProgressArcOffset(50, 200), 100);
});

test("computeOrbitalAngle rotates evenly around 360 degrees", () => {
  assert.equal(computeOrbitalAngle(0, 3), 0);
  assert.equal(computeOrbitalAngle(1, 3), 120);
  assert.equal(computeOrbitalAngle(2, 3), 240);
  assert.equal(computeOrbitalAngle(3, 3), 0);
});

test("formatStreamClock formats mm:ss with leading zeroes", () => {
  assert.equal(formatStreamClock(258), "04:18");
  assert.equal(formatStreamClock(0), "00:00");
  assert.equal(formatStreamClock(-12), "00:00");
});
