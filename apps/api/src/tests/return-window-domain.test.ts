import assert from "node:assert/strict";
import test from "node:test";
import {
  isReturnWindowExpiredFromIso,
  validateReturnWindowFromOrderCreatedAt,
  RETURN_WINDOW_DAYS
} from "@hallederiz/domain";

test("return window rejects orders older than 15 days", () => {
  const now = new Date("2026-06-11T12:00:00.000Z");
  const createdAt = new Date("2026-05-20T12:00:00.000Z").toISOString();
  assert.equal(isReturnWindowExpiredFromIso(createdAt, now), true);
  const issue = validateReturnWindowFromOrderCreatedAt(createdAt, now);
  assert.ok(issue);
  assert.equal(issue?.code, "return_window_expired");
});

test("return window allows orders within 15 days", () => {
  const now = new Date("2026-06-11T12:00:00.000Z");
  const createdAt = new Date("2026-06-01T12:00:00.000Z").toISOString();
  assert.equal(isReturnWindowExpiredFromIso(createdAt, now), false);
  assert.equal(validateReturnWindowFromOrderCreatedAt(createdAt, now), null);
});

test("return window constant is 15 days", () => {
  assert.equal(RETURN_WINDOW_DAYS, 15);
});
