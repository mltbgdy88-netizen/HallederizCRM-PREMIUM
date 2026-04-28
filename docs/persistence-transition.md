# Persistence Transition

Tarih: 28 Nisan 2026

## Gercek Persistence Foundation'a Tasinan Alanlar

- Customers: DB-mode'da create/update + pricing profile + contact/address insert path eklendi. Optimistic concurrency (`updatedAt`) kontrolu eklendi.
- Products / Stock / Pricing: DB-mode'da product aggregate create/update (aliases/categories/tiers/locations/stocks) transaction path eklendi.
- Offers: DB-mode'da offer aggregate create/update + line replace + follow-up insert + status transition + totals recalculation eklendi.
- Orders: DB-mode'da order aggregate create/update + line replace + source-plan replace + warehouse-order olusturma foundation eklendi.
- Payments: Commercial core service/repository katmanina alindi.
- Warehouse Orders: Commercial core service/repository katmanina alindi.

## Halen Demo/Mock Kalan Alanlar

- Deliveries, Invoices, Returns, Documents route implementation'lari halen mock-store odakli.
- WhatsApp, ERP, Fabrikalar, AI execution tarafi bu turda contract/foundation modunda.
- Payments, Warehouse detay satir yazimlari, Deliveries, Invoices, Returns, Documents write path'leri halen mock agirlikli.
- Customers/Products/Offers/Orders DB mode'da hata alirsa kontrollu fallback ile mock-store'a donebilir.

## Transaction ve Concurrency Hardening Durumu

- Customer aggregate write set: `customers + customer_pricing_profiles` tek transaction.
- Product aggregate write set: `products + aliases + categories + tiers + locations + warehouse_stocks` tek transaction.
- Offer aggregate write set: `offers + offer_lines (+ offer_followups)` transaction.
- Order aggregate write set: `sale_orders + sale_order_lines + order_source_plans` transaction.
- Concurrency foundation:
  - `customers`, `offers`, `orders`: `expected updatedAt` ile stale-write conflict modeli aktif.
  - `products`: request tarafindan `updatedAt` gelirse stale-write conflict kontrolu calisir.

## Fallback Stratejisi

- Web katmaninda `NEXT_PUBLIC_USE_DEMO_DATA=true/false` ile veri kaynagi secimi yapilir.
- `true`: mevcut demo/mock sorgulari korunur.
- `false`: Web -> SDK -> API zinciriyle canli kaynaga gecilir.
- API tarafinda `PERSISTENCE_MODE=postgres` + `POSTGRES_URL` aktifse repository once DB sorgusunu dener; hata durumunda kontrollu mock fallback calisir.

## Database Foundation Durumu

- `packages/database/src/schema/*` altinda modul bazli SQL schema foundation dosyalari eklendi.
- `packages/database/src/migrations/0001_initial.sql` ile ilk migration iskeleti eklendi.
- `packages/database/src/seeds/demo-seed.sql` ile pilot senaryo uyumlu seed foundation eklendi.
- Query executor katmani demo/postgres modlariyla ayrildi.

## Siradaki Gecis Hedefleri

1. `warehouse_orders` ve `warehouse_order_lines` icin order create-warehouse-order write parity'yi genisletmek.
2. Payments/Deliveries/Invoices/Returns/Documents write path'lerini DB-first mode'a tasimak.
3. DB-mode integration testlerini gercek test veritabani ile otomatik kosulabilir hale getirmek.
