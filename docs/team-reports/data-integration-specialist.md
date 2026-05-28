# Data Integration Specialist — Phase 4 Report

**Agent:** Canlı Veri / SDK Entegrasyon Uzmanı  
**Date:** 2026-05-27  
**Scope:** P0 Final reference list pages → PREMIUM data layer (demo/live switch)

---

## Summary

Phase 4 introduces a reusable **`useReferenceData`** hook and thin per-module **adapters** that preserve Final reference mock shapes while routing live reads through existing PREMIUM query hooks and `@hallederiz/sdk`.

Toggle is controlled by existing `dataSourceConfig.useDemoData` (`NEXT_PUBLIC_USE_DEMO_DATA`, default `true`).

---

## Core infrastructure

| File | Role |
|------|------|
| `apps/web/src/lib/hooks/use-reference-data.ts` | Generic demo/live loader hook |
| `apps/web/src/lib/reference/formatters.ts` | TR money/date/count + table meta helpers |
| `apps/web/src/lib/reference/constants.ts` | Shared demo banner copy |
| `apps/web/src/lib/data-source.ts` | Unchanged; still canonical SDK + demo flag |

### Pattern

```tsx
// Demo: *-operasyon-mock.ts snapshot
// Live: get-*.ts / sdk → adapter maps to same snapshot shape
const { data, loading, loadFailed, isDemo } = useReferenceData({
  loadDemo: loadXReferenceDemo,
  loadLive: loadXReferenceLive,
  initialData: X_REFERENCE_INITIAL
});
```

Pages consume hook output only; **JSX layout/CSS unchanged**.

---

## P0 modules wired

| Module | Adapter | Hook | Page wired |
|--------|---------|------|------------|
| cariler | `features/cariler/adapters/cariler-reference-adapter.ts` | `use-cariler-reference-data.ts` | `CarilerOperasyonPage.tsx` |
| teklifler | `features/teklifler/adapters/teklifler-reference-adapter.ts` | `use-teklifler-reference-data.ts` | `TekliflerOperasyonPage.tsx` |
| siparisler | `features/siparisler/adapters/siparisler-reference-adapter.ts` | `use-siparisler-reference-data.ts` | `SiparislerOperasyonPage.tsx` |
| tahsilatlar | `features/tahsilatlar/adapters/tahsilatlar-reference-adapter.ts` | `use-tahsilatlar-reference-data.ts` | `TahsilatlarOperasyonPage.tsx` |
| onaylar | `features/onaylar/adapters/onaylar-reference-adapter.ts` | `use-onaylar-reference-data.ts` | `OnaylarKomutMasasiPage.tsx` |
| dashboard | `features/dashboard/adapters/dashboard-reference-adapter.ts` | `use-dashboard-reference-data.ts` | `DashboardReferencePage.tsx` |
| belgeler | `features/belgeler/adapters/belgeler-reference-adapter.ts` | `use-belgeler-reference-data.ts` | `BelgelerOperasyonPage.tsx` |
| whatsapp | `features/whatsapp/adapters/whatsapp-reference-adapter.ts` | `use-whatsapp-reference-data.ts` | `WhatsAppOperasyonPaneliPage.tsx` |
| stok | `features/stok/adapters/stok-reference-adapter.ts` | `use-stok-reference-data.ts` | `StokOperasyonPage.tsx` |

---

## Live data sources (per module)

| Module | Live query / SDK |
|--------|------------------|
| cariler | `getCustomers()` → `sdk.customers.list` |
| teklifler | `getOffers()` → `sdk.offers.list` + customers |
| siparisler | `getOrders()` → `sdk.orders.list` + customers |
| tahsilatlar | `getPayments()` → `sdk.payments.list` + customers |
| onaylar | `listApprovalsQuery()` → `sdk.approvals.list` |
| dashboard | `getDashboardLiveSnapshot()` → `sdk.dashboard.*` |
| belgeler | `getDocuments()` → `sdk.documents.list` + customers |
| whatsapp | `sdk.whatsapp.listConversations()` |
| stok | `getStockCatalog()` → `sdk` stock catalog |

Live adapters map SDK/domain types into reference table/KPI/context shapes via existing row mappers where available (`mapCustomerToRow`, `mapOfferToRow`, `mapOrderRow`, `mapPaymentRow`, `mapProductToStockRow`).

---

## Demo fidelity preserved

- Mock files (`*-operasyon-mock.ts`, `dashboard-reference-mock.ts`, etc.) **unchanged** as demo source of truth.
- Demo banner shown only when `demoBanner` is non-null (demo mode).
- Static chrome (titles, filter labels, action buttons) retained from mock metadata in both modes.
- No CSS or shell component edits.

---

## Known live-mode gaps (Phase 4 acceptable)

- KPI aggregates in live mode are **list-derived** (counts/sums), not full analytics.
- Context panels use **best-effort** mapping; rich mock-only fields (next steps, finance warnings, agent initials) fall back to placeholders when API omits data.
- Filters remain mock-defined options; live filter population is a follow-up.
- Empty API responses show empty tables with live pagination meta (no silent mock fallback in live mode).

---

## Verification

```bash
pnpm --filter @hallederiz/web typecheck   # pass
pnpm --filter @hallederiz/ui typecheck    # pass
```

Recommended manual check:

```bash
# Demo (default)
NEXT_PUBLIC_USE_DEMO_DATA=true pnpm --filter @hallederiz/web dev

# Live
NEXT_PUBLIC_USE_DEMO_DATA=false NEXT_PUBLIC_API_BASE_URL=http://localhost:4000 pnpm --filter @hallederiz/web dev
```

Visit P0 routes: `/cariler`, `/teklifler`, `/siparisler`, `/tahsilatlar`, `/onaylar`, `/dashboard`, `/belgeler`, `/whatsapp`, `/stok`.

---

## Out of scope (not modified)

- `apps/api`, `packages/domain`, `packages/database`, migrations, auth
- Shell / `platform-shell.tsx` / CSS
- Detail/katman sub-routes (list operasyon masası only)
- Mutation / approval execution wiring

---

## Next steps (Phase 5 suggestions)

1. Populate filter dropdowns from live distinct values.
2. Wire detail/katman pages with `useReferenceDetailData` variant.
3. Add loading/error UI bands (fail-closed messaging) without breaking reference density.
4. Integration tests: demo flag toggles + empty live list behavior.

---

## Hizli Islem

**Date:** 2026-05-27  
**Scope:** P1 — `/hizli-islem` merkez + `/hizli-islem/satis-masasi` reference UI → demo/live data layer (no CSS/shell).

### Wired routes

| Route | Adapter | Hook | Page |
|-------|---------|------|------|
| `/hizli-islem` | `features/hizli-islem/adapters/hizli-islem-reference-adapter.ts` | `use-hizli-islem-reference-data.ts` | `HizliIslemMerkeziPage.tsx` |
| `/hizli-islem/satis-masasi` | `features/hizli-islem/adapters/hizli-islem-satis-masasi-reference-adapter.ts` | `use-hizli-islem-satis-masasi-reference-data.ts` | `HizliIslemSatisMasasiPage.tsx` |

Sub-routes (`/hizli-islem/siparis`, `/teklif`, …) unchanged: redirect to `/hizli-islem` or catch-all.

### Toggle

- `NEXT_PUBLIC_USE_DEMO_DATA=true` (default): mock snapshots (`hizli-islem-mock.ts`, `hizli-islem-satis-masasi-mock.ts`).
- `false`: live reads via existing PREMIUM queries (same paths as operasyon masaları).

### Live data sources

| Surface | Live query / mapping |
|---------|----------------------|
| Merkezi — Son İşlemler | `getOrders()` + `getOffers()` + `getPayments()` → merged feed (sipariş, teklif, tahsilat, teslim-from-order); top 5 by `updatedAt` / `receivedAt` |
| Merkezi — action cards | Static `HI_ACTION_CARDS` (unchanged) |
| Satış masası — Son İşlemler | `getOrders()` → `mapOrderRow` + status labels (Taslak / Onayda / Onaylandı) |
| Satış masası — ürün satırları + özet | `getStockCatalog()` → first 5 products, `formatTryMoney` + derived summary |
| Form labels | Static `HISM_FORM` metadata |

Shared helper: `formatRelativeTimeAgo` in `apps/web/src/lib/reference/formatters.ts`.

### Out of scope (this pass)

- `use-quick-operation-state` workbench (preview/submit) — still separate PREMIUM path; reference pages are read-only display.
- Demo banner UI on HI pages (snapshot includes `demoBanner`; no layout change).
- Mutation / Kaydet / Onaya Gönder execution.

### Verification

```bash
pnpm --filter @hallederiz/web typecheck   # pass
```

Manual: toggle `NEXT_PUBLIC_USE_DEMO_DATA` and visit `/hizli-islem`, `/hizli-islem/satis-masasi`.

---

## SDK entegrasyon — Gelen Kutu + Hızlı İşlem önizleme (2026-05-27)

**Görev:** Gelen kutuda sohbet seçiminde canlı mesaj yükleme; Hızlı İşlem merkezinde kart önizleme altyapısı.

### Değişen dosyalar

| Dosya | Değişiklik |
|-------|------------|
| `apps/web/src/features/gelen-kutu/adapters/gelen-kutu-reference-adapter.ts` | `fetchGelenKutuMessagesForConversation()` — `sdk.omnichannel.listMessages` |
| `apps/web/src/features/gelen-kutu/components/GelenKutuOperasyonPaneliPage.tsx` | `isDemo` ile demo/canlı mesaj ayrımı, yükleme/boş durum |
| `apps/web/src/features/hizli-islem/lib/hizli-islem-action-preview.ts` | Kart → `QuickOperationType`, hub önizleme payload + `previewQuickOperationRecord` |
| `apps/web/src/features/hizli-islem/hooks/use-hizli-islem-action-preview.ts` | Önizleme state/hook |
| `apps/web/src/features/hizli-islem/components/HizliIslemActionPreviewPanel.tsx` | Salt okunur önizleme paneli (TR) |
| `apps/web/src/features/hizli-islem/components/HizliIslemMerkeziPage.tsx` | Kart tıklama → önizleme; İşleme başla → demo toast |
| `apps/web/src/features/hizli-islem/hooks/use-hizli-islem-reference-data.ts` | `isDemo`, `demoBanner` dışa aktarımı |

**Dokunulmadı:** `apps/api`, `packages/database`, `packages/domain`, migration, auth, shell/CSS.

### Gelen Kutu — demo vs canlı

| Mod | Sohbet listesi | Mesajlar (satır seçimi) |
|-----|----------------|-------------------------|
| **Demo** (`NEXT_PUBLIC_USE_DEMO_DATA=true`) | Adapter mock + WhatsApp demo birleşimi | Sabit `GKOP_MESSAGES` (adapter); SDK çağrısı yok |
| **Canlı** | `sdk.omnichannel.listConversations` (+ WhatsApp fallback) | Her `selectedId` değişiminde `fetchGelenKutuMessagesForConversation` → `sdk.omnichannel.listMessages` |

- Kısa **“Mesajlar yükleniyor…”** durumu; hata/boş listede kullanıcı mesajı.
- WhatsApp gönderimi / outbound mutation **eklenmedi** (composer salt okunur).

### Hızlı İşlem merkezi — demo vs canlı

| Mod | Son işlemler | Kart önizleme | İşleme başla |
|-----|--------------|---------------|--------------|
| **Demo** | `HI_RECENT` mock | `previewQuickOperationRecord` → demo hesaplama (mevcut servis) | Toast: demo kayıt yok |
| **Canlı** | `getOrders` / `getOffers` / `getPayments` birleşik feed | `sdk.quickOperations.previewQuickOperation` (read-only) | Toast: bu ekrandan kayıt oluşturulmaz (onay akışı) |

- **Etki Analizi** kartı: API önizlemesi yok; bilgi notu gösterilir.
- `submitQuickOperationRecord` hub sayfasından **çağrılmaz** (onay bypass yok).

### Typecheck

```bash
pnpm --filter @hallederiz/web typecheck
```

**Sonuç (2026-05-27):** Bu görevde eklenen `gelen-kutu` / `hizli-islem` dosyalarında lint/type hatası yok. Tam paket typecheck, önceden var olan `cariler-detay-reference-adapter` / `use-cariler-detay-reference-data` hataları nedeniyle **başarısız** (bu PR kapsamı dışı).

### Manuel doğrulama

```powershell
# Demo
$env:NEXT_PUBLIC_USE_DEMO_DATA="true"
pnpm --filter @hallederiz/web dev

# Canlı (API gerekir)
$env:NEXT_PUBLIC_USE_DEMO_DATA="false"
$env:NEXT_PUBLIC_API_BASE_URL="http://localhost:4000"
pnpm --filter @hallederiz/web dev
```

- `/gelen-kutu` — sohbet satırı değiştir → canlıda mesajların yenilenmesi.
- `/hizli-islem` — karta tıkla → önizleme paneli; **İşleme başla** → toast.

---

## Phase 5 — Liste → detay deep link + Tahsilat detay masası (2026-05-27)

### Task A — Operasyon listelerinden detay deep link

Satır tıklaması `router.push` ile detay route’una gider; **Detay** / **Görüntüle** `Link` ile aynı query parametrelerini kullanır (`stopPropagation` aksiyon kolonunda).

| Sayfa | Hedef URL |
|-------|-----------|
| `SiparislerOperasyonPage` | `/siparisler/detay?orderId={id}` |
| `TekliflerOperasyonPage` | `/teklifler/detay?offerId={id}` |
| `TahsilatlarOperasyonPage` | `/tahsilatlar/detay?paymentId={id}` |
| `CarilerOperasyonPage` | `/cariler/detay?customerId={id}` |

**Değişen dosyalar:** `siparisler/components/SiparislerOperasyonPage.tsx`, `teklifler/components/TekliflerOperasyonPage.tsx`, `tahsilatlar/components/TahsilatlarOperasyonPage.tsx`, `cariler/components/CarilerOperasyonPage.tsx`

### Task B — Tahsilat detay masası (PREMIUM veri)

`siparisler-detay` deseni: demo mock snapshot + canlı `getPayments()` / `getCustomers()` → `tahsilatlar-detay-mock` UI şekli.

| Dosya | Rol |
|-------|-----|
| `tahsilatlar/adapters/tahsilatlar-detay-reference-adapter.ts` | Demo clone + `buildLiveSnapshot` (özet, adımlar, dağılım, cari bağlam) |
| `tahsilatlar/hooks/use-tahsilat-payment-id.ts` | `?paymentId=` / `?id=` çözümü |
| `tahsilatlar/hooks/use-tahsilatlar-detay-reference-data.ts` | Demo/live yükleme |
| `tahsilatlar/components/TahsilatlarDetayMasasiPage.tsx` | Hook verisi; mutation butonlarında demo toast |

Canlı kaynak: `getPayments()` → `mapPaymentRow`, `getPaymentSummary`, allocation satırları → dağılım tablosu.

### Typecheck

```bash
pnpm --filter @hallederiz/web typecheck
```

**Sonuç (2026-05-27):** Bu görevde eklenen/değişen dosyalarda TS hatası yok. Tam paket typecheck, önceden var olan `teslimatlar/components/TeslimatlarOperasyonPage.tsx` (`TSM_TABLE_ROWS` vb.) nedeniyle **başarısız** (bu görev kapsamı dışı).
