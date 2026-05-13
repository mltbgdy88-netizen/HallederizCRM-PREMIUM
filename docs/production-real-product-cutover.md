# Production Real Product Cutover

Bu fazin amaci, demo/pilot/foundation davranislarini production ortaminda gercek basari gibi gostermeyi engellemektir.

## Production Mode Kurallari

- `NODE_ENV=production` altinda demo auth/fallback acik olamaz.
- `PERSISTENCE_MODE=postgres` zorunludur.
- Pending approval, worker outbox, tenant usage ve omnichannel persistence production'da memory fallback yapamaz.
- Mock providerlar production'da `ready` veya live success sayilmaz.
- Dry-run/foundation handler sonucu canli mutation basarisi gibi raporlanmaz.

## Zorunlu Env (production)

- `NODE_ENV=production`
- `PERSISTENCE_MODE=postgres`
- `DATABASE_URL` veya `POSTGRES_URL`
- `AUTH_SESSION_SECRET`
- `APP_BASE_URL`
- `API_BASE_URL`
- `WORKER_MODE=durable`
- `APPROVAL_EXECUTION_MODE` (foundation disi production-safe mod)

WhatsApp live icin:

- `WHATSAPP_WEBHOOK_SECRET`
- `WHATSAPP_VERIFY_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_ACCESS_TOKEN`

## Readiness Endpoint

- `GET /platform/production-readiness`
- Guard: auth + `settings.read | platform.settings.read | admin.readiness.read`
- Tenant scoped, fail-closed.
- Cikti:
  - `overallStatus: ready | degraded | blocked`
  - `blockers`, `warnings`, `requiredEnv`, `missingEnv`, `unsafeFallbacks`
  - persistence/auth/worker/approval/omnichannel/local-ai/local-agent ozetleri

## UI

- `\/ayarlar\/canli-kullanim-hazirligi` sayfasi readiness endpoint'ini gosterir.
- Mock/foundation pathleri "hazir" gibi gostermek yerine blocker/degraded olarak isaretler.

## Bu PR'da Bilincli Olarak Yapilmayanlar

- Instagram/Facebook/Email/SMS live provider entegrasyonlari
- Tum domain mutation handler'larinin live acilisi
- ERP/factory/payment canli capture acilisi
- Production worker autoscaling/lifecycle hardening

