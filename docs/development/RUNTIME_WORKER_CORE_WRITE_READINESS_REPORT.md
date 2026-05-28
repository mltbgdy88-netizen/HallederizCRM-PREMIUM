# Runtime + Worker + Core Write Readiness Report

## Özet

Bu fazda production ortam değişkeni doğrulaması, worker/outbox production tick iskeleti, sahte başarı düzeltmeleri, Hızlı İşlem önizleme UI bağlantısı, submit → `approvalId` akışı ve temel ticari write SDK/UI hazırlığı tamamlandı. Tam domain execution (worker handler live, tüm create formları) sonraki faza bırakıldı.

## Değişen modüller

| Alan | Dosyalar |
|------|----------|
| Runtime env | `packages/config/src/runtime-env.ts`, `packages/config/src/index.ts`, `apps/api/src/shared/runtime-env-bootstrap.ts`, `apps/api/src/index.ts` |
| Worker | `packages/domain/src/worker/*`, `apps/worker/src/production-runtime.ts`, `apps/worker/src/index.ts` |
| Quick Operation | `apps/api/src/modules/quick-operations/service.ts`, `apps/web/src/features/quick-operations/**`, `apps/web/src/services/api/quick-operations.service.ts` |
| Pricing | `apps/web/src/features/pricing/mutations/update-pricing-config.ts` |
| SDK | `packages/sdk/src/clients/customers|offers|orders|payments|stock.client.ts` |
| Customers UI | `apps/web/src/features/customers/components/CustomerCreatePage.tsx` |
| Tests | `apps/api/src/tests/runtime-env-validation.test.ts`, `worker-production-runtime.test.ts`, `quick-operation-submit-approval.test.ts`, web feature tests |
| Docs | Bu rapor, `LIVE_API_INTEGRATION_MATRIX.md` güncellemesi |

## Runtime env validation

- `readRuntimeEnv`, `validateRuntimeEnv`, `assertRuntimeEnv` eklendi.
- Production fail-closed: demo auth, demo data, demo fallback, `PERSISTENCE_MODE=demo`, `TENANT_ENCRYPTION_KEY`, WhatsApp live secret seti, Meta webhook secret.
- Postgres modunda `POSTGRES_URL` / `DATABASE_URL` zorunlu.
- API startup: `bootstrapRuntimeEnvValidation()` (`NODE_ENV=test` atlanır).

## Worker/outbox durumu

| Mod | Davranış |
|-----|----------|
| `foundation_dry_run` (varsayılan) | Mevcut in-memory dry-run korunur |
| `production` + postgres URL | `DatabaseOutboxJobRepository` ile async tick; memory fallback yok |
| `production` + URL yok | Fail-closed; tick çalışmaz |
| `disabled` | Worker çıkış kodu 0 dışı fail |

**Handler durumu**

| Job type | Durum |
|----------|--------|
| `approval.execution.dispatch`, `audit.timeline.writeback` | Foundation dry-run (production’da dead-letter) |
| `approval_execution`, `ai_reply_send`, `document_render`, `document_archive`, `integration_sync` | Contract: `unsupported_job_type`, completed sayılmaz |
| Bilinmeyen tipler | Artık sahte `ok:true` yok |

Worker tam production processor **değil**; claim + handler dispatch iskeleti hazır, live handler implementasyonu sonraki faz.

## Pricing config

- Sahte `{ success: true }` kaldırıldı.
- `sdk.stock.patchPriceSlots` → `PATCH /price-slots`.
- Kullanıcı güvenli hata metinleri.

## Quick Operation

- **Preview:** UI `Önizle` → `previewQuickOperationRecord` → API/SDK; demo’da yerel önizleme, canlıda `POST /quick-operations/preview`.
- **Submit approvalId:** Policy `require_approval` ise pending approval oluşturulur; `approvalId` response’ta; sahte `foundation_*` entity id kaldırıldı.
- Demo/production ayrımı korunur.

## Customer / Stock / Offer / Order / Payment

| Write | API | SDK | UI |
|-------|-----|-----|-----|
| Customer create/update | `POST/PATCH /customers` mevcut | `customers.create/update` eklendi | `/cariler/yeni` form (canlı mod) |
| Stock product | API service mevcut | `createProduct/updateProduct` eklendi | Stok sayfası toast — sonraki faz |
| Offer/Order/Payment create | API mevcut | `create()` eklendi | Hub + Hızlı İşlem onay kuyruğu |

Sahte “oluşturuldu” metni yalnızca gerçek `createdEntityId` veya onay kuyruğu mesajlarıyla sınırlı.

## Demo / production davranışı

- Demo: önizleme/taslak; canlı kayıt yok mesajları.
- Production: env validation startup fail; worker memory fallback yok; approval persist postgres veya fail-closed.

## Kalan boşluklar

- PDF storage + signed URL
- WhatsApp/Meta gerçek provider credentials + outbound
- Archive read API
- Dashboard live `sdk.dashboard.summary`
- Worker live handler execution (approval dispatch execute)
- Stok hareketi / rezervasyon UI
- E2E acceptance

## Sonraki faz önerileri

1. Worker `approval.execution.dispatch` live handler + outbox enqueue from approval execute
2. Hızlı İşlem canlı cari/ürün katalog feed
3. Stok write UI + movement approval
4. Dashboard summary bağlantısı

## Test sonuçları

Test komutları commit öncesi çalıştırılacak; sonuçlar commit mesajı ile birlikte doğrulanır.
