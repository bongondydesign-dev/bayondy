import test from "node:test";
import assert from "node:assert/strict";
import {
  MONCASH_BUTTON_IMAGE_SRC,
  MONCASH_MARK_SIZES,
  MONCASH_SEAMLESS_MASK_STYLE,
  formatMonCashAmountHTG,
} from "./buttonDisplay";
import { formatPrice } from "../courses/format";

test("formatMonCashAmountHTG formats positive HTG amounts cleanly", () => {
  assert.equal(formatMonCashAmountHTG(1300), "1 300 HTG");
  assert.equal(formatMonCashAmountHTG(2500), "2 500 HTG");
  assert.equal(formatMonCashAmountHTG(750.4), "750 HTG");
  assert.equal(formatMonCashAmountHTG(12500), "12 500 HTG");
});

test("formatPrice matches formatMonCashAmountHTG for identical HTG amounts", () => {
  const coursePrice = formatPrice(10, 1300);
  assert.equal(coursePrice.formattedHTG, formatMonCashAmountHTG(1300));
  assert.equal(coursePrice.formattedUSD, "$10 USD");
});

test("formatMonCashAmountHTG returns null for missing or non-positive amounts", () => {
  assert.equal(formatMonCashAmountHTG(null), null);
  assert.equal(formatMonCashAmountHTG(undefined), null);
  assert.equal(formatMonCashAmountHTG(0), null);
  assert.equal(formatMonCashAmountHTG(-100), null);
  assert.equal(formatMonCashAmountHTG(Number.NaN), null);
  assert.equal(formatMonCashAmountHTG(Number.POSITIVE_INFINITY), null);
});

test("MONCASH_MARK_SIZES and seamless mask keep crisp aspect ratio", () => {
  for (const key of ["sm", "md", "lg"] as const) {
    const { width, height } = MONCASH_MARK_SIZES[key];
    const ratio = width / height;
    assert.ok(ratio >= 3.1 && ratio <= 3.16, `Unexpected ratio ${ratio} for ${key}`);
  }
  assert.equal(
    MONCASH_BUTTON_IMAGE_SRC,
    "/assets/aistudio/rs_w_1280_e5a11620.webp"
  );
  assert.ok(MONCASH_SEAMLESS_MASK_STYLE.maskImage.includes("linear-gradient"));
});
