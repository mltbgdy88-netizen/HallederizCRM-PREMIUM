# API Data Flow

## Akis

`Web UI -> SDK Client -> API Route -> Service -> Repository -> Database Adapter`

Bu akisla UI'daki feature query'leri dogrudan mock import etmek yerine typed client uzerinden API cagirir.

## Web Katmani

- `apps/web/src/lib/data-source.ts`
  - `NEXT_PUBLIC_USE_DEMO_DATA`
  - `NEXT_PUBLIC_API_BASE_URL`
  - `NEXT_PUBLIC_TENANT_ID`
  - `NEXT_PUBLIC_USER_ID`
- Oncelikli modullerde query dosyalari API-first calisacak sekilde guncellendi:
  - customers
  - stock/pricing
  - offers
  - orders
  - payments
  - warehouse
- Web mutation foundation eklendi:
  - customer create/update/pricing-profile
  - product create/update + slot config update
  - offer create/update/follow-up
  - order create/update

## SDK Katmani

- `packages/sdk/src/base.ts`: ortak fetch wrapper, hata modeli, tenant/user header tasima.
- `packages/sdk/src/clients/*`: modul bazli typed API client'lar.
- `createHallederizSdk()` ile tek noktadan client seti uretilir.

## API Katmani

- Route katmani request alir ve context olusturur (`x-tenant-id`, `x-user-id`).
- Service katmani is kurali ve use-case koordinasyonunu tasir.
- Repository katmani veri kaynagina erisir.
- Customers/Products/Offers/Orders repository'leri DB mode'da SQL sorgusu dener.
- Write endpointlerinde transaction boundary repository seviyesinde tutulur.
- Conflict semantigi:
  - API `409 conflict` + `details.reason=stale_update|resource_changed`
  - Validation hatalari `400 validation_error`
- DB sorgusu hata verirse kontrollu mock fallback devreye girer.

## Database Katmani

- `packages/database/src/client.ts`:
  - `demo` modu: in-memory foundation.
  - `postgres` modu: `pg` dynamic import + query + transaction foundation.
- `packages/database/src/schema/*`: modul bazli SQL schema tanimlari.
- `packages/database/src/migrations/*`: migration SQL dosyalari.
- `packages/database/src/seeds/*`: demo seed SQL dosyalari.

## Demo Mode / API Mode

- Demo mode (`NEXT_PUBLIC_USE_DEMO_DATA=true`):
  - UI mock/demodan beslenir.
- API mode (`NEXT_PUBLIC_USE_DEMO_DATA=false`):
  - UI SDK uzerinden API'dan beslenir.
- Repository DB mode (`PERSISTENCE_MODE=postgres`):
  - API repository once PostgreSQL sorgularini dener.
  - `POSTGRES_URL` yoksa veya query hata verirse ilgili repository mock fallback verir.

## Tenant Context Akisi

1. Web, SDK cagrilarinda `x-tenant-id` ve `x-user-id` header'larini gonderir.
2. API `buildRequestContext()` ile bu bilgileri normalize eder.
3. Service/Repository katmanlari context'i alip tenant-aware sorguya hazir kalir.

## Write Akis Ozetleri (Core CRM)

- Customers: Route -> Service -> Repository -> `save customer + pricing profile` (tx)
- Products: Route -> Service -> Repository -> `save product aggregate` (tx)
- Offers: Route -> Service -> Repository -> `save offer + replace lines + recalc totals` (tx)
- Orders: Route -> Service -> Repository -> `save order + replace lines + replace source plans + derive statuses` (tx)

## Manual CRM Flow Hardening Batch Ekleri

- Deliveries:
  - Route -> `CommercialCoreService` -> Repository
  - create/validate/complete/rollback/notify aksiyonlari service zincirine tasindi.
- Invoices:
  - create/issue/cancel/send route'lari service/repository zinciriyle tekil hale getirildi.
- Returns:
  - create/approve/receive/complete/cancel route'lari service/repository zinciriyle calisir.
- Documents:
  - list/get/render/regenerate/send route'lari service/repository zinciriyle calisir.
- Web API-first mutation katmani:
  - `apps/web/src/services/api/deliveries.service.ts`
  - `apps/web/src/services/api/invoices.service.ts`
  - `apps/web/src/services/api/returns.service.ts`
  - `apps/web/src/services/api/documents.service.ts`

## Batch-2 Ek Guclendirmeler

- Web auth provider login/session akisinda API-first modele alinmistir.
- API request-context session token uzerinden user/tenant/permission cozumleyebilir.
- Approval execution akisi status degisiminin otesine gecip domain dispatch map ile calisir.
- Document queue save/print aksiyonlari audit/timeline write-back ile izlenebilir hale getirilmistir.
- `GET /audit-events` ve `GET /entity-timelines/:entityType/:entityId` ile event akisina erisim saglanmistir.

## Core Completion Batch Ekleri

- Session varsa tenant/user cozumlemesinde session degeri header uzerinde onceliklidir.
- Header tenant ile session tenant farkliysa auth guard 403 tenant_mismatch dondurur.
- Commercial core icinde payments ve warehouse orders DB-first path guclendirilmistir.

