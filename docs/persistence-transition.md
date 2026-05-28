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

## Yürütme kuyruğu

Üretim ve gerçek ürün kesimi için faz sıralı görev listesi: [PRODUCTION_EXECUTION_QUEUE.md](./development/PRODUCTION_EXECUTION_QUEUE.md).

## Siradaki Gecis Hedefleri

1. `warehouse_orders` ve `warehouse_order_lines` icin order create-warehouse-order write parity'yi genisletmek.
2. Payments/Deliveries/Invoices/Returns/Documents write path'lerini DB-first mode'a tasimak.
3. DB-mode integration testlerini gercek test veritabani ile otomatik kosulabilir hale getirmek.

## Batch-2 Notlari (29 Nisan 2026)

- Auth/session provider akisi API-first modele yaklastirildi (`/auth/login`, `/auth/session`).
- Request context session token uzerinden tenant/user/permission cozumleyebiliyor.
- Approval execution status-only yaklasimindan domain dispatch map modeline gecirildi.
- Audit/timeline write-back altyapisi (`recordAuditEvent`) eklendi ve kritik write endpointlere baglandi.
- Document render/regenerate + queue save/print aksiyonlari audit olaylarina dusuyor.

## Manual CRM Flow Hardening Batch Notlari (29 Nisan 2026)

- Deliveries/Invoies/Returns/Documents endpointleri `CommercialCoreService` zincirine tasindi.
- DB-first deneme + kontrollu fallback modeli bu 4 modulde aktif edildi.
- Yeni repository aggregate/read path helper'lari eklendi:
  - `loadDeliveryAggregate`, `replaceDeliveryLinesTx`, `validateDeliveryLineParity`
  - `loadInvoiceAggregate`, `replaceInvoiceLinesTx`
  - `loadReturnAggregate`, `replaceReturnLinesTx`
  - `loadDocumentAggregate`
- Delivery complete/rollback akisinda order delivery/status write-back foundation'i eklendi.
- Web tarafinda deliveries/invoices/returns/documents icin API-first mutation servisleri eklendi.

Not: Bu turda schema tarafinda line tablolari olmayan ortamlarda fallback davranisi korunur; line-level parity DB'de tablo mevcutluguna bagli olarak guclenir.

## Core Completion Batch Notlari (29 Nisan 2026)

- Auth guard tarafinda tenant mismatch 403 olarak netlestirildi (session tenant header tenant'i override eder).
- Commercial core repository icinde payments ve warehouse_orders icin DB-first write/read zinciri guclendirildi.
- Payment confirm/reverse, warehouse state gecisleri ve local output job lifecycle icin audit write-back arttirildi.
- Document render ve document delivery DB kayit semantigi zenginlestirildi.

## Quick Operation Delivery/Return Binding (30 Nisan 2026)

- Quick Operation submit akisi delivery/return operation type'larinda controlled execution path'e tasindi.
- Delivery execution:
  - `orderId` referansi ile `createDelivery` path'i denenir.
  - Referans eksiginde validation/foundation sonucuna donulur.
- Return execution:
  - `createReturn` path'i ile kayit acilir.
  - `reason`/`note` zorunlulugu ile inceleme disiplini guclendirildi.
- Bu turda iade icin stok/finans nihai mutasyon adimi bilincli olarak review/approval sonrasi asamaya birakildi.

