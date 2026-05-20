import assert from "node:assert/strict";
import test from "node:test";
import { redactAuditPayload } from "@hallederiz/database";

test("audit redaction masks sensitive keys", () => {
  const redacted = redactAuditPayload({
    phone: "+905551112233",
    email: "user@example.com",
    accessToken: "secret-token",
    note: "visible"
  });
  assert.equal(redacted.phone, "[redacted]");
  assert.equal(redacted.email, "[redacted]");
  assert.equal(redacted.accessToken, "[redacted]");
  assert.equal(redacted.note, "visible");
});
