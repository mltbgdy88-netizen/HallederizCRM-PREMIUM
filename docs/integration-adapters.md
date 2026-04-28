# Integration Adapters

## Amaç
Domain mantigini provider bagimliliklarindan ayirmak ve WhatsApp/ERP/Fabrika entegrasyonlarini service/adaptor katmaninda standardize etmek.

## Katmanlar

### Route
- `apps/api/src/integrations/routes.ts`
- Auth/permission guard ile korunur.
- HTTP contract ve hata donusleri burada.

### Service
- `apps/api/src/modules/integrations/service.ts`
- Is akislarini birlestirir.
- Her entegrasyon adaptorune delegasyon yapar.

### Adapters
- `whatsapp-adapter.ts`
  - inbound/outbound abstraction
  - action request lifecycle
  - template listesi
  - policy-sensitive intentlerde stricter status semantigi
- `erp-adapter.ts`
  - connection CRUD
  - test/sync
  - mapping/log/template
  - sync preview (entity field seti)
- `factory-adapter.ts`
  - stock sync
  - factory order lifecycle
  - health summary

## Auth / Permission Model
Write endpointler en az su setlerle korunur:
- `integrations.write`
- baglamsal izinler: `erp.write`, `factory.write`, `whatsapp.write`, `approvals.write`

## ERP Sync Preview Foundation
`POST /erp/connections/:id/sync` yanitinda:
- `direction`
- `entityType`
- `fields`
donulur, boylece import/export preview adimi UI'de gorunur hale gelir.

## Factory Health & Retry Foundation
- `GET /integrations/factories/health` health durumunu doner.
- Hata ve warning sinyalleri factory integration summary uzerinden UI'ya tasinir.
- Retry ve backoff stratejisi sonraki batchte policy engine'e tasinacaktir.
