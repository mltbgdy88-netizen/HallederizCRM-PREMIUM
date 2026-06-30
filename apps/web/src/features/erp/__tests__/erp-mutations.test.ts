import assert from "node:assert/strict";
import test from "node:test";
import { ERP_MUTATION_DEMO_MESSAGES, ERP_MUTATION_ERROR_MESSAGES } from "../utils/erp-mutation-messages";

test("ERP mutation demo messages are user-facing Turkish copy", () => {
  assert.match(ERP_MUTATION_DEMO_MESSAGES.test, /demo/i);
  assert.match(ERP_MUTATION_DEMO_MESSAGES.sync, /senkron/i);
});

test("ERP mutation error messages are defined", () => {
  assert.match(ERP_MUTATION_ERROR_MESSAGES.testFailed, /test/i);
  assert.match(ERP_MUTATION_ERROR_MESSAGES.syncFailed, /senkron/i);
});
