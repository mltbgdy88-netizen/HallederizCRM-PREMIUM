# Viewport QA Evidence

| Field | Value |
|-------|--------|
| **Gate** | Production Go P0 — `GATE-P0-VP` |
| **Baseline `main` HEAD** | `e2f21450` |
| **Evidence run branch** | `docs/p0-viewport-qa-run-results` |
| **Last updated** | 2026-07-01 |
| **Viewport gate status** | **BLOCKED** |

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
| **date** | 2026-07-01 (local) |
| **operator** | Cursor Agent QA session (`admin@hallederiz.local`) |
| **branch** | `docs/p0-viewport-qa-run-results` |
| **HEAD** | `e2f21450` |
| **data mode** | Live API — `NEXT_PUBLIC_USE_DEMO_DATA=false` |
| **API mode** | `http://127.0.0.1:4000` (Postgres; existing process on port 4000) |
| **web** | `http://127.0.0.1:3000` |
| **browser** | Cursor embedded Chromium; CDP `Emulation.setDeviceMetricsOverride` |
| **viewport** | 1920×1080 desktop; 390×844 mobile |
| **login** | Tenant `hallederiz`, `admin@hallederiz.local`, seed password — **success** → `/dashboard` |
| **notes** | New API dev process hit `EADDRINUSE:4000`; reused existing API. Canonical operator slugs are Turkish (`/operator/kiracilar`, `/operator/duyuru-videolari`); English paths in checklist return **404**. |

---

## 3. Desktop 1920×1080 results

| route | expected | result | blocker | evidence | notes |
|-------|----------|--------|---------|----------|-------|
| `/dashboard` | Shell loads; AI column dashboard-only; no body scroll | **PASS** | YES | 2026-07-01, Cursor Agent QA, Chromium CDP 1920×1080, live API | Sidebar+main visible; no horizontal scroll; KPI/task rows visible; AI/command center content present |
| `/hizli-islem/satis-masasi` | Workbench usable; customer catalog; no horizontal scroll | **PASS** | YES | 2026-07-01, Cursor Agent QA, CDP 1920×1080 | Cari/müşteri alanı ve submit aksiyonları görünür; yükleme hatası yok |
| `/onaylar` | Command desk; ≥5 list rows or valid empty state; action column visible | **PASS** | YES | 2026-07-01, Cursor Agent QA, CDP 1920×1080 | Komut masası yüklendi; **“Bekleyen onay bulunmuyor”** empty state (veri yok); sağ panel alanı mevcut |
| `/teklifler` | List density; first row selected; right panel populated | **PASS** | YES | 2026-07-01, Cursor Agent QA, CDP 1920×1080 | Liste yoğun (≥5 satır); ilk kayıt seçili; sağ panel dolu; yatay scroll yok |
| `/operator` | Operator shell; platform context readable | **PASS** | YES | 2026-07-01, Cursor Agent QA, CDP 1920×1080 | SaaS Yönetim Konsolu; Kiracılar/Paketler/Duyuru kartları okunur |
| `/operator/announcement-videos` | CRUD list; no clipped filters | **FAIL** | YES | 2026-07-01, Cursor Agent QA, CDP 1920×1080 | **404** — route yok; tenant shell içinde “This page could not be found.” |
| `/operator/tenants` | Tenant directory; plan/status columns visible | **FAIL** | YES | 2026-07-01, Cursor Agent QA, CDP 1920×1080 | **404** — route yok; canonical slug `/operator/kiracilar` çalışıyor (4 satır görünür) |

### Desktop QA criteria checklist (per route)

- [x] Page loads without error boundary (except documented 404 routes)
- [x] Global shell intact on PASS routes
- [x] Main content visible on PASS routes
- [x] No unintended horizontal scroll on PASS routes
- [x] Primary CTAs reachable on PASS routes
- [x] List routes: teklifler ≥5 rows; onaylar valid empty state
- [x] No wrong demo fallback observed in live mode

---

## 4. Mobile 390×844 results

| route | expected | result | blocker | evidence | notes |
|-------|----------|--------|---------|----------|-------|
| `/dashboard` | Drawer nav; no horizontal scroll | **PASS** | YES | 2026-07-01, Cursor Agent QA, CDP 390×844 | Menü butonu görünür; yatay scroll yok |
| `/hizli-islem/satis-masasi` | Core actions reachable | **PASS** | YES | 2026-07-01, Cursor Agent QA, CDP 390×844 | Cari alanı erişilebilir; menü mevcut |
| `/onaylar` | Approve/reject actions visible | **PASS** | YES | 2026-07-01, Cursor Agent QA, CDP 390×844 | Empty state; onayla/reddet metinleri UI'da; menü OK |
| `/teklifler` | List + detail accessible | **PASS** | YES | 2026-07-01, Cursor Agent QA, CDP 390×844 | Liste erişilebilir; yatay scroll yok |
| `/operator` | Operator entry usable | **PASS** | YES | 2026-07-01, Cursor Agent QA, CDP 390×844 | SaaS konsol mobilde okunur |
| `/operator/announcement-videos` | List readable | **FAIL** | NO | 2026-07-01, Cursor Agent QA, CDP 390×844 | 404 (desktop ile aynı slug sorunu) |
| `/operator/tenants` | List readable | **FAIL** | NO | 2026-07-01, Cursor Agent QA, CDP 390×844 | 404 (desktop ile aynı slug sorunu) |

### Mobile QA criteria checklist (per route)

- [x] Navigation menu button present on tenant routes
- [x] Primary actions reachable on PASS blocker routes
- [x] No horizontal scroll on PASS blocker routes
- [x] Approval page accessible on mobile

---

## 5. Findings

| id | route | viewport | severity | issue | reproduction | recommended next action | fix PR required |
|----|-------|----------|----------|-------|--------------|-------------------------|-----------------|
| VP-ENV-001 | *all* | *all* | P0 | ~~Visual QA not executed~~ | — | **Superseded** by 2026-07-01 live session | NO |
| VP-DESK-001 | `/operator/announcement-videos` | 1920×1080 | **P0** | English slug returns **404**; canonical route is `/operator/duyuru-videolari` | Login → navigate `/operator/announcement-videos` | Add redirect/alias or update production checklist to Turkish slug; optional smoke link | **YES** |
| VP-DESK-002 | `/operator/tenants` | 1920×1080 | **P0** | English slug returns **404**; canonical route is `/operator/kiracilar` | Login → navigate `/operator/tenants` | Add redirect/alias or update checklist; verify plan/status columns on canonical route | **YES** |
| VP-MOB-001 | `/operator/announcement-videos`, `/operator/tenants` | 390×844 | **P2** | Same 404 on mobile (non-blocker routes) | Mobile viewport → same English URLs | Resolve with VP-DESK-001/002 | **YES** (same fix) |

**Reference (not in checklist):** `/operator/duyuru-videolari` and `/operator/kiracilar` load correctly at 1920×1080 with operator shell, forms, and tenant rows.

---

## 6. Summary

| Metric | Count |
|--------|-------|
| **desktop_pass_count** | 5 |
| **desktop_fail_count** | 2 |
| **desktop_not_run_count** | 0 |
| **mobile_pass_count** | 5 |
| **mobile_fail_count** | 2 |
| **mobile_not_run_count** | 0 |
| **production_go_impact** | Viewport P0 gate **BLOCKED** — 2 desktop blocker routes FAIL (404). Conditional Go unchanged. |
| **viewport_gate_status** | **BLOCKED** |

### Status decision rules (applied)

| Condition | Status |
|-----------|--------|
| All `blocker=YES` routes PASS | PASS |
| Any P0/P1 UI blocker finding | **BLOCKED** ← **2 desktop blocker 404s** |
| Some low-priority routes NOT_RUN only | PARTIAL |
| No visual inspection performed | NOT_RUN |

---

## Related documents

- `docs/product/PRODUCTION_GO_MANUAL_EVIDENCE.md` §4
- `docs/product/PRODUCTION_GO_OPEN_GATES.md` → `GATE-P0-VP`
- `docs/product/PRODUCTION_SMOKE_CHECKLIST.md` §3 (manual web smoke)
- `.cursor/rules/ui-designer-rules.mdc` (≥5 rows at 1920×1080)
