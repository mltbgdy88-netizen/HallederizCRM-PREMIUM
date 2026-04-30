# Pilot Test Runbook

## 1. Ortam Hazirligi
1. Bu runbook, manuel pilot test turunu adim adim yurutmek icindir.
2. Temel referanslar:
   - `docs/implementation/017-release-candidate-audit.md`
   - `docs/implementation/016-pilot-acceptance-checklist.md`
   - `docs/qa/quick-operation-manual-test-plan.md`
   - `docs/qa/whatsapp-workflow-manual-test-plan.md`
3. Teste baslamadan once branch temizligi:
   - `git status --short`
   - generated/cache dosyalari takip edilmemeli.
4. Node/pnpm surumlerinin repo ile uyumlu oldugunu dogrula.

## 2. Gerekli Env Degerleri
Aşağıdaki minimum set test ortaminda doldurulmalidir:

### Zorunlu (pilot/staging)
- `NODE_ENV=development` (lokal test turu icin)
- `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000`
- `PERSISTENCE_MODE=postgres`
- `POSTGRES_URL` ve/veya `DATABASE_URL`
- `ALLOW_DEMO_FALLBACK=false`
- `DEMO_AUTH_ENABLED=false` (auth testi disinda)
- `NEXT_PUBLIC_ENABLE_DEMO_AUTH=false` (auth testi disinda)

### WhatsApp testi icin
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
- `WHATSAPP_WEBHOOK_APP_SECRET`
- `WHATSAPP_TEST_RECIPIENT` (opsiyonel ama onerilir)

### AI testi icin
- `AI_PROVIDER=mock|local|openai`
- `LOCAL_AI_SERVICE_URL` (provider=local ise)
- `LOCAL_AI_TIMEOUT_MS`
- `OPENAI_API_KEY` (provider=openai ise)

### Local output testi icin (opsiyonel)
- `LOCAL_AGENT_MODE=enabled`
- `LOCAL_OUTPUT_ROOT`
- `DEFAULT_PRINTER_NAME`
- `LOCAL_AGENT_POLL_INTERVAL_MS`
- `LOCAL_AGENT_HEALTH_SECRET`

## 3. Postgres Hazirligi
1. Postgres instance calisir durumda olmali.
   - Docker ile lokal kurulum (onerilen):
     - `docker compose -f docker-compose.local.yml up -d postgres`
     - `docker compose -f docker-compose.local.yml ps`
2. Baglanti dogrulamasi:
   - `POSTGRES_URL` / `DATABASE_URL` ile API ayaga kalkmali.
   - Port kontrolu: `5432`
3. Policy kontrolu:
   - `PERSISTENCE_MODE=postgres`
   - `ALLOW_DEMO_FALLBACK=false`
4. Beklenen: DB baglantisi yoksa sessiz demo fallback olmamali; kontrollu hata gorulmeli.
5. Port cakismasi varsa:
   - Lokal compose portunu degistir (ornegin `5433:5432`)
   - `POSTGRES_URL`/`DATABASE_URL` degerlerini ayni porta guncelle.

## 4. API Baslatma
1. Bagimliliklari kur:
   - `pnpm install`
2. API servisini baslat:
   - `pnpm --filter @hallederiz/api dev`
3. Health kontrolu:
   - `GET /health` 200 donmeli.
4. Staging/pilot health panelinde servis durumlarini kontrol et.

## 5. Web Baslatma
1. Web uygulamasini baslat:
   - `pnpm --filter @hallederiz/web dev`
2. Tarayicida `http://localhost:3000` ac.
3. Login + rol/yetki kapsaminda asagidaki route'lari temel gez:
   - `/ayarlar/pilot-hazirlik`
   - `/ayarlar/staging-kontrol`
   - `/hizli-islem`
   - `/whatsapp`

## 6. Local AI (Opsiyonel) Baslatma
1. `apps/local-ai-service/README.md` adimlarini uygula.
2. Servisi baslat (ornek):
   - `cd apps/local-ai-service`
   - `python -m uvicorn app.main:app --host 127.0.0.1 --port 8008`
3. Kontrol:
   - `GET http://127.0.0.1:8008/health`
4. Beklenen: service yoksa API controlled degraded davranis vermeli, hard crash olmamali.

## 7. Hizli Islem Test Sirasi
Kaynak plan: `docs/qa/quick-operation-manual-test-plan.md`

1. Teklif olusturma
2. Satis/siparis (merkez depo)
3. Satis/siparis (fabrika)
4. Tahsilat
5. Teslim
6. Iade
7. Validation hata senaryolari
8. Side actions:
   - Belge Onizle
   - WhatsApp Taslagi (`sendEnabled=false`)
   - AI insight
9. Auth/yetki:
   - auth yok -> 401
   - yetki yok -> 403

## 8. WhatsApp Webhook Test Sirasi
Kaynak plan: `docs/qa/whatsapp-workflow-manual-test-plan.md`

1. Verify token dogrulama (dogru/yanlis)
2. Invalid signature -> 403
3. Valid signature -> kabul
4. Duplicate `messageId` -> duplicate=true
5. ONAY valid token
6. RED invalid token
7. Unauthorized phone
8. Expired ticket
9. Production policy:
   - secret yoksa webhook kabul edilmemeli

## 9. Basarili / Basarisiz Kabul Kriterleri

### Basarili kabul
- Tum kalite komutlari geciyor.
- Hizli Islem ana senaryolari beklenen mode/impact ile tamamlanir.
- WhatsApp webhook guvenlik ve idempotency senaryolari beklenen sonuclari verir.
- Auth/persistence policy ihlali yoktur (silent fallback yok, fail-open yok).

### Basarisiz kabul
- `pnpm test`, `typecheck`, `build` veya smoke komutlarindan biri fail.
- Authsiz/yetkisiz erisimde koruma calismiyor.
- Signature dogrulamasi atlanabiliyor veya production'da secret yokken kabul oluyorsa.
- Hizli Islem kritik senaryolarinda beklenmeyen runtime hata/yanlis status.

## 10. Bug Raporlama Formati
Her bug icin tek kayit ac:
1. Baslik
2. Modul/Route
3. Ortam bilgisi (env ozet)
4. Tekrar adimlari
5. Beklenen sonuc
6. Gerceklesen sonuc
7. Hata ekran goruntusu / log
8. Etki seviyesi:
   - P0 (pilot blocker)
   - P1 (yuksek risk)
   - P2 (orta)
   - P3 (dusuk)
9. Gecici workaround var mi?

## 11. Pilot Tamamlandi / Tamamlanmadi Karari

### Tamamlandi
- Tüm zorunlu senaryolar gecti.
- P0 acik bug yok.
- P1 bug'lar operasyonu bloke etmeyecek seviyede veya workaround'lu.
- Dokumanlanan foundation kalan alanlar pilot beklentisiyle uyumlu.

### Tamamlanmadi
- En az bir P0 bug acik.
- Guvenlik/persistence policy ihlali var.
- Hizli Islem veya WhatsApp kritik akislari tekrarlanabilir sekilde fail.
- Ortam/env eksikleri nedeniyle sonuc guvenilir degil.

## 12. Test Sonrasi Kapanis
1. Sonuc raporunu `docs/manual-test-report-refresh.md` veya yeni pilot test raporuna isle.
2. P0/P1 bug listesini ayri backlog'a aktar.
3. "Go/No-Go" kararini teknik + operasyon ekipleriyle birlikte imzala.
