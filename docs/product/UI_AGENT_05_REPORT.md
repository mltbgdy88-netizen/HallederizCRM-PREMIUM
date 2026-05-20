# UI Agent 05 Report — CRM / Commercial Routes

## Branch

| Alan | Değer |
|------|--------|
| Branch | `ui/05-crm-commercial` |
| Base commit | `f9943c7` — feat(ui): adopt platform operations routes (#128) |
| Commit | *(yerel — `feat(ui): adopt crm commercial routes`)* |

## Scope

- CRM/commercial route UI adoption only (list + detail + form + hub).
- Stash `wip-mockup-inspiration-before-agent04` **restore edilmedi**.
- Mockup PNG’ler yalnızca `docs/design/ui-design-output/**` referans; runtime import yok.

## Değişen route’lar

| Route | Özet |
|-------|------|
| `/cariler` | Mevcut `CustomersPage` + `EntityListPageTemplate` (önceki agent’lar); filtre + sağ önizleme korundu |
| `/cariler/[id]` | `CustomerDetailPage` + `EntityDetailLayout` (mevcut) |
| `/cariler/yeni` | `CustomerCreatePage` gerçek form (mevcut submit korundu) |
| `/teklifler` | `OffersPage` liste + önizleme (mevcut) |
| `/teklifler/[id]` | `OfferDetailPage` + `EntityDetailLayout` (mevcut) |
| `/teklifler/yeni` | **HUB** — `OfferCreateHub` Türkçe copy + «Hızlı İşlem'e git» |
| `/siparisler` | `OrdersPage` (mevcut) |
| `/siparisler/[id]` | `OrderDetailPage` (mevcut) |
| `/siparisler/yeni` | **HUB** — `OrderCreateHub` |
| `/tahsilatlar` | `PaymentsPage` (mevcut) |
| `/tahsilatlar/[id]` | `PaymentDetailPage` + timeline (mevcut) |
| `/tahsilatlar/yeni` | **HUB** — `PaymentCreateHub` |
| `/teslimatlar` | `DeliveriesPage` → `EntityListPageTemplate`, KPI, auto-select, AKSİYON kolonu |
| `/teslimatlar/[id]` | `DeliveryDetailPage` → `EntityDetailLayout`, Türkçe copy, sahte harita yok |
| `/iadeler` | `ReturnsPage` → `EntityListPageTemplate` |
| `/iadeler/[id]` | `ReturnDetailPage` → `EntityDetailLayout` |
| `/faturalar` | `InvoicesPage` → `EntityListPageTemplate`; sahte fatura no placeholder kaldırıldı |
| `/faturalar/[id]` | `InvoiceDetailPage` → `EntityDetailLayout`; PDF önizle disabled + güvenli copy |

## Değişen dosyalar

**apps/web**

- `app/globals.css` — `agent05-crm-commercial.css` import
- `app/styles/agent05-crm-commercial.css` — yeni (`.hz-commercial-entity-*`, teslimat/iade/fatura grid)
- `app/(platform)/teslimatlar/loading.tsx`, `iadeler/loading.tsx`, `faturalar/loading.tsx`
- `src/components/platform-shell.tsx` — teslimat/iade/fatura liste + detay `suppressPageMeta` ve arama placeholder
- `src/features/deliveries/components/DeliveriesPage.tsx`, `DeliveryDetailPage.tsx`
- `src/features/returns/components/ReturnsPage.tsx`, `ReturnDetailPage.tsx`
- `src/features/invoices/components/InvoicesPage.tsx`, `InvoiceDetailPage.tsx`
- `src/features/offers/components/OfferCreateHub.tsx`
- `src/features/orders/components/OrderCreateHub.tsx`
- `src/features/payments/components/PaymentCreateHub.tsx`

**docs/product**

- `UI_AGENT_05_REPORT.md` (bu dosya)
- `UI_ROUTE_COVERAGE_MATRIX.md`
- `UI_INVENTORY_CHECKLIST.md`
- `UI_MOCKUP_IMPLEMENTATION_PLAN.md`

**packages/ui:** değişiklik yok.

## Template adoption

| Template | Kullanım |
|----------|----------|
| `EntityListPageTemplate` | `/teslimatlar`, `/iadeler`, `/faturalar` (+ önceden `/cariler`, `/teklifler`, `/siparisler`, `/tahsilatlar`) |
| `EntityDetailLayout` | Teslimat, iade, fatura detay; cari/teklif/sipariş/tahsilat detay (önceden) |
| `FormPageShell` | `/cariler/yeni` (mevcut) |
| `DetailPanel` | Liste sağ önizleme panelleri |
| `DataTableShell` / `FilterToolbar` | Teslimat/iade/fatura listeleri |
| `ProductPageShell` | Hub route’lar (mevcut) |

## Hub route compliance

| Route | Durum |
|-------|--------|
| `/teklifler/yeni` | Form yok; «Teklif oluşturma Hızlı İşlem üzerinden yapılır.» + CTA `/hizli-islem` |
| `/siparisler/yeni` | Form yok; sipariş hub copy + CTA |
| `/tahsilatlar/yeni` | Form yok; tahsilat hub copy + CTA |

## Business logic preservation

| Alan | Durum |
|------|--------|
| Customer list/detail/create | Mevcut fetch/submit korundu |
| Offer/order/payment list/detail | Mevcut query ve aksiyonlar korundu |
| Delivery/return/invoice list/detail | `get-*` query’ler ve buton handler’ları korundu; yalnız UI/layout/copy |
| Commercial actions | Onay/kesim/geri al UI butonları; backend contract değişmedi |
| API/SDK | Değişiklik yok |

## UI state coverage

| State | Durum |
|-------|--------|
| Loading | `teslimatlar`, `iadeler`, `faturalar` `loading.tsx`; detay sayfalarında `LoadingState` |
| Empty | Liste sayfalarında `EmptyState` / güvenli mesaj |
| Error | Mevcut fetch hata davranışı; teknik sızıntı yok |
| Validation | `/cariler/yeni` mevcut form validation |
| Hub | Submit/success yok |

## Desktop / mobile QA

| Kontrol | Sonuç |
|---------|--------|
| 1920×1080 ilk görünüm 5+ satır | **Yerelde doğrulanmalı** (teslimat/iade/fatura listeleri sıkılaştırıldı) |
| 390×844 mobile | Entity list template kart/stack — **yerelde doğrulanmalı** |
| Sağ panel veri varken boş | Auto-select ilk kayıt (teslimat/iade/fatura) |
| Body / yatay scroll | **Yerelde doğrulanmalı** |

## Runtime safety

| Kontrol | Sonuç |
|---------|--------|
| Mockup PNG import | `rg` — eşleşme yok |
| Fake data/success | Eklenmedi |
| Technical leakage | «Rollback», «Issue foundation», «Dogrula» kaldırıldı |
| Fake map/PDF/image | Harita yok; PDF disabled + «canlı belge servisi bekleniyor» |

## Test sonuçları

| Komut | Sonuç |
|-------|--------|
| `pnpm --filter @hallederiz/web typecheck` | PASS |
| `pnpm --filter @hallederiz/ui typecheck` | PASS |
| `pnpm --filter @hallederiz/ui build` | PASS |
| `pnpm --filter @hallederiz/web build` | PASS |
| `pnpm smoke:navigation` | PASS (hub «onaya gönderin» copy eklendi) |
| `pnpm smoke:routes` | PASS |

## Known gaps

- Teslimat/iade/fatura detayda tam audit timeline feed (canlı API) — sonraki agent veya backend bağlantısı.
- Cariler/teklifler/siparisler için route-level `loading.tsx` opsiyonel (feature içi `LoadingState` var).
- 1920×1080 satır sayısı ve scroll — yerel görsel QA önerilir.

## Agent 06 handoff

- Stok, depo, fabrika, belgeler, görevler, archive, print-export.
- Backend/API değiştirmeden UI adoption; sahte ürün fotoğrafı / PDF / harita yok.
