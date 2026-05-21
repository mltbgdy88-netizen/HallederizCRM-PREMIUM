# Production Smoke Checklist

| Release commit | `2d2430f` |
|----------------|-----------|
| Runbook | `PRODUCTION_CUTOVER_RUNBOOK.md` |

**Legend:** Pass ☐ | Fail ☐ | N/A ☐ | Owner | Notes

---

## 1. Automated smoke (pre/post deploy)

| # | Command | Expected | Pre | Post | Owner |
|---|---------|----------|-----|------|-------|
| A1 | `pnpm ui:guard` | PASS | ☐ | ☐ | Eng |
| A2 | `pnpm --filter @hallederiz/web typecheck` | PASS | ☐ | ☐ | Eng |
| A3 | `pnpm --filter @hallederiz/ui typecheck` | PASS | ☐ | ☐ | Eng |
| A4 | `pnpm --filter @hallederiz/ui build` | PASS | ☐ | ☐ | Eng |
| A5 | `pnpm --filter @hallederiz/web build` | PASS | ☐ | ☐ | Eng |
| A6 | `pnpm smoke:navigation` | 24 checks PASS | ☐ | ☐ | Eng |
| A7 | `pnpm smoke:routes` | 37 routes PASS | ☐ | ☐ | Eng |
| A8 | `pnpm --filter @hallederiz/api test` | 421/421 PASS | ☐ | ☐ | Eng |
| A9 | `pnpm smoke:api-offline` | PASS (if API up) | ☐ | ☐ | Eng |
| A10 | CI Quality Gate on deploy SHA | SUCCESS | ☐ | ☐ | Eng |

---

## 2. API / DB smoke (manual or staging)

| # | Check | Expected | Pass | Owner |
|---|-------|----------|------|-------|
| B1 | API health / root | 200, no stack in body | ☐ | Ops |
| B2 | Auth login (real credentials) | Session established | ☐ | Ops |
| B3 | Tenant-scoped list read | 200, no cross-tenant | ☐ | Eng |
| B4 | `GET /health/whatsapp` | Honest state; no token leak | ☐ | Ops |
| B5 | `GET /health/local-ai` | `ready` or documented pending | ☐ | Ops |
| B6 | `GET /whatsapp/session` | `connected` only if env ready | ☐ | Ops |
| B7 | Outbound when not configured | 503, Turkish message, no fake sent | ☐ | Eng |
| B8 | DB migration version | Matches release | ☐ | DBA |
| B9 | Demo persistence disabled | No accidental demo writes | ☐ | DBA |

**Approval-gated (staging preferred):**

| # | Check | Expected | Pass | Owner |
|---|-------|----------|------|-------|
| B10 | Approval action smoke | Policy respected; audit written | ☐ | Eng |
| B11 | Destructive mutation in prod | **Only with explicit ticket** | N/A ☐ | Product |

---

## 3. Manual web smoke

| # | Route / action | Expected | Pass | Owner |
|---|----------------|----------|------|-------|
| W1 | `/login` | Login works; no demo auth in prod | ☐ | QA |
| W2 | `/dashboard` | Loads; AI column dashboard-only | ☐ | QA |
| W3 | `/hizli-islem` | Hub loads; no body scroll regression | ☐ | QA |
| W4 | `/onaylar` | List + detail safe | ☐ | QA |
| W5 | `/whatsapp` | Health reflects real config | ☐ | QA |
| W6 | `/cariler` | List + first row selection | ☐ | QA |
| W7 | `/stok` | List density OK | ☐ | QA |
| W8 | `/archive` | Category chips in page | ☐ | QA |
| W9 | `/raporlar` | List; detail safe route | ☐ | QA |
| W10 | `/ayarlar` | Settings hub | ☐ | QA |
| W11 | Mobile drawer | Opens/closes; nav usable | ☐ | QA |
| W12 | Error boundary | Safe copy on forced error (staging) | ☐ | QA |
| W13 | No horizontal scroll | Critical routes 1920×1080 | ☐ | QA |
| W14 | Empty/loading states | No stack trace text | ☐ | QA |

---

## 4. WhatsApp manual smoke

> Use **test recipient** first. No mass outbound in cutover window without approval.

| # | Step | Expected | Pass | Owner |
|---|------|----------|------|-------|
| H1 | Env: `WHATSAPP_PROVIDER=live` or `meta` | Set in secret manager | ☐ | Ops |
| H2 | Meta webhook verify challenge | 200 verify | ☐ | Ops |
| H3 | Inbound test message | Appears in inbox/UI or logged | ☐ | Ops |
| H4 | Outbound to `WHATSAPP_TEST_RECIPIENT` | Delivered or clear API error | ☐ | Ops |
| H5 | UI provider card | Not fake “connected” | ☐ | QA |
| H6 | Outbound when env incomplete | 503 fail-closed | ☐ | Eng |
| H7 | Webhook signature invalid | Rejected (fail-closed) | ☐ | Eng |
| H8 | Token not in API responses | Verified in network tab | ☐ | Sec |

---

## 5. Local AI manual smoke

> Read-only / review-only — **no** auto-mutation via AI UI.

| # | Step | Expected | Pass | Owner |
|---|------|----------|------|-------|
| L1 | `ollama serve` or compatible server up | Reachable from API network | ☐ | Ops |
| L2 | Model pulled | Listed in `/api/tags` | ☐ | Ops |
| L3 | `GET /health/local-ai` | `ready` or explicit pending | ☐ | Ops |
| L4 | Sales assistant health | Model reported when configured | ☐ | Ops |
| L5 | `/ai` page | No forbidden “Uygula” / auto-save copy | ☐ | QA |
| L6 | Insights when disabled | Empty state, no fake text | ☐ | QA |
| L7 | Chat/proposal path | Proposal-only; execution via approval | ☐ | Eng |
| L8 | Timeout behavior | User-safe Turkish message | ☐ | QA |

---

## 6. Viewport screenshot smoke

| Viewport | Routes (minimum) | Pass | Owner |
|----------|------------------|------|-------|
| 1920×1080 | dashboard, hizli-islem, onaylar, whatsapp, cariler, stok, archive, raporlar | ☐ | QA |
| 390×844 | Same set + mobile drawer | ☐ | QA |

**Criteria:**

- At least 5 list rows visible without page scroll where list-first (per UI rules)
- No clipped filter buttons
- Right panel not empty when data exists

---

## 7. Real-data detail smoke

| # | Check | Expected | Pass | Owner |
|---|-------|----------|------|-------|
| R1 | Customer detail `[customerId]` | Loads with real ID | ☐ | QA |
| R2 | Payment detail `[paymentId]` | Loads | ☐ | QA |
| R3 | Report detail `[...]` | Safe `ReportDetailPage` | ☐ | QA |
| R4 | Order/invoice detail (if data) | No 500; safe error if missing | ☐ | QA |

---

## Smoke summary

| Category | Required for Production Go |
|----------|---------------------------|
| Automated (A1–A10) | All PASS on deploy SHA |
| API/DB (B1–B9) | PASS |
| Web (W1–W14) | PASS |
| WhatsApp (H1–H8) | PASS if WhatsApp in scope for go-live |
| Local AI (L1–L8) | PASS if AI in scope for go-live |
| Viewport (§6) | PASS |
| Real-data (§7) | PASS where production data exists |

If WhatsApp or Local AI intentionally deferred, document **Conditional Go** with explicit product sign-off in `RELEASE_PRODUCTION_GO_NO_GO.md`.
