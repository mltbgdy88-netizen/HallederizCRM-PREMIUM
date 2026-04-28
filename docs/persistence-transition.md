# Persistence Transition

Tarih: 28 Nisan 2026

## Gercek Persistence Foundation'a Tasinan Alanlar

- Customers: Repository katmaninda PostgreSQL sorgu yolu eklendi (`customers`, `customer_pricing_profiles`, `customer_accounts`, `customer_ledgers`).
- Products / Stock / Pricing: Repository katmaninda PostgreSQL sorgu yolu eklendi (`products`, `price_slot_configs`, `category_slot_configs`).
- Offers: Repository katmaninda PostgreSQL sorgu yolu eklendi (`offers` list/detail).
- Orders: Repository katmaninda PostgreSQL sorgu yolu eklendi (`sale_orders` list/detail).
- Payments: Commercial core service/repository katmanina alindi.
- Warehouse Orders: Commercial core service/repository katmanina alindi.

## Halen Demo/Mock Kalan Alanlar

- Deliveries, Invoices, Returns, Documents route implementation'lari halen mock-store odakli.
- WhatsApp, ERP, Fabrikalar, AI execution tarafi bu turda contract/foundation modunda.
- Customers/Products/Offers/Orders icindeki create/update ve ileri seviye relation operasyonlarinin bir bolumu halen kontrollu fallback ile mock-store'a donebilir.

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

1. Customers tarafinda contacts/addresses/pricing-profile mutasyonlarini tam SQL write path'e tasimak.
2. Products tarafinda stock/location/price-tier write path'lerini SQL'e tasimak.
3. Offers ve Orders tarafinda line/followup/source-plan mutasyonlarini SQL transaction ile kalicilastirmak.
4. Deliveries/Invoices/Returns/Documents modullerini de ayni DB-first modele almak.
