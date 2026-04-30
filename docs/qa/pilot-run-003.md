# Pilot Run 003

- Tarih: 2026-04-30 13:24:02 +03:00
- Git commit SHA: 1ef45b8
- Önceki referans: docs/qa/pilot-run-002.md

## 1) Env var/yok özeti (secret değerleri maskeli)

Yerel ortamda .env, .env.local, .env.development dosyası bulunamadı (yalnızca .env.example var).

Beklenen minimum alanlar için durum:
- NODE_ENV: YOK
- DEMO_AUTH_ENABLED: YOK
- NEXT_PUBLIC_ENABLE_DEMO_AUTH: YOK
- PERSISTENCE_MODE: YOK
- DATABASE_URL veya POSTGRES_URL: YOK
- ALLOW_DEMO_FALLBACK: YOK
- WHATSAPP_WEBHOOK_VERIFY_TOKEN: YOK
- WHATSAPP_WEBHOOK_APP_SECRET: YOK
- AI_PROVIDER: YOK
- LOCAL_AI_SERVICE_URL (opsiyonel local AI): YOK

## 2) Postgres durumu

Çalıştırılan komut:
- docker compose -f docker-compose.local.yml up -d
- docker compose -f docker-compose.local.yml ps

Sonuç:
- Docker daemon erişilemedi (
pipe //./pipe/dockerDesktopLinuxEngine bulunamadı).
- Postgres compose ayağa kalkmadı.

Değerlendirme:
- **Environment blocker**: POSTGRES_DOCKER_DAEMON_UNAVAILABLE
- Kod/config kaynaklı yeni hata gözlenmedi.

## 3) API boot sonucu

API portu :4000 üzerinde çalışan süreçten route smoke yapıldı.

Kontroller:
- GET /health -> **200**
- POST /auth/login -> **503** (demo auth/persistence policy gereği; route mevcut)
- GET /orders (auth yok) -> **401**
- POST /quick-operations/preview (auth yok) -> **401**
- GET /whatsapp/webhook?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=123 -> **403**
- POST /whatsapp/webhook (invalid signature) -> **403**

Yorum:
- Kritik endpointler method-doğru çağrıda 404 dönmüyor.
- Auth ve signature güvenlik davranışı beklenen şekilde fail-closed.

## 4) Web boot sonucu

http://127.0.0.1:3000 üzerinden kontrol:
- / -> **200**
- /login -> **200**
- /hizli-islem -> **200**

## 5) Hızlı İşlem mini run sonucu

API seviyesinde denendi:
- POST /quick-operations/preview (auth yok) -> **401**
- POST /quick-operations/submit (auth yok) -> **401**
- mock_access_* token ile deneme -> **401** (postgres güvenlik modunda beklenen)

Durum:
- Route erişimi ve guard davranışı doğrulandı.
- Bu turda valid session ile executed/foundation payload akışı, env/session eksikliği nedeniyle çalıştırılamadı.

## 6) WhatsApp mini run sonucu

API seviyesinde denendi:
- Verify yanlış token -> **403**
- Invalid signature -> **403**
- sha256=... signed payload denemesi -> **403**

Durum:
- Webhook fail-open değil, güvenlik doğru.
- Valid signature/duplicate senaryosu için aktif env secret ve tutarlı test bootstrap gerekli.

## 7) Local AI durumu

- http://127.0.0.1:8008/health erişilemedi (servis çalışmıyor).
- API health alt endpointleri auth gerektirdiği için authsuz çağrıda **401** döndü.

## 8) Blocker listesi

1. POSTGRES_DOCKER_DAEMON_UNAVAILABLE (Docker daemon kapalı/erişilemiyor)
2. Yerel env dosyası yok (.env/.env.local/.env.development eksik)

## 9) Warning listesi

1. API/Web servisleri bu turda önceden çalışan süreçler üzerinden doğrulandı; temiz cold-start env ile tekrar edilmesi önerilir.
2. Hızlı İşlem executed/foundation iş sonucu akışı için geçerli login/session hazırlanamadı (auth policy + env eksikliği).
3. WhatsApp valid signature + duplicate senaryosu env secret/bootstrap eksikliği nedeniyle teyit edilemedi (invalid path teyit edildi).

## 10) Sonuç

**PASS_WITH_WARNINGS**

- Kod seviyesinde pilot boot blocker regresyonu gözlenmedi.
- Asıl engel ortam hazırlığı (Docker/Postgres ve local env seti).
