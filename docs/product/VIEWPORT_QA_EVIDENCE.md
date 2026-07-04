# Viewport QA Evidence

| Field | Value |
|-------|--------|
| **Gate** | Production Go P0 — `GATE-P0-VP` |
| **Baseline `main` HEAD** | `6ef1645c` |
| **Evidence run branch** | `docs/p0-viewport-qa-rerun` |
| **Last updated** | 2026-07-04 |
| **Viewport gate status** | **PASS** |

---

## 1. Scope

### Production Go P0 manual gate

Viewport QA is a **merge blocker** for full Production Go (`PRODUCTION_GO_OPEN_GATES.md` → `GATE-P0-VP`). This document is the canonical evidence ledger for visual/layout checks at fixed viewports.

### Viewports (required)

| id | Size | Use |
|----|------|-----|
| `VP-DESKTOP` | **1920×1080** | Desktop operator cockpit |
| `VP-MOBILE` | **390×844** | Mobile field / approval access |

### Routes (critical)

| Route | Desktop blocker | Mobile blocker |
|-------|-----------------|----------------|
| `/dashboard` | YES | YES |
| `/hizli-islem/satis-masasi` | YES | YES |
| `/onaylar` | YES | YES |
| `/teklifler` | YES | YES |
| `/operator` | YES | YES |
| `/operator/announcement-videos` | YES | NO |
| `/operator/tenants` | YES | NO |

### Evidence policy

A row may be marked **PASS** only when all of the following are recorded:

1. **Date** (UTC or local with timezone noted)
2. **Operator** (human name or approved QA account)
3. **Viewport** (exact pixels)
4. **Route** (path)
5. **Result** (PASS / FAIL)
6. **Evidence** — operator session note, external screenshot reference, or CDP inspection log (screenshots **not** committed to repo unless explicitly approved)
7. **Observation notes** — scroll, row count, panel overflow, CTA visibility

**FAIL** or **NOT_RUN** on any `blocker=YES` route blocks `viewport_gate_status=PASS`.

---

## 2. Environment

| Field | Value |
|-------|--------|
| **date** | 2026-07-04 (local, UTC+3) |
| **operator** | Cursor Agent QA session (`admin@hallederiz.local`) |
| **branch** | `docs/p0-viewport-qa-rerun` |
| **HEAD** | `6ef1645c` (includes PR #190 operator route alias fix) |
| **data mode** | Live API — `NEXT_PUBLIC_USE_DEMO_DATA=false` |
| **API mode** | `http://127.0.0.1:4000` (Postgres persistence) |
| **web** | `http://127.0.0.1:3000` (Next.js dev) |
| **browser** | Playwright Chromium headless; viewport override 1920×1080 / 390×844 |
| **login** | Tenant `hallederiz`, `admin@hallederiz.local`, seed password — **success** → `/dashboard` |
| **notes** | Post-#190 re-run. English operator alias paths redirect to canonical Turkish slugs. No screenshots committed. |

---

## 3. Desktop 1920×1080 results

| route | expected | result | blocker | evidence | notes |
|-------|----------|--------|---------|----------|-------|
| `/dashboard` | Shell loads; AI column dashboard-only; no body scroll | **PASS** | YES | 2026-07-04, Cursor Agent QA, Chromium 1920×1080, live API, main 6ef1645c | Sidebar+main visible; KPI/task content present; no horizontal scroll |
| `/hizli-islem/satis-masasi` | Workbench usable; customer catalog; no horizontal scroll | **PASS** | YES | 2026-07-04, Cursor Agent QA, Chromium 1920×1080, live API | Cari/müşteri alanı ve submit aksiyonları görünür; yükleme hatası yok |
| `/onaylar` | Command desk; ≥5 list rows or valid empty state; action column visible | **PASS** | YES | 2026-07-04, Cursor Agent QA, Chromium 1920×1080, live API | Komut masası yüklendi; empty state veya liste OK; sağ panel alanı mevcut |
| `/teklifler` | List density; first row selected; right panel populated | **PASS** | YES | 2026-07-04, Cursor Agent QA, Chromium 1920×1080, live API | Liste yoğun; sağ panel dolu veya geçerli empty state; yatay scroll yok |
| `/operator` | Operator shell; platform context readable | **PASS** | YES | 2026-07-04, Cursor Agent QA, Chromium 1920×1080, live API | SaaS Yönetim Konsolu; Kiracılar/Paketler/Duyuru kartları okunur |
| `/operator/announcement-videos` | Alias redirect; canonical CRUD list | **PASS** | YES | 2026-07-04, Cursor Agent QA, Chromium 1920×1080, live API | Redirect → `/operator/duyuru-videolari`; form/list okunur; **404 yok** |
| `/operator/tenants` | Alias redirect; tenant directory | **PASS** | YES | 2026-07-04, Cursor Agent QA, Chromium 1920×1080, live API | Redirect → `/operator/kiracilar`; tenant listesi + plan/status görünür; **404 yok** |

### Desktop QA criteria checklist (per route)

- [x] Page loads without error boundary
- [x] Global shell intact on all blocker routes
- [x] Main content visible on all blocker routes
- [x] No unintended horizontal scroll on blocker routes
- [x] Primary CTAs reachable on blocker routes
- [x] Operator alias routes redirect to canonical Turkish slugs
- [x] No wrong demo fallback observed in live mode

---

## 4. Mobile 390×844 results

| route | expected | result | blocker | evidence | notes |
|-------|----------|--------|---------|----------|-------|
| `/dashboard` | Drawer nav; no horizontal scroll | **PASS** | YES | 2026-07-04, Cursor Agent QA, Chromium 390×844, live API | Menü kontrolü görünür; yatay scroll yok |
| `/hizli-islem/satis-masasi` | Core actions reachable | **PASS** | YES | 2026-07-04, Cursor Agent QA, Chromium 390×844, live API | Cari alanı erişilebilir; menü mevcut |
| `/onaylar` | Approve/reject actions visible | **PASS** | YES | 2026-07-04, Cursor Agent QA, Chromium 390×844, live API | Onay masası mobilde erişilebilir |
| `/teklifler` | List + detail accessible | **PASS** | YES | 2026-07-04, Cursor Agent QA, Chromium 390×844, live API | Liste erişilebilir; yatay scroll yok |
| `/operator` | Operator entry usable | **PASS** | YES | 2026-07-04, Cursor Agent QA, Chromium 390×844, live API | SaaS konsol mobilde okunur |
| `/operator/announcement-videos` | Alias redirect; list readable | **PASS** | NO | 2026-07-04, Cursor Agent QA, Chromium 390×844, live API | Redirect → duyuru-videolari; içerik okunur |
| `/operator/tenants` | Alias redirect; list readable | **PASS** | NO | 2026-07-04, Cursor Agent QA, Chromium 390×844, live API | Redirect → kiracilar; tenant listesi okunur |

### Mobile QA criteria checklist (per route)

- [x] Navigation menu button present on tenant routes
- [x] Primary actions reachable on PASS blocker routes
- [x] No horizontal scroll on PASS blocker routes
- [x] Approval page accessible on mobile
- [x] Operator alias routes redirect correctly on mobile

---

## 5. Findings

| id | route | viewport | severity | issue | reproduction | recommended next action | fix PR required |
|----|-------|----------|----------|-------|--------------|-------------------------|-----------------|
| VP-ENV-001 | *all* | *all* | P0 | ~~Visual QA not executed~~ | — | **Superseded** by 2026-07-01 live session | NO |
| VP-DESK-001 | `/operator/announcement-videos` | 1920×1080 | **P0** | ~~English slug returns **404**~~ | Login → alias path | **CLOSED** — PR #190 alias redirect; re-run PASS 2026-07-04 | NO |
| VP-DESK-002 | `/operator/tenants` | 1920×1080 | **P0** | ~~English slug returns **404**~~ | Login → alias path | **CLOSED** — PR #190 alias redirect; re-run PASS 2026-07-04 | NO |
| VP-MOB-001 | `/operator/announcement-videos`, `/operator/tenants` | 390×844 | **P2** | ~~Same 404 on mobile~~ | Mobile viewport → alias URLs | **CLOSED** — alias redirect PASS 2026-07-04 | NO |

**Canonical spot-check (2026-07-04):** `/operator/duyuru-videolari` and `/operator/kiracilar` load correctly at 1920×1080 with operator shell, forms, and tenant rows.

---

## 6. Summary

| Metric | Count |
|--------|-------|
| **desktop_pass_count** | 7 |
| **desktop_fail_count** | 0 |
| **desktop_not_run_count** | 0 |
| **mobile_pass_count** | 7 |
| **mobile_fail_count** | 0 |
| **mobile_not_run_count** | 0 |
| **production_go_impact** | Viewport gate **PASS** after PR #190 alias fix. Full Production Go remains **Conditional Go** (WhatsApp + Local AI P0 gates open). |
| **viewport_gate_status** | **PASS** |

### Status decision rules (applied)

| Condition | Status |
|-----------|--------|
| All `blocker=YES` routes PASS | **PASS** ← current |
| Any P0/P1 UI blocker finding open | BLOCKED |
| Some routes NOT_RUN only | PARTIAL |
| No visual inspection performed | NOT_RUN |

---

## 7. Alias re-run verification (2026-07-04)

Post PR #190 — App Router redirect pages under `(operator)` layout.

| alias route | canonical target | desktop | mobile | operator shell | auth guard |
|-------------|------------------|---------|--------|----------------|------------|
| `/operator/announcement-videos` | `/operator/duyuru-videolari` | **PASS** | **PASS** | YES | YES |
| `/operator/tenants` | `/operator/kiracilar` | **PASS** | **PASS** | YES | YES |
| `/operator/duyuru-videolari` | — | **PASS** | **PASS** | YES | YES |
| `/operator/kiracilar` | — | **PASS** | **PASS** | YES | YES |

Environment: web dev `http://127.0.0.1:3000`, API `http://127.0.0.1:4000`, live mode, `admin@hallederiz.local`.

---

- `docs/product/PRODUCTION_GO_MANUAL_EVIDENCE.md` §4
- `docs/product/PRODUCTION_GO_OPEN_GATES.md` → `GATE-P0-VP`
- `docs/product/PRODUCTION_SMOKE_CHECKLIST.md` §3 (manual web smoke)
- `.cursor/rules/ui-designer-rules.mdc` (≥5 rows at 1920×1080)
