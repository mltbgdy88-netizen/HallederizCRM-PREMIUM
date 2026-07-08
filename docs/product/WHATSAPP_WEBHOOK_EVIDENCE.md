# WhatsApp Webhook Evidence

| Field | Value |
|-------|--------|
| **Gate** | `GATE-P0-WA` |
| **Date** | 2026-07-07 (initial), **2026-07-08** (rerun #199), **2026-07-08** (final live #201) |
| **Operator** | Cursor Agent (evidence runs) |
| **Branch** | `docs/p0-whatsapp-final-live-verification` |
| **HEAD** | `0b808e2b` (baseline) |
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
| WA-SIG-008 | live smoke rerun | missing/invalid sig | reject | **PASS** (isolated route) | 2026-07-08 §9; ephemeral secret not committed |

**WA-SIG-001 finding status: CLOSED (code + isolated live smoke)**

**signature_status: PASS (isolated live provider)** — fail-closed proven on route harness; **full API live boot still blocked** without ops credentials (§9).

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
| **WA-SIG-001** | **P0** (resolved) | Live smoke accepted missing/invalid signatures before fix | Pre-fix: `POST_NO_SIG`/`POST_BAD_SIG` → 200; rerun: live provider isolated smoke → 503/403/403/200 | **CLOSED** — merged `fix/p0-whatsapp-signature-fail-closed`; isolated live rerun PASS (§9) | No |
| **WA-BOOT-001** | **P0** | Full API cannot boot with `WHATSAPP_PROVIDER=live` when ops credentials missing | `runtime_env_validation_failed` (verify token, secret, API base, token, phone id) | Ops configures canonical credentials; then staging API boot + live HTTP smoke | No (ops) |
| **WA-CMD-001** | PARTIAL | Live Meta inbound/approval not completed; isolated signed smoke OK | Signed synthetic inbound `workflowReserved=true`; approval `ticket_not_found` (no fixture) | Ops credentials + staging ticket fixture for end-to-end live smoke | TBD |
| **WA-OUTBOUND-001** | NOT_RUN | Live outbound send not tested | No token / no recipient | Ops-led staging outbound smoke after credentials | No (ops) |

---

## 8. Summary

| Field | Status |
|-------|--------|
| **credential_status** | **BLOCKED** |
| **verify_status** | **PARTIAL** |
| **signature_status** | **PASS** (isolated live provider; demo default API legacy 200) |
| **inbound_status** | **NOT_RUN** (final live §10; prior isolated **PARTIAL** in §9) |
| **approval_command_status** | **NOT_RUN** (final live §10) |
| **outbound_status** | **NOT_RUN** |
| **gate_status (`GATE-P0-WA`)** | **BLOCKED** |
| **production_go_impact** | Full Production Go remains **Conditional Go**; ops credentials not loadable (§10) |

### Decision rules applied

- **PASS** not granted: final live verification (§10) blocked — ops credentials not loadable; full API boot **FAIL**.
- **BLOCKED**: gate remains blocked until ops loads secrets and staging live HTTP smoke completes.
- Prior signature fail-closed evidence (§4, §9) remains valid; does not substitute for ops live smoke.
- No secrets committed in this evidence package.

---

## 9. 2026-07-08 Credential Rerun (`docs/p0-whatsapp-credential-rerun`, issue #199)

Controlled evidence rerun on `main` @ `ac608c67`. Docs-only; no code changes.

### 9.1 Credential presence (redacted)

Re-checked process/user/machine env — **all canonical keys MISSING** (same as §2). No private values recorded.

**credential_status: BLOCKED**

### 9.2 Running API (`http://127.0.0.1:4000`, demo/default)

| Probe | Status | Body (truncated) | Result |
|-------|--------|------------------|--------|
| `GET /health` | **200** | healthy | API up |
| `GET /health/whatsapp` | **401** | auth required | Expected for protected health |
| WA-VERIFY-002 wrong token | **403** | empty | **PASS** (fail-closed) |
| WA-VERIFY-003 missing token | **403** | empty | **PASS** (fail-closed) |
| WA-VERIFY-001 correct token | **NOT_RUN** | — | verify token **MISSING** on running API |
| POST demo default, no signature | **200** | `ok:true` | Legacy demo path (no live provider) |
| POST demo default, bad signature | **200** | `ok:true` | Legacy demo path |

**verify_status: PARTIAL**

### 9.3 Full API live boot attempt

`WHATSAPP_PROVIDER=live` without ops secrets → API bootstrap **FAIL**:

`runtime_env_validation_failed: whatsapp_verify_token_missing, whatsapp_webhook_secret_missing, whatsapp_api_base_missing, whatsapp_api_token_missing, whatsapp_phone_id_missing`

Ops credentials required before staging/production live HTTP smoke on full API process.

### 9.4 Isolated route harness (`WHATSAPP_PROVIDER=live`)

Ephemeral in-memory secret used for route-level smoke only — **not committed**, not ops credentials.

| Probe | Expected | Observed | Result |
|-------|----------|----------|--------|
| POST, live provider, no secret | 503 | **503** `WhatsApp webhook secret is not configured.` | **PASS** |
| POST, missing signature | 403 | **403** `Webhook signature is required.` | **PASS** |
| POST, invalid signature | 403 | **403** `Webhook signature mismatch.` | **PASS** |
| POST, valid signature | 200 | **200** `ok:true` | **PASS** |
| GET verify, correct ephemeral token | 200 | **200** challenge echoed | **PASS** (harness only) |
| GET verify, wrong token | 403 | **403** | **PASS** |

**signature_status: PASS** (isolated live provider)

### 9.5 Inbound / approval (isolated signed synthetic)

| Probe | Observed | Result | Notes |
|-------|----------|--------|-------|
| Signed inbound text message | **200** `workflowReserved:true` | **PARTIAL** | Synthetic Meta-shaped payload; not live Meta |
| Signed `ONAY SO-SMOKE-001 …` command | **200** `commandResult.ok:false` `reason:ticket_not_found` | **PARTIAL** | Parser + handler reached; no staging approval ticket fixture |

**inbound_status: PARTIAL**  
**approval_command_status: PARTIAL**

### 9.6 Outbound

| Check | Status |
|-------|--------|
| Live outbound send | **NOT_RUN** — `WHATSAPP_API_TOKEN` **MISSING** |

### 9.7 Automated regression (reference)

`webhook-security.test.ts`, `whatsapp-command-approval.test.ts`, `whatsapp-webhook-idempotency.test.ts` — signature/command/idempotency paths covered in CI/local test harness (no live Meta).

### 9.8 Gate decision

| Field | Status |
|-------|--------|
| **`GATE-P0-WA`** | **BLOCKED** |
| **`GATE-P0-VP`** | unchanged **PASS** |
| **`GATE-P0-AI`** | unchanged **PASS** |
| **Full Production Go** | **NOT granted** |

---

## 10. 2026-07-08 Final Live Verification (`docs/p0-whatsapp-final-live-verification`, issue #201)

Final controlled staging/live verification on `main` @ `0b808e2b`. Docs-only; no code changes.

### 10.1 Ops credential load attempt

| Source checked | Result |
|----------------|--------|
| Process / user / machine env | **MISSING** — all canonical keys absent |
| Repo `.env` / `apps/api/.env` | **MISSING** — files not present |
| `.env.local` | **MISSING** |
| `WHATSAPP_TEST_RECIPIENT` | **MISSING** |

No private values loaded or recorded. Secret manager not reachable from agent runtime.

**credential_status: BLOCKED**

### 10.2 Full API live/staging boot

`WHATSAPP_PROVIDER=live` boot attempt → **FAIL** — `runtime_env_validation_failed` (verify token, webhook secret, API base, API token, phone id **MISSING**).

**boot_status: FAIL**

### 10.3 Webhook verify (`:4000`, demo/default API)

| Test ID | Case | Status | Result |
|---------|------|--------|--------|
| WA-VERIFY-002 | Wrong token | **403** | **PASS** |
| WA-VERIFY-003 | Missing token | **403** | **PASS** |
| WA-VERIFY-001 | Correct ops token | **NOT_RUN** | Ops verify token **MISSING** |

**verify_status: PARTIAL**

### 10.4 Signed POST (staging live)

| Case | Result |
|------|--------|
| Missing / invalid / valid signature on live API | **NOT_RUN** — full API boot **FAIL** |

**signed_post_status: NOT_RUN**

### 10.5 Inbound / approval / outbound

| Check | Result |
|-------|--------|
| Staging inbound | **NOT_RUN** |
| Approval command + ticket fixture | **NOT_RUN** |
| Outbound to test recipient | **NOT_RUN** |

### 10.6 Gate decision

| Field | Status |
|-------|--------|
| **`GATE-P0-WA`** | **BLOCKED** |
| **`GATE-P0-VP`** | **PASS** (unchanged) |
| **`GATE-P0-AI`** | **PASS** (unchanged) |
| **Full Production Go** | **NOT granted** |

**Ops action:** load secrets into secret manager or `.env.local` (never commit); re-run §10 on staging API.

---

## Related documents

- `docs/product/PRODUCTION_GO_OPEN_GATES.md`
- `docs/product/PRODUCTION_GO_MANUAL_EVIDENCE.md`
- `docs/product/WHATSAPP_READINESS.md`
- `docs/product/PRODUCTION_ENV_CHECKLIST.md`
