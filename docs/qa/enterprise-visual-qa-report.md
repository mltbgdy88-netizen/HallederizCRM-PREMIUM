# Enterprise Visual QA Raporu

- **Tarih:** 2026-06-08
- **Main HEAD:** `930ac2e` (T5-P3A + T5-P3B dahil)
- **Yöntem:** Statik kod/CSS/route incelemesi + smoke route doğrulaması. Tarayıcı/Playwright çalıştırılmadı.
- **Viewport hedefi:** 1920×1080, 1366×768

## Özet karar

**VISUAL_QA_WARNINGS** — Yapısal hizalama (T5-P1/P2/P3A/P3B) kodda tutarlı; cariler kök/katman ayrımı ve sticky KPI davranışı yerelde tarayıcı ile doğrulanmalı.

---

## Kontrol matrisi

| Ekran | Route | Layout prefix | Shared primitive | Sticky KPI | Tab/nav kaynağı |
|-------|-------|---------------|------------------|------------|-----------------|
| Tahsilat yeni | `/tahsilatlar/yeni` | T4 form | — | — | Sayfa içi |
| Tahsilat detay | `/tahsilatlar/demo-payment-001` | `tdf-*` | T5-P1 `DetailReferenceShell` | `tdf-sticky-summary` | Route içi |
| Sipariş detay | `/siparisler/demo-order-001` | `spd-*` | T5-P2 | `spd-sticky-summary` | `OrderEntityLayerNav` |
| Sipariş özet | `/siparisler/demo-order-001/ozet` | `spd-*` layer | T5-P2 | Evet | EntityLayerNav |
| Teklif detay | `/teklifler/demo-offer-001` | `ofd-*` | T5-P2 | `ofd-sticky-summary` | `OfferEntityLayerNav` |
| Teklif özet | `/teklifler/demo-offer-001/ozet` | `ofd-*` layer | T5-P2 | Evet | EntityLayerNav |
| Cari kök | `/cariler/demo-customer-001` | `cdm-*` | P3A state only | Yok | `CUSTOMER_LAYER_NAV_ITEMS` (aktif tab yok) |
| Cari özet | `/cariler/demo-customer-001/ozet` | `cul-*` | P3B shell/KPI | `cul-sticky-summary` | `cul-tabs` + kanonik nav |
| Cari finans | `/cariler/demo-customer-001/finans` | `cul-*` | P5-P3B | Evet (özet/finans KPI) | `cul-tabs` |

---

## 1920×1080 — statik değerlendirme

### T4 / T5-P1 — Tahsilat

- `tdf-page` + `tdf-shell__scroll` + sticky özet şeridi sipariş/teklif ile aynı pattern.
- Shell PageMeta suppress route meta ile uyumlu (`platform-route-meta.ts`).
- **Risk:** Yok (kod parity yüksek). **Yerel:** sticky scroll kanıtı gerekli.

### T5-P2 — Sipariş / Teklif

- Katman sayfaları: command center shell + `EntityLayerNav` + `SummaryScroll` + sticky KPI.
- `grid-template-rows: auto auto minmax(0,1fr)` layer shell'de tanımlı.
- **Risk:** Dar ekranda `@media (max-width: 960px)` sticky → static (sipariş/teklif CSS).
- **Yerel:** KPI 6 kolon 1366'da kırılım kontrolü.

### T5-P3A — Cariler nav

- Tek kaynak `customer-layer-nav.ts`; kök ve katman tab sırası: Özet → İletişim → Finans → … → Zaman Akışı.
- Kök `cdm-tabs`: hiçbir sekme `aria-selected` aktif değil (kök “Detay” tab listesinde yok).
- **Risk (UX):** Kök sayfada hangi sekmenin bağlam olduğu görsel olarak belirsiz.
- **Yerel:** Tab sırası finans/özet geçişinde tutarlılık.

### T5-P3B — Cariler katman shell

- Anatomi: `LayerShell → Header → Tabs → SummaryScroll → [DemoBand, KpiStrip, LayoutBody]`.
- `cul-sticky-summary` yalnızca KPI; breadcrumb/hero sticky değil.
- Timeline `cul-workspace--timeline` 3 kolon korunuyor.
- **Risk:** KPI sticky + sağ `cul-side` z-index çakışması teorik; CSS `z-index:2` + side ayrı kolon.
- **Yerel:** Özet/finans scroll sırasında KPI pin davranışı.

### Cariler kök (`cdm-*`)

- Panel grid (`cdm-grid`), breadcrumb yok, responsive `@media` yok (`cariler-detay-reference.css`).
- **Risk (1366×768):** Kök detayta yatay sıkışma / düşük satır görünürlüğü olası.
- **Karar:** P3C öncesi kök responsive doğrulama önerilir.

---

## 1366×768 — statik değerlendirme

| Alan | Durum | Not |
|------|--------|-----|
| `cul-*` breakpoint 1280/980 | Tanımlı | KPI 3→2 kolon, workspace tek kolon (980) |
| `cdm-*` breakpoint | **Yok** | Kök detay riskli |
| Sticky KPI 960 altı | `position: static` | Cariler + sipariş/teklif/tahsilat uyumlu |
| Horizontal scroll | Global selector yok | Prefix kuralına uygun |

---

## Çift başlık / çift tab

| Sayfa | Durum |
|-------|--------|
| Sipariş/teklif katman | Tek `EntityLayerNav` — OK |
| Cariler katman | Yalnız `cul-tabs` — `EntityLayerNav` wire yok — OK (çift tab yok) |
| Cariler kök | Shell PageMeta suppress — OK |
| Cariler katman breadcrumb + hero h1 | İkinci başlık bandı yok — OK |

---

## Loading / notFound

- Cariler: `CustomerReferenceLoadingState` / `NotFoundState` (`cdm-state` / `cul-state`) — T5 primitive hizalı.
- Tahsilat/sipariş/teklif: domain-specific `*-state` — tutarlı.

---

## Smoke doğrulama

- `pnpm smoke:navigation` — 24 bağlantı PASS (main `930ac2e`).
- `pnpm smoke:routes` — demo ID'ler (`demo-customer-001`, `demo-order-001`, `demo-offer-001`, `demo-payment-001`) route dosyalarında mevcut.

---

## Açık maddeler (yerel QA checklist)

1. [ ] `/cariler/demo-customer-001` — kök grid 1366'da kesilme yok
2. [ ] `/cariler/demo-customer-001/ozet` — KPI sticky scroll
3. [ ] `/cariler/demo-customer-001/finans` — 6 KPI + workspace
4. [ ] `/cariler/demo-customer-001/timeline` — 3 kolon bozulmuyor
5. [ ] `/siparisler/demo-order-001/ozet` — EntityLayerNav aktif tab
6. [ ] `/teklifler/demo-offer-001/ozet` — sticky KPI
7. [ ] `/tahsilatlar/demo-payment-001` — tdf sticky özet

---

## Final karar

**VISUAL_QA_WARNINGS**

Kod ve CSS yapısı enterprise detay standardına yakın; cariler kök (`cdm-*`) responsive eksikliği ve kök aktif tab UX'i P3C öncesi görsel doğrulama gerektirir.

---

## T5-P3C-1 güncelleme (2026-06-08)

- Kök `/cariler/[customerId]`: `cdm-tabs` içine yalnız kök ekranda aktif **Detay** sekmesi eklendi.
- Katman sayfalarında `cul-tabs` değişmedi; çift nav yok.
- `cariler-detay-reference.css`: 1280px ve 960px `cdm-*` responsive breakpoint eklendi.
- Yerel browser QA hâlâ önerilir (sticky KPI + kök grid 1366).

---

## T5-P3C-2A güncelleme (2026-06-08)

- Kök ve katman layout'ları `CustomerReferenceCommandCenterFrame` + `CarilerCustomeridCommandCenterShell` ile sarıldı.
- `CustomerEntityLayerNav` wire edilmedi; `cdm-tabs` / `cul-tabs` korundu.
- `cariler-shell-command-center.css`: cdm/cul overflow ve padding uyumu eklendi.
- Yerel visual QA önerilir (shell padding, sticky KPI, 1366 taşma).
