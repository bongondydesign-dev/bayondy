import test from "node:test";
import assert from "node:assert/strict";
import { parsePositiveIntLimit } from "./pagination";

test("parsePositiveIntLimit clamps valid numbers and falls back safely on NaN/non-positive inputs", () => {
  assert.equal(parsePositiveIntLimit(null, 50, 50), 50);
  assert.equal(parsePositiveIntLimit("", 50, 50), 50);
  assert.equal(parsePositiveIntLimit("abc", 50, 50), 50);
  assert.equal(parsePositiveIntLimit("-5", 50, 50), 50);
  assert.equal(parsePositiveIntLimit("0", 50, 50), 50);
  assert.equal(parsePositiveIntLimit("12", 50, 50), 12);
  assert.equal(parsePositiveIntLimit("999", 50, 50), 50);
});
