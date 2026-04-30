# 016 - Pilot Acceptance Checklist

## 1. Tamamlanan Guvenlik Isleri
- Auth demo fallback flag'e baglandi (`DEMO_AUTH_ENABLED`, `NEXT_PUBLIC_ENABLE_DEMO_AUTH`).
- Protected read endpoint guard hardening tamamlandi (auth yoksa 401, yetki yoksa 403).
- Postgres modunda sessiz mock fallback engellendi (`ALLOW_DEMO_FALLBACK=false` varsayilani).
- Production policy: demo auth ve demo fallback default kapali.

## 2. Tamamlanan WhatsApp Isleri
- Webhook signature verification fail-open olmadan dogrulaniyor.
- Production secret policy net: secret yoksa inbound kabul edilmiyor.
- Rule resolver intent/policy matrisi domain tarafina tasindi.
- Workflow foundation: idempotency, duplicate guard, pending ticket, command audit.
- Command handling foundation: ONAY/RED/INCELE parser + token hash + yetkili telefon kontrolu.
- Workflow store icin Postgres-backed persistence foundation eklendi.

## 3. Tamamlanan Local AI Isleri
- `apps/local-ai-service` port foundation eklendi.
- API tarafinda local provider config/health/chat forward foundation mevcut.
- Local provider unavailable durumunda kontrollu degraded/fallback davranisi korunuyor.

## 4. Tamamlanan Hizli Islem Isleri
- `/hizli-islem` frontend foundation tamamlandi.
- Backend contract: preview + submit guarded endpointleri aktif.
- Real execution binding:
  - executed: offer, sale_order, payment
  - controlled: delivery, return (execution/review foundation uyumlu)
- Side actions foundation:
  - Belge onizleme
  - WhatsApp taslagi (sendEnabled=false)
  - AI operasyon notu/uyarisi

## 5. Pilot Oncesi Zorunlu Env Checklist
- `PERSISTENCE_MODE=postgres`
- `POSTGRES_URL` / `DATABASE_URL` dolu
- `ALLOW_DEMO_FALLBACK=false`
- `DEMO_AUTH_ENABLED=false`
- `NEXT_PUBLIC_ENABLE_DEMO_AUTH=false`
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN` dolu
- `WHATSAPP_WEBHOOK_APP_SECRET` dolu
- `WHATSAPP_TEST_RECIPIENT` (test senaryosu icin)
- `AI_PROVIDER` secimi (`local` veya `openai`)
- `LOCAL_AI_SERVICE_URL` (local provider seciliyse)
- `OPENAI_API_KEY` (openai seciliyse)
- Local output kullaniliyorsa:
  - `LOCAL_AGENT_MODE=enabled`
  - `LOCAL_OUTPUT_ROOT`
  - `DEFAULT_PRINTER_NAME`

## 6. Pilot Oncesi Manuel Test Senaryolari
- Login + tenant context + role permission dogrulamasi
- Cari -> Teklif -> Siparis -> Tahsilat -> Teslim -> Iade zinciri
- Hizli Islem:
  - offer, sale_order, payment executed
  - delivery/return controlled durumlar
- WhatsApp:
  - verify token
  - signature valid/invalid
  - duplicate message kontrolu
  - ONAY/RED/INCELE command handling
- Staging kontrol:
  - live/fallback/misconfigured ayrimi
- Pilot hazirlik:
  - checklist blockerlari ve aksiyon linkleri

## 7. Bilinen Foundation Kalan Isler
- Gercek PDF binary render (full) tum belge tiplerinde zorunlu degil.
- Gercek WhatsApp outbound send production approval zinciri son hali acik degil.
- AI mutation execution full acik degil (proposal+approval zorunlulugu korunuyor).
- Delivery/return yan akislarinda tam stock/finance mutation kapsamli degil.

## 8. Production'a Cikmadan Once Yapilacaklar
1. Env secrets production seviyesinde doldurulsun.
2. Demo flag'leri production'da kapali oldugu dogrulansin.
3. Staging kontrol panelinde kritik servisler healthy/misconfigured netlesdirilsin.
4. Pilot manuel test planlari en az bir tur tamamlansin.
5. Rollback/playbook ve operator runbook son kez gozden gecirilsin.
