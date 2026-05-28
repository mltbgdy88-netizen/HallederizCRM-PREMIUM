# Pilot Run 005

- Tarih: 2026-04-30 15:08:33 +03:00
- Git commit SHA: 8482d64

## Docker/Postgres durumu
- Compose project: `hallederizcrm-premium-pilot`
- Container: `hallederizcrm-premium-pilot-postgres-1`
- Durum: `Up (healthy)`
- Port: `127.0.0.1:55432 -> 5432`
- `pg_isready`: başarılı (`accepting connections`)
- Not: `0001_initial.sql` ve `0002_whatsapp_workflows.sql` local pilot DB'ye uygulandı.

## Env var/yok özeti (secret değerleri yazılmadı)
- NODE_ENV: SET
- DEMO_AUTH_ENABLED: SET
- NEXT_PUBLIC_ENABLE_DEMO_AUTH: SET
- PERSISTENCE_MODE: SET
- ALLOW_DEMO_FALLBACK: SET
- DATABASE_URL: SET (port 55432)
- POSTGRES_URL: SET (port 55432)
- WHATSAPP_WEBHOOK_VERIFY_TOKEN: SET
- WHATSAPP_WEBHOOK_APP_SECRET: SET
- AI_PROVIDER: SET
- LOCAL_AI_SERVICE_URL: SET
- LOCAL_AI_TIMEOUT_MS: SET

## API boot sonucu (`:4012`)
- `GET /health` -> **200**
- `POST /auth/login` -> **503**
- `GET /orders` (auth yok) -> **401**
- `POST /quick-operations/preview` (auth yok) -> **401**
- `GET /whatsapp/webhook` yanlış token -> **403**
- `GET /whatsapp/webhook` doğru token -> **200** (`challenge` döndü)
- `POST /whatsapp/webhook` invalid signature -> **403**

## Demo auth sonucu
- `DEMO_AUTH_ENABLED=true` olmasına rağmen `/auth/login` -> **503**
- Kök sebep: mevcut auth route yalnızca `demo auth + persistence=demo` kombinasyonunda login açıyor.
- Mevcut env `PERSISTENCE_MODE=postgres` olduğundan demo session alınamadı.
- Durum: **BLOCKED_BY_AUTH_MODE_POLICY**

## Web boot sonucu
- `GET /` -> **200**
- `GET /login` -> **200**
- `GET /hizli-islem` -> **200**

## Hızlı İşlem mini run sonucu
- Auth token alınamadığı için authenticated çağrı yapılamadı.
- `POST /quick-operations/preview` auth yok -> **401**
- `POST /quick-operations/submit` auth yok -> **401**
- Durum: **BLOCKED_BY_AUTH**

## WhatsApp valid signature + duplicate sonucu
- Valid signature ile 1. istek -> **200**
  - `duplicate=false`
  - `workflowReserved=true`
  - command sonucu `ticket_not_found` (beklenen; pending ticket yok)
- Aynı `messageId` ile 2. istek -> **200**
  - `duplicate=true`
  - `duplicateReason=same_message_processed`
- Sonuç: duplicate/idempotency zinciri çalışıyor.

## Local AI durumu
- `AI_PROVIDER=mock` set.
- `LOCAL_AI_SERVICE_URL` set ama local AI servisi çalışır durumda değil.
- Mock/degraded kullanım beklentisiyle uyumlu; pilot run için blocker değil.

## Blocker listesi
1. `BLOCKED_BY_AUTH_MODE_POLICY`: Postgres modunda demo login route 503 dönüyor.
2. `BLOCKED_BY_AUTH`: Bu nedenle Hızlı İşlem authenticated executed/foundation sonucu bu turda doğrulanamadı.

## Warning listesi
1. WhatsApp command path’te pending ticket olmadığı için `ticket_not_found` döndü; bu bir güvenlik/policy sorunu değil.
2. Local AI servis process’i aktif değil (mock provider kullanımı nedeniyle operasyonel uyarı seviyesinde).

## Sonuç
**PASS_WITH_WARNINGS**
