# WhatsApp Webhook Evidence

| Field | Value |
|-------|--------|
| **Gate** | `GATE-P0-WA` |
| **Date** | 2026-07-07 |
| **Operator** | Cursor Agent (implementation fix + evidence update) |
| **Branch** | `fix/p0-whatsapp-signature-fail-closed` |
| **HEAD** | pending merge |
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
| Verify token env | `WHATSAPP_WEBHOOK_VERIFY_TOKEN` (canonical) |
| App secret env | `WHATSAPP_WEBHOOK_APP_SECRET` (canonical) |
| Access token env | `WHATSAPP_API_TOKEN` |
| Live provider | `WHATSAPP_PROVIDER=live|meta|graph` triggers production-like signature enforcement |
| Signature header | `x-hub-signature-256` (alias `x-whatsapp-signature`) |
| Timestamp tolerance | `x-hub-timestamp-256` / `x-hub-timestamp` — enforced when signature required and secret set |
| Approval commands | `parseWhatsAppApprovalCommand` — `@hallederiz/domain`; tests in `whatsapp-command-approval.test.ts` |
| Automated tests | `webhook-security.test.ts`, `whatsapp-webhook-idempotency.test.ts`, `whatsapp-command-approval.test.ts` |

---

## 2. Credential presence

Checked via PowerShell process env (values not printed; no secrets in this document).

| Variable | Status | Evidence | Required for | Result |
|----------|--------|----------|--------------|--------|
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | **MISSING** | not set | Meta webhook verify | **FAIL** |
| `WHATSAPP_WEBHOOK_APP_SECRET` | **MISSING** | not set | POST signature HMAC | **FAIL** |
| `WHATSAPP_API_TOKEN` | **MISSING** | not set | Outbound / Graph API | **FAIL** |
| `WHATSAPP_PHONE_NUMBER_ID` | **MISSING** | not set | Live provider | **FAIL** |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | **MISSING** | not set | Tenant / WABA mapping (optional) | **NOT_RUN** |
| `WHATSAPP_PROVIDER` | **MISSING** | not set | Provider mode selection | **FAIL** |
| `WHATSAPP_API_BASE_URL` | **MISSING** | not set | Graph API base | **FAIL** |

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

### 4.1 Original live smoke (2026-07-06, pre-fix)

| Test ID | Signature case | Observed (pre-fix) | Result |
|---------|----------------|-------------------|--------|
| WA-SIG-001 | **missing** | **200** | **FAIL** |
| WA-SIG-002 | **invalid** | **200** | **FAIL** |

Root cause: signature enforcement only when `WHATSAPP_WEBHOOK_APP_SECRET` was set; live provider mode without secret was fail-open.

### 4.2 Implementation fix (`fix/p0-whatsapp-signature-fail-closed`)

`requiresWhatsAppWebhookSignature()` = `NODE_ENV=production` **OR** `WHATSAPP_PROVIDER=live|meta|graph`.

| Test ID | Mode | Case | Expected | Automated test | Result |
|---------|------|------|----------|----------------|--------|
| WA-SIG-001 | production | no secret | 503 | `webhook-security.test.ts` | **PASS** |
| WA-SIG-002 | production | missing signature + secret | 403 | `webhook-security.test.ts` | **PASS** |
| WA-SIG-003 | live provider | no secret | 503 | `webhook-security.test.ts` | **PASS** |
| WA-SIG-004 | live provider | missing signature | 403 | `webhook-security.test.ts` | **PASS** |
| WA-SIG-005 | live provider | invalid signature | 403 | `webhook-security.test.ts` | **PASS** |
| WA-SIG-006 | live provider | valid signature | 200 | `webhook-security.test.ts` | **PASS** |
| WA-SIG-007 | demo default | no provider/secret | 200 (legacy) | `webhook-security.test.ts` | **PASS** |
| WA-SIG-008 | live smoke rerun | missing/invalid sig | reject | **NOT_RUN** | Pending credential rerun |

**WA-SIG-001 finding status: FIXED_PENDING_CREDENTIAL_RERUN**

**signature_status: FIXED_PENDING_RERUN** — automated tests prove fail-closed; live credential rerun still required.

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
| **WA-ENV-001** | **P0** | Required WhatsApp staging/prod credentials are missing | Canonical keys MISSING (see §2) | Configure via secret manager. **Do not commit secrets.** | No (ops) |
| **WA-VERIFY-001** | PARTIAL | Webhook verify fail-closed works for wrong/missing token; correct-token verify not run | Wrong token → **403**; missing token → **403** | Set `WHATSAPP_WEBHOOK_VERIFY_TOKEN`; re-run WA-VERIFY-001 | No (ops + docs rerun) |
| **WA-SIG-001** | **P0** (resolved in code) | Live smoke accepted missing/invalid signatures before fix | Pre-fix: `POST_NO_SIG`/`POST_BAD_SIG` → 200 | **FIXED_PENDING_CREDENTIAL_RERUN** — `fix/p0-whatsapp-signature-fail-closed`; automated tests PASS; live rerun after credentials | **Merged pending** |
| **WA-CMD-001** | BLOCKED / NOT_RUN | Inbound approval command live smoke not completed | Signed webhook + credentials not ready | Complete after WA-ENV-001 + WA-SIG-001 resolved | TBD |
| **WA-OUTBOUND-001** | NOT_RUN | Live outbound send not tested | No token / no recipient | Ops-led staging outbound smoke after credentials | No (ops) |

---

## 8. Summary

| Field | Status |
|-------|--------|
| **credential_status** | **BLOCKED** |
| **verify_status** | **PARTIAL** |
| **signature_status** | **FIXED_PENDING_RERUN** |
| **inbound_status** | **BLOCKED / NOT_RUN** |
| **approval_command_status** | **BLOCKED / NOT_RUN** |
| **outbound_status** | **NOT_RUN** |
| **gate_status (`GATE-P0-WA`)** | **BLOCKED** |
| **production_go_impact** | Full Production Go remains **Conditional Go**; credentials + live rerun still required |

### Decision rules applied

- **PASS** not granted: required credentials still missing; correct verify not run; live credential rerun not completed.
- **BLOCKED**: gate remains blocked until ops credential setup + `docs/p0-whatsapp-credential-rerun`.
- Signature implementation fix: automated tests prove fail-closed for production and live provider modes.
- No secrets committed in this evidence package.

---

## Related documents

- `docs/product/PRODUCTION_GO_OPEN_GATES.md`
- `docs/product/PRODUCTION_GO_MANUAL_EVIDENCE.md`
- `docs/product/WHATSAPP_READINESS.md`
- `docs/product/PRODUCTION_ENV_CHECKLIST.md`
