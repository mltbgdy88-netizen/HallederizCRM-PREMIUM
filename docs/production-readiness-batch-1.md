# Production Readiness Batch 1

Tarih: 29 Nisan 2026

## Kapsam
Bu batch, yeni modul eklemeden mevcut foundation'i production-path'e yaklastirmak icin asagidaki alanlarda guclendirme yapar:

1. Auth + tenant enforcement
2. Document generation + document detail
3. Local print/file agent end-to-end akisi
4. WhatsApp/ERP/Factory adapter hardening
5. Validation ve smoke dogrulama

## Tamamlananlar

### 1) Auth + Tenant Enforcement
- `apps/api/src/shared/request-context.ts`:
  - session token, auth durumu, role ve permission parse guclendirildi.
  - mock token principal cozumleme genisletildi.
  - write endpointlerini kapsayacak permission seti genisletildi.
- `apps/api/src/shared/errors.ts`:
  - `unauthorized` ve `forbidden` hata tipleri eklendi.
  - 401/403 map eklendi.
- `apps/api/src/shared/auth-guards.ts`:
  - `assertAuthenticated`, `assertTenantAccess`, `assertPermission`, `assertAnyPermission`, `withGuards` eklendi.
- Guard yayilimi:
  - `sales-crm/routes.ts`
  - `product-stock-pricing/routes.ts`
  - `commercial-operations/routes.ts`
  - `operations-engine/routes.ts`
  - `integrations/routes.ts`
  - `ai-local-output-routes.ts`

### 2) Document Generation + Document Detail
- API:
  - `POST /documents/:id/regenerate` eklendi.
  - `POST /documents/render` document generation service uzerine tasindi.
  - `apps/api/src/modules/documents/service.ts` ile generator service foundation eklendi.
- Web:
  - Yeni route: `/belgeler/[documentId]`
  - Yeni sayfa: `DocumentDetailPage`
  - Belge listesi cift tikla detaya gider.
  - Detail sayfasinda:
    - bagli entity
    - belge tipi
    - preview
    - gonderim gecmisi
    - queue save
    - queue print
    - regenerate
    - whatsapp/email gonderim aksiyonlari

### 3) Local Print / File Agent End-to-End
- API local-output:
  - `GET /local-agent/status`
  - `POST /local-agent/status`
  - print/file job lifecycle endpointleri:
    - `POST /print-jobs/:id/start|complete|fail`
    - `POST /file-save-jobs/:id/start|complete|fail`
- Store tarafi:
  - local agent status state eklendi
  - print/file job status mutation fonksiyonlari eklendi
- `apps/local-agent`:
  - queue poll -> execute -> status ack dongusu eklendi
  - API tabanli queue polling (print/file save) eklendi
  - local status report API'ye post eden akıs eklendi
  - file save handler diskte hedef klasore placeholder dosya yazar
  - print handler simule execution ile completed/failed semantigi tasir

### 4) Integration Adapters Hardening
- Yeni adapter yapisi:
  - `modules/integrations/adapters/whatsapp-adapter.ts`
  - `modules/integrations/adapters/erp-adapter.ts`
  - `modules/integrations/adapters/factory-adapter.ts`
  - `modules/integrations/service.ts`
- Route katmani dogrudan mock fonksiyon cagrisindan cikti, service/adapters uzerine alindi.
- ERP sync sonucunda import/export preview field seti donen foundation eklendi.
- WhatsApp'ta policy-sensitive intentlerde daha siki durum semantigi eklendi.

### 5) SDK / Web Data Flow Iyilestirmesi
- `packages/sdk`:
  - `DocumentsClient` eklendi.
  - `createHallederizSdk` icine `documents` client eklendi.
  - ApiClient session token header/authorization desteği eklendi.
- `apps/web/src/lib/data-source.ts`:
  - `sessionToken` config destegi eklendi.
- `apps/web/src/providers/auth-provider.tsx`:
  - access token local storage persistence ve context'e eklenmesi eklendi.

## Dogrulama Sonuclari
- `pnpm typecheck`: Basarili
- `pnpm run smoke:routes`: Basarili
- `pnpm run smoke:navigation`: Basarili
- `pnpm build`: **Basarisiz (ortam kaynakli dosya izin problemi)**
  - Hata: `EPERM ... apps/web/.runtime-next/trace`
  - Not: TypeScript ve runtime route/smoke katmani saglam; build hatasi koddan ziyade dosya izin/lock kaynakli gorunuyor.

## Demo/Fallback Durumu
- Demo mode korunmustur.
- Pilot akislari ve mevcut route yapisi korunmustur.
- Production path icin auth/guard ve local output akisi belirginlesmistir.
