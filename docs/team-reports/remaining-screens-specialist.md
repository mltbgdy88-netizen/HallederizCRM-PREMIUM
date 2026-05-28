# Remaining Screens Specialist — Phase 3 Report

**Agent:** Kalan Ekranlar Uzmanı  
**Date:** 2026-05-27  
**Workspace:** `xxxhallederizcrm` only  
**DONE_SCREENS:** 85/85 `done` ([`docs/design/final-reference/DONE_SCREENS.md`](../design/final-reference/DONE_SCREENS.md))

---

## Executive summary

Final reference UI exposes **82 routable screens** (81 feature routes + root skipped). PREMIUM now matches **81/81** audited reference paths across `(platform)`, `(emerald)`, `login`, and `(offline-shell)`. Added **13 redirect aliases** for system paths, legacy URLs, and katman segment naming. Fixed **`/offline-api` duplicate route** (platform command center vs reference offline shell). Wire script targets correct app segments.

---

## 1. Wire script (`wire-reference-routes.mjs`)

| Item | Result |
|------|--------|
| Final `page.tsx` count | 82 |
| Wired after rewrites (excl. `/`) | 81 unique + special layouts |
| Target root | `apps/web/app/(platform)` |
| Special layouts | `/login` → `app/login`; `/ana-sayfa` → `(emerald)`; `/offline-api` → `(offline-shell)` |
| System rewrites | `/arsiv`→`/archive`, `/demo`→`/demo-mode`, `/empty`→`/live-empty`, `/offline`→`/offline-api` |

**Fix applied:** `resolveTargetDir` previously nested under `(platform)/(platform)` and misplaced offline/login. Now uses `apps/web/app` as root.

**Run:** `node scripts/merge/wire-reference-routes.mjs`

---

## 2. Route audit (`audit-reference-routes.mjs`)

```
Final wired routes: 81
PREMIUM matched: 81
Missing: 0
```

**Run:** `node scripts/merge/audit-reference-routes.mjs`

**Note on “82 vs 85”:** Master queue has **85 PNGs**; **#82–#85** are duplicates of existing routes (arsiv, raporlar, stok, whatsapp). Unique implementable routes = **82** from Final app tree.

---

## 3. Alias routes (`create-reference-route-aliases.mjs`)

Created **13** permanent redirects under `(platform)`:

### System (Final → PREMIUM canonical)

- `/arsiv` → `/archive`
- `/demo` → `/demo-mode`
- `/empty` → `/live-empty`
- `/offline` → `/offline-api`

### Legacy PREMIUM

- `/approvals` → `/onaylar`
- `/dashboard/approvals` → `/onaylar`
- `/ai/insights` → `/ai/icgoruler`
- `/ai/proposals` → `/ai/onaylar`
- `/tasks` → `/gorevler`

### Katman segment (dynamic naming → Final static)

- `/teklifler/katman/siparise-donusturme` → `/teklifler/katman/donusum`
- `/siparisler/katman/odeme-tahsilat` → `/siparisler/katman/odeme`
- `/siparisler/katman/depo-stok-etkisi` → `/siparisler/katman/depo-stok`

### Module list

- `/fabrikalar/siparisler` → `/fabrikalar/siparis`

**Parallel routes preserved:** Final static `/detay` and `/katman/*` remain alongside PREMIUM `/[id]/*` (per [`docs/MERGE_ROUTE_MAP.md`](../MERGE_ROUTE_MAP.md)). Demo IDs centralized in `apps/web/src/lib/reference/reference-route-ids.ts` for future dynamic↔mock bridging.

**Run:** `node scripts/merge/create-reference-route-aliases.mjs`

---

## 4. Route conflict fix

- **Removed** `apps/web/app/(platform)/offline-api/page.tsx` (command-center placeholder).
- **Canonical reference:** `apps/web/app/(offline-shell)/offline-api/page.tsx` → `OfflineApiStatePage` (PNG #80).

---

## 5. Scope modules — coverage check

| Area | Static reference | Dynamic `[id]` | Aliases |
|------|------------------|----------------|---------|
| cariler / teklifler / siparisler | `/katman/*`, `/detay` | `/[customerId]`, `/[offerId]`, `/[orderId]` | Segment + liste→root (pre-existing) |
| fabrikalar, ERP, ayarlar, kullanicilar | ✅ | fabrikalar `[factoryOrderId]` | siparisler→siparis |
| gelen-kutu, AI | ✅ | `konusma/[conversationId]` | insights/proposals |
| raporlar, archive, stok | ✅ | catch-all slugs | arsiv→archive |
| depo, teslimat, fatura, iade, gorevler | `/detay` | `[id]` routes | — |
| hizli-satis, workflow, ana-sayfa | ✅ | workflow `[entityType]/[entityId]` | ana-sayfa in emerald |

**Not modified:** P0 shell files (`platform-shell`, sidebar) except shared offline route dedup.

---

## 6. Quality gates

| Command | Result |
|---------|--------|
| `pnpm --filter @hallederiz/web typecheck` | PASS |
| `pnpm --filter @hallederiz/ui typecheck` | PASS |
| `pnpm smoke:navigation` | PASS (24 checks) |

---

## 7. Files touched

- `scripts/merge/wire-reference-routes.mjs` — path fix
- `scripts/merge/audit-reference-routes.mjs` — new
- `scripts/merge/create-reference-route-aliases.mjs` — new
- `apps/web/src/lib/reference/reference-route-ids.ts` — new
- `apps/web/app/(platform)/offline-api/page.tsx` — **deleted**
- `apps/web/app/(platform)/**/page.tsx` — 13 alias redirects generated
- `docs/MERGE_ROUTE_MAP.md` — alias section

---

## 8. Phase 4 — Cariler detay + katman data binding (2026-05-27)

**Scope:** `apps/web/src/features/cariler/**` only (no backend).

| Module | Status | Data source |
|--------|--------|-------------|
| Cariler operasyon listesi | Done (prior) | `cariler-reference-adapter` → `getCustomers` |
| Cariler detay masası (`/cariler/detay`) | Done | `cariler-detay-reference-adapter` → `getCustomerDetail`, `getOrders`, `getOffers`, `getPayments` |
| Cariler katman (`/cariler/katman/*`) | Done | `cariler-katman-reference-adapter` → same + ledger/contacts |

**Customer id resolution:** `useCarilerCustomerId` — prop override, `?customerId=` / `?id=`, fallback `REFERENCE_ROUTE_IDS.customerId` (`customer_1`).

**UI rules:** Mutation buttons → `useCarilerDemoAction` (toast, no CRM write). Demo banner when `useDemoData`.

### Files added

- `apps/web/src/features/cariler/adapters/cariler-entity-reference-utils.ts`
- `apps/web/src/features/cariler/adapters/cariler-detay-reference-adapter.ts`
- `apps/web/src/features/cariler/adapters/cariler-katman-reference-adapter.ts`
- `apps/web/src/features/cariler/hooks/use-cariler-customer-id.ts`
- `apps/web/src/features/cariler/hooks/use-cariler-detay-reference-data.ts`
- `apps/web/src/features/cariler/hooks/use-cariler-katman-reference-data.ts`
- `apps/web/src/features/cariler/hooks/use-cariler-demo-action.ts`

### Files updated

- `apps/web/src/features/cariler/components/CarilerDetayMasasiPage.tsx`
- `apps/web/src/features/cariler/components/CarilerKatmanShared.tsx`
- `apps/web/src/features/cariler/components/CarilerKatmanOzetPage.tsx`
- `apps/web/src/features/cariler/components/CarilerKatmanIletisimPage.tsx`
- `apps/web/src/features/cariler/components/CarilerKatmanFinansPage.tsx`
- `apps/web/src/features/cariler/components/CarilerKatmanTekliflerPage.tsx`
- `apps/web/src/features/cariler/components/CarilerKatmanSiparislerPage.tsx`
- `apps/web/src/features/cariler/components/CarilerKatmanTahsilatlarPage.tsx`
- `apps/web/src/features/cariler/components/CarilerKatmanTimelinePage.tsx`

### Quality (this pass)

| Command | Result |
|---------|--------|
| `pnpm --filter @hallederiz/web typecheck` | PASS |

**Not done (Priority B):** `SiparislerDetayMasasiPage`, `TekliflerDetayMasasiPage` — deferred.

---

## 9. Phase 5 — Teslimatlar, Faturalar, İadeler data binding (2026-05-27)

**Scope:** `apps/web/src/features/teslimatlar/**`, `faturalar/**`, `iadeler/**` only (no backend).

| Screen | Status | Data source |
|--------|--------|-------------|
| Teslimatlar operasyon (`/teslimatlar`) | Done | `teslimatlar-reference-adapter` → `getDeliveries` |
| Teslimatlar rota (`/teslimatlar/rota`) | Done | `teslimatlar-rota-reference-adapter` → `getDeliveries` (KPI + liste + duraklar) |
| Teslimatlar detay (`/teslimatlar/detay`) | Done | `teslimatlar-detay-reference-adapter` → `getDeliveryDetail` |
| Faturalar operasyon (`/faturalar`) | Done | `faturalar-reference-adapter` → `getInvoices` |
| İadeler operasyon (`/iadeler`) | Done | `iadeler-reference-adapter` → `getReturns` |

**Entity id resolution:** `useTeslimatlarDeliveryId` — `?deliveryId=` / `?id=`, fallback `REFERENCE_ROUTE_IDS.deliveryId`. Fatura/iade detay linkleri `?id=` ile satır id’si taşır.

**UI rules:** Mutation butonları → `useCarilerDemoAction` (toast, CRM write yok). Demo modda detay sayfasında `REFERENCE_DEMO_BANNER`.

### Files added

- `apps/web/src/features/teslimatlar/adapters/teslimatlar-reference-adapter.ts`
- `apps/web/src/features/teslimatlar/adapters/teslimatlar-rota-reference-adapter.ts`
- `apps/web/src/features/teslimatlar/adapters/teslimatlar-detay-reference-adapter.ts`
- `apps/web/src/features/teslimatlar/hooks/use-teslimatlar-reference-data.ts`
- `apps/web/src/features/teslimatlar/hooks/use-teslimatlar-rota-reference-data.ts`
- `apps/web/src/features/teslimatlar/hooks/use-teslimatlar-detay-reference-data.ts`
- `apps/web/src/features/teslimatlar/hooks/use-teslimatlar-delivery-id.ts`
- `apps/web/src/features/faturalar/adapters/faturalar-reference-adapter.ts`
- `apps/web/src/features/faturalar/hooks/use-faturalar-reference-data.ts`
- `apps/web/src/features/iadeler/adapters/iadeler-reference-adapter.ts`
- `apps/web/src/features/iadeler/hooks/use-iadeler-reference-data.ts`

### Files updated

- `apps/web/src/features/teslimatlar/components/TeslimatlarOperasyonPage.tsx`
- `apps/web/src/features/teslimatlar/components/TeslimatlarRotaOperasyonPage.tsx`
- `apps/web/src/features/teslimatlar/components/TeslimatlarDetayMasasiPage.tsx`
- `apps/web/src/features/faturalar/components/FaturalarOperasyonPage.tsx`
- `apps/web/src/features/iadeler/components/IadelerOperasyonPage.tsx`

### Quality (this pass)

| Command | Result |
|---------|--------|
| `pnpm --filter @hallederiz/web typecheck` | PASS |
| `pnpm --filter @hallederiz/ui typecheck` | PASS |

**Not done:** `FaturalarDetayMasasiPage`, `IadelerDetayMasasiPage` — operasyon listeleri önceliklendi; detay masaları mock’ta kalır.

---

## 10. Follow-ups (non-blocking)

1. Run `node scripts/merge/wire-reference-routes.mjs` after Final UI pulls only when feature imports change (idempotent rewrite).
2. Visual QA: katman alias redirects should land on same PNG-backed pages as Director sign-off.
3. Optional: add `pnpm merge:audit-routes` script alias in root `package.json` for CI.

---

## 11. Self-check vs UI rules

- Shell PageMeta: not changed (out of scope).
- First-viewport row count: not re-measured this pass; prior QA reports remain authoritative.
- P0 modules: not modified.
