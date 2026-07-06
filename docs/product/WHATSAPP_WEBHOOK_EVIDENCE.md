# WhatsApp Webhook Evidence

| Field | Value |
|-------|--------|
| **Gate** | `GATE-P0-WA` |
| **Date** | 2026-07-06 |
| **Operator** | Cursor Agent (docs-only evidence run) |
| **Branch** | `docs/p0-whatsapp-webhook-evidence` |
| **HEAD** | `2a009763` |
| **API URL** | `http://127.0.0.1:4000` |
| **Persistence mode** | `postgres` (API session); webhook route uses demo tenant context |
| **Credential source** | Process env — **all required keys MISSING** |
| **Secret handling policy** | No secrets committed; redacted SET/MISSING only |
| **WhatsApp provider mode** | `WHATSAPP_PROVIDER` **MISSING** (defaults to `disabled` in readiness resolver) |
| **Outbound live send** | **Out of scope** — not tested; not marked PASS |

---

## 1. Scope

Production Go P0 gate `GATE-P0-WA` evidence package covering:

- Credential presence (staging/prod keys)
- Webhook verify (`GET /whatsapp/webhook`)
- Signature fail-closed (`POST /whatsapp/webhook`)
- Inbound smoke
- Approval command smoke
- Outbound live send: explicitly **out of scope** for this PR

**Architecture reference (read-only discovery):**

| Area | Detail |
|------|--------|
| Webhook route | `GET` / `POST` `/whatsapp/webhook` — `apps/api/src/integrations/routes.ts` |
| Alt omnichannel route | `GET` / `POST` `/platform/omnichannel/webhooks/meta` |
| Verify params | `hub.mode`, `hub.challenge`, `hub.verify_token` |
| Verify token env | `WHATSAPP_WEBHOOK_VERIFY_TOKEN` (adapter); production readiness also lists `WHATSAPP_VERIFY_TOKEN` |
| App secret env | `WHATSAPP_WEBHOOK_APP_SECRET` (signature); production readiness lists `WHATSAPP_WEBHOOK_SECRET` |
| Access token env | `WHATSAPP_API_TOKEN` or `WHATSAPP_ACCESS_TOKEN` |
| Signature header | `x-hub-signature-256` (alias `x-whatsapp-signature`) |
| Timestamp tolerance | `x-hub-timestamp-256` / `x-hub-timestamp` — enforced in `NODE_ENV=production` when secret set |
| Approval commands | `parseWhatsAppApprovalCommand` — `@hallederiz/domain`; tests in `whatsapp-command-approval.test.ts` |
| Automated tests | `webhook-security.test.ts`, `whatsapp-webhook-idempotency.test.ts`, `whatsapp-command-approval.test.ts` |

---

## 2. Credential presence

Checked via PowerShell process env (values not printed; no secrets in this document).

| Variable | Status | Evidence | Required for | Result |
|----------|--------|----------|--------------|--------|
| `WHATSAPP_VERIFY_TOKEN` | **MISSING** | not set | Meta webhook verify (production readiness) | **FAIL** |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | **MISSING** | not set | Adapter verify token check | **FAIL** |
| `WHATSAPP_WEBHOOK_SECRET` | **MISSING** | not set | Production readiness checklist | **FAIL** |
| `WHATSAPP_WEBHOOK_APP_SECRET` | **MISSING** | not set | POST signature HMAC | **FAIL** |
| `WHATSAPP_ACCESS_TOKEN` | **MISSING** | not set | Outbound / Graph API | **FAIL** |
| `WHATSAPP_API_TOKEN` | **MISSING** | not set | Outbound (alternate key) | **FAIL** |
| `WHATSAPP_PHONE_NUMBER_ID` | **MISSING** | not set | Live provider | **FAIL** |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | **MISSING** | not set | Tenant / WABA mapping | **FAIL** |
| `WHATSAPP_PROVIDER` | **MISSING** | not set | Provider mode selection | **FAIL** |

**credential_status: BLOCKED**

---

## 3. Webhook verify smoke

Endpoint: `GET /whatsapp/webhook`

| Test ID | Request | Expected | Observed status | Observed body | Result | Notes |
|---------|---------|----------|-----------------|---------------|--------|-------|
| WA-VERIFY-001 | Correct verify token + challenge | `200`, challenge echoed | **NOT_RUN** | — | **NOT_RUN** | `WHATSAPP_VERIFY_TOKEN` / `WHATSAPP_WEBHOOK_VERIFY_TOKEN` missing |
| WA-VERIFY-002 | Wrong verify token | Fail-closed reject | **403** | empty | **PASS** (fail-closed only) | `hub.verify_token=WRONG_TOKEN` |
| WA-VERIFY-003 | Missing verify token | Fail-closed reject | **403** | empty | **PASS** (fail-closed only) | `hub.challenge` present, token absent |

**verify_status: PARTIAL** — wrong/missing token fail-closed observed; correct-token verify not run.

---

## 4. Signature fail-closed smoke

Endpoint: `POST /whatsapp/webhook`  
Payload: synthetic `{"entry":[]}` (no real customer data).

| Test ID | Payload | Signature case | Expected | Observed | Result | Notes |
|---------|---------|----------------|----------|----------|--------|-------|
| WA-SIG-001 | synthetic | **missing** | Reject (403/503) | **200** `{"ok":true,"duplicate":false,"workflowReserved":false}` | **FAIL** | No secret configured; route skips signature check |
| WA-SIG-002 | synthetic | **invalid** (`sha256=` + 64×`b`) | Reject | **200** `{"ok":true,"duplicate":false,"workflowReserved":false}` | **FAIL** | Same — signature not enforced without secret |
| WA-SIG-003 | synthetic | **valid** HMAC | Accept | **NOT_RUN** | **NOT_RUN** | `WHATSAPP_WEBHOOK_APP_SECRET` missing |
| WA-SIG-004 | synthetic + message id | duplicate idempotency | Idempotent handling | **NOT_RUN** | **NOT_RUN** | Requires valid signed inbound path |

**Code note:** When `WHATSAPP_WEBHOOK_APP_SECRET` is unset, `integrations/routes.ts` only enforces signature if `secret` is truthy; in non-production without secret, POST proceeds without verification. Automated tests in `webhook-security.test.ts` prove fail-closed when secret **is** set (`NODE_ENV=production` → 503 without secret; invalid sig → 403).

**signature_status: BLOCKED** — live smoke without credentials accepted missing/invalid signatures.

---

## 5. Inbound / approval command smoke

| Test ID | Scenario | Expected | Observed | Result | Notes |
|---------|----------|----------|----------|--------|-------|
| WA-CMD-001 | Invalid signature cannot execute command | Reject before mutation | **NOT_RUN** (live) | **BLOCKED** | POST accepted without signature in current env |
| WA-CMD-002 | Missing/invalid command token | No mutation | Automated tests **PASS** | **NOT_RUN** (live) | `whatsapp-command-approval.test.ts` |
| WA-CMD-003 | Duplicate inbound command idempotent | Duplicate flagged | Automated tests **PASS** | **NOT_RUN** (live) | `whatsapp-webhook-idempotency.test.ts` |
| WA-CMD-004 | Valid signed synthetic command | Expected dry-run/accept | **NOT_RUN** | **NOT_RUN** | No safe live ticket fixture + no credentials |

**inbound_status: BLOCKED / NOT_RUN**  
**approval_command_status: BLOCKED / NOT_RUN**

Automated test evidence (no live Meta): 7 tests in `whatsapp-command-approval.test.ts`; 2 in `whatsapp-webhook-idempotency.test.ts` — signature fail-closed when secret configured in test harness.

---

## 6. Outbound

| Check | Status | Notes |
|-------|--------|-------|
| Live outbound WhatsApp send | **NOT_RUN** | No access token; no test recipient |
| Outbound PASS | **No** | Explicitly not claimed |

**outbound_status: NOT_RUN**

---

## 7. Findings

| ID | Severity | Issue | Evidence | Required action | Fix PR required |
|----|----------|-------|----------|-----------------|-----------------|
| **WA-ENV-001** | **P0** | Required WhatsApp staging/prod credentials are missing | `WHATSAPP_VERIFY_TOKEN=MISSING`, `WHATSAPP_WEBHOOK_SECRET=MISSING`, `WHATSAPP_PHONE_NUMBER_ID=MISSING`, `WHATSAPP_BUSINESS_ACCOUNT_ID=MISSING`, `WHATSAPP_PROVIDER=MISSING` | Configure staging/prod WhatsApp credentials via secret manager or local secure env. **Do not commit secrets.** | No (ops) |
| **WA-VERIFY-001** | PARTIAL | Webhook verify fail-closed works for wrong/missing token; correct-token verify not run | Wrong token → **403**; missing token → **403** | Set `WHATSAPP_VERIFY_TOKEN` / `WHATSAPP_WEBHOOK_VERIFY_TOKEN` securely; re-run WA-VERIFY-001 | No (ops + docs rerun) |
| **WA-SIG-001** | **P0 BLOCKER** | Webhook POST signature fail-closed not proven in live smoke; missing/invalid signatures accepted | `POST_NO_SIG` → **200**; `POST_BAD_SIG` → **200** | Re-run in production-like mode with `WHATSAPP_WEBHOOK_APP_SECRET` set. Expect: missing → reject, invalid → reject, valid → accept. If still 200, open `fix/p0-whatsapp-signature-fail-closed` | **Yes**, if production-like re-run confirms acceptance |
| **WA-CMD-001** | BLOCKED / NOT_RUN | Inbound approval command live smoke not completed | Signed webhook + credentials not ready | Complete after WA-ENV-001 + WA-SIG-001 resolved | TBD |
| **WA-OUTBOUND-001** | NOT_RUN | Live outbound send not tested | No token / no recipient | Ops-led staging outbound smoke after credentials | No (ops) |

---

## 8. Summary

| Field | Status |
|-------|--------|
| **credential_status** | **BLOCKED** |
| **verify_status** | **PARTIAL** |
| **signature_status** | **BLOCKED** |
| **inbound_status** | **BLOCKED / NOT_RUN** |
| **approval_command_status** | **BLOCKED / NOT_RUN** |
| **outbound_status** | **NOT_RUN** |
| **gate_status (`GATE-P0-WA`)** | **BLOCKED** |
| **production_go_impact** | Full Production Go remains **Conditional Go**; WhatsApp P0 gate blocks full go |

### Decision rules applied

- **PASS** not granted: required credentials missing; correct verify not run; live signature fail-closed not proven (POST returned 200 for missing/invalid signature).
- **BLOCKED**: credentials missing; signature smoke failed live observation.
- No secrets committed in this evidence package.

---

## Related documents

- `docs/product/PRODUCTION_GO_OPEN_GATES.md`
- `docs/product/PRODUCTION_GO_MANUAL_EVIDENCE.md`
- `docs/product/WHATSAPP_READINESS.md`
- `docs/product/PRODUCTION_ENV_CHECKLIST.md`
