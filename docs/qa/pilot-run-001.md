# Pilot Run 001

## Tarih
- 2026-04-30

## Git Commit SHA
- `8530ace`

## Env Ozeti (Secret Degerleri Yazilmadan)
Calisma dizininde sadece `.env.example` bulundu, `.env` veya `.env.local` tespit edilmedi.

Durum (VAR/YOK):
- `NODE_ENV`: YOK (dosyada set degil, calistirma komutunda development olarak set edildi)
- `DEMO_AUTH_ENABLED`: YOK (dosyada set degil, calistirma komutunda true set edildi)
- `NEXT_PUBLIC_ENABLE_DEMO_AUTH`: YOK (dosyada set degil, calistirma komutunda true set edildi)
- `PERSISTENCE_MODE`: YOK (dosyada set degil, calistirma komutunda postgres set edildi)
- `DATABASE_URL`/`POSTGRES_URL`: YOK (gercek `.env` dosyasi olmadigi icin)
- `ALLOW_DEMO_FALLBACK`: YOK (dosyada set degil, calistirma komutunda false set edildi)
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`: YOK (dosyada set degil, calistirma komutunda test degeri set edildi)
- `WHATSAPP_WEBHOOK_APP_SECRET`: YOK (dosyada set degil, calistirma komutunda test degeri set edildi)
- `AI_PROVIDER`: YOK (dosyada set degil, calistirma komutunda mock set edildi)
- `LOCAL_AI_SERVICE_URL`: YOK (dosyada set degil, calistirma komutunda 127.0.0.1:8008 set edildi)

> Not: Secret degerleri rapora yazilmamistir.

## Postgres Durumu
- Port kontrolu sonucu: `POSTGRES_PORT_BLOCKED`
- Sonuc: **BLOCKED: local postgres running degil veya 5432 portuna erisim yok**

## API Boot Sonucu
### API dev (`pnpm --filter @hallederiz/api dev`)
- Durum: **FAIL**
- Hata: `Cannot find module '.../apps/api/src/ai-local-output-routes' imported from src/index.ts`
- Etki: API dev ayağa kalkmıyor.

### API start (`pnpm --filter @hallederiz/api start`)
- Durum: Kismi
- `GET /health`: 200 loglandi
- Ancak asagidaki endpointler 404 dondu:
  - `/auth/login`
  - `/orders`
  - `/quick-operations/preview`
  - `/whatsapp/webhook`
- Etki: pilot mini smoke icin gerekli API rotalari canli degil.

## Web Boot Sonucu
- Komut: `pnpm --filter @hallederiz/web dev`
- Log kaniti:
  - `GET /` -> 200
  - `GET /login` -> 200
  - `GET /hizli-islem` -> 200
- Sonuc: Web dev boot **PASS**

## Hızlı İşlem Mini Smoke Sonucu
- Planlanan: Teklif secimi + cari + satir + kaynak + submit + sideActions
- Gerceklesen: API endpointleri 404 oldugu icin submit smoke tamamlanamadi.
- Sonuc: **BLOCKED (API route availability)**

## WhatsApp Mini Smoke Sonucu
- Planlanan: verify token, invalid signature 403, valid signature kabul, duplicate messageId kontrolu
- Gerceklesen: `/whatsapp/webhook` route 404 (API start modunda)
- Sonuc: **BLOCKED (route not available in booted runtime)**

## Local AI Durumu
- `http://127.0.0.1:8008/health` kontrolu: DOWN
- Bu kosuda `AI_PROVIDER=mock` ile devam edilmesi gerekir.
- Sonuc: **WARN** (local AI opsiyonel olarak ayakta degil)

## Blocker Listesi
1. Local Postgres erisilemez (`POSTGRES_PORT_BLOCKED`).
2. API dev boot fail (`ai-local-output-routes` import cozumleme hatasi).
3. API start'ta kritik route'lar 404 (`/auth/login`, `/orders`, `/quick-operations/preview`, `/whatsapp/webhook`).

## Warning Listesi
1. Gercek `.env` dosyasi yok; sadece `.env.example` mevcut.
2. Local AI service ayakta degil (`127.0.0.1:8008` down).
3. Gecici `.tmp-*.log` dosyalari olustu (local run artifact).

## Kalite Komutlari
- `pnpm test`: PASS
- `pnpm typecheck`: PASS
- `pnpm build`: PASS
- `pnpm smoke:routes`: PASS
- `pnpm smoke:navigation`: PASS

## Sonuc
- **BLOCKED**

Boot seviyesinde ortam ayaga kalksa da (web), API runtime route erisimi pilot manuel turu icin yeterli degil. Pilot test turu baslamadan once API boot/path sorunlari ve Postgres erisimi giderilmelidir.
