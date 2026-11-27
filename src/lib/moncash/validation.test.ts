import test from "node:test";
import assert from "node:assert/strict";
import {
  buildMonCashCreateHeaders,
  createMonCashOrderId,
  isMonCashSuccessStatus,
  isSafePaymentRedirectUrl,
  mapMonCashUpstreamError,
  ORDER_ID_REGEX,
  validateMonCashCreateInput,
} from "./validation";

test("validateMonCashCreateInput accepts valid integer HTG order payload", () => {
  const result = validateMonCashCreateInput(
    {
      amount: 2500,
      orderId: "order_12345",
      returnUrl: "https://bayondy.com/merci",
      courseId: "course_abc",
    },
    ["https://bayondy.com"]
  );

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.data.amount, 2500);
    assert.equal(result.data.orderId, "order_12345");
    assert.equal(result.data.returnUrl, "https://bayondy.com/merci");
    assert.equal(result.data.courseId, "course_abc");
  }
});

test("validateMonCashCreateInput rejects non-integer, negative, or zero amounts", () => {
  for (const badAmount of [0, -100, 19.99, "500", null]) {
    const res = validateMonCashCreateInput({
      amount: badAmount,
      orderId: "order_123",
      returnUrl: "https://bayondy.com/merci",
    });
    assert.equal(res.ok, false);
    if (!res.ok) {
      assert.equal(res.code, "INVALID_AMOUNT");
    }
  }
});

test("validateMonCashCreateInput rejects untrusted origin or unsafe scheme in returnUrl", () => {
  const xssAttempt = validateMonCashCreateInput({
    amount: 500,
    orderId: "order_123",
    returnUrl: "javascript:alert(1)",
  });
  assert.equal(xssAttempt.ok, false);
  if (!xssAttempt.ok) {
    assert.equal(xssAttempt.code, "INVALID_RETURN_URL");
  }

  const crossOrigin = validateMonCashCreateInput(
    {
      amount: 500,
      orderId: "order_123",
      returnUrl: "https://evil.example/merci",
    },
    ["https://bayondy.com"]
  );
  assert.equal(crossOrigin.ok, false);
  if (!crossOrigin.ok) {
    assert.equal(crossOrigin.code, "UNTRUSTED_RETURN_URL");
  }
});

test("isSafePaymentRedirectUrl allows https and localhost http only", () => {
  assert.equal(isSafePaymentRedirectUrl("https://moncashconnect.com/pay/abc"), true);
  assert.equal(isSafePaymentRedirectUrl("http://localhost:3000/merci"), true);
  assert.equal(isSafePaymentRedirectUrl("http://example.com/pay"), false);
  assert.equal(isSafePaymentRedirectUrl("javascript:alert(1)"), false);
  assert.equal(isSafePaymentRedirectUrl("data:text/html,<script>"), false);
});

test("createMonCashOrderId produces ORDER_ID_REGEX-compliant unique IDs", () => {
  const id1 = createMonCashOrderId("course-01");
  const id2 = createMonCashOrderId("course-01");
  assert.equal(ORDER_ID_REGEX.test(id1), true);
  assert.equal(ORDER_ID_REGEX.test(id2), true);
  assert.notEqual(id1, id2);
});

test("mapMonCashUpstreamError returns structured error and code", () => {
  const mapped = mapMonCashUpstreamError(400, {
    code: "INVALID_AMOUNT",
    error: "Amount must be >= 5 HTG",
  });
  assert.deepEqual(mapped, {
    code: "INVALID_AMOUNT",
    error: "Amount must be >= 5 HTG",
  });

  const fallback = mapMonCashUpstreamError(502, null);
  assert.equal(fallback.code, "MONCASH_HTTP_502");
  assert.ok(fallback.error.length > 0);
});

test("isMonCashSuccessStatus accepts both HTTP 200 and 201", () => {
  assert.equal(isMonCashSuccessStatus(200), true);
  assert.equal(isMonCashSuccessStatus(201), true);
  assert.equal(isMonCashSuccessStatus(400), false);
  assert.equal(isMonCashSuccessStatus(403), false);
  assert.equal(isMonCashSuccessStatus(500), false);
});

test("buildMonCashCreateHeaders sets Authorization, Content-Type, Idempotency-Key, and valid Origin", () => {
  const headers = buildMonCashCreateHeaders(
    "sk_test_proj_123",
    "https://bayondy.com",
    "byd_course_1"
  );
  assert.equal(headers.Authorization, "Bearer sk_test_proj_123");
  assert.equal(headers["Content-Type"], "application/json");
  assert.equal(headers["Idempotency-Key"], "byd_course_1");
  assert.equal(headers.Origin, "https://bayondy.com");

  const withoutInvalidOrigin = buildMonCashCreateHeaders(
    "sk_test_proj_123",
    "https://bayondy.com/evil path",
    "byd_course_2"
  );
  assert.equal(withoutInvalidOrigin.Origin, undefined);
});

test("validateMonCashCreateInput rejects orderId longer than 100 characters", () => {
  const res = validateMonCashCreateInput({
    amount: 500,
    orderId: "a".repeat(101),
    returnUrl: "https://bayondy.com/merci",
  });
  assert.equal(res.ok, false);
  if (!res.ok) {
    assert.equal(res.code, "INVALID_ORDER_ID");
  }
});
