# Pilot Run 002

## Tarih
- 2026-04-30

## Pilot-Run-001 Blocker Ozeti
1. Postgres erisimi yok (`POSTGRES_PORT_BLOCKED`)
2. API dev boot import hatasi (`ai-local-output-routes`)
3. API route'larinda 404 (method/boot path dogrulama problemi)

## Bu Turda Yapilan Duzeltmeler
1. API dev/start boot uyumlulugu
   - `apps/api/package.json`
   - `dev` scripti ESM resolution ile calisacak sekilde guncellendi:
     - `node --watch --experimental-specifier-resolution=node --loader ts-node/esm src/index.ts`
   - `start` scripti pilot boot check icin source entrypoint ile hizalandi:
     - `node --experimental-specifier-resolution=node --loader ts-node/esm src/index.ts`
2. Postgres local boot destegi
   - `docker-compose.local.yml` eklendi (local/dev amacli postgres:16)
3. Runbook netlestirme
   - `docs/qa/pilot-test-runbook.md` icine docker compose ile postgres baslatma adimlari eklendi.

## API Boot Sonucu
- `pnpm --filter @hallederiz/api dev` ile API acildi.
- Log kaniti: `Server listening at http://0.0.0.0:4000`.
- Import hatasi tekrar edilmedi.

## Route Method/Response Dogrulama Sonucu
Dogru HTTP method ile kontrol edildi:
- `GET /health` -> `200`
- `POST /auth/login` -> `200` (demo auth acik oldugunda)
- `GET /orders` (auth yok) -> `401` (beklenen)
- `POST /quick-operations/preview` (auth yok) -> `401` (beklenen)
- `GET /whatsapp/webhook` (yanlis token) -> `403` (beklenen)
- `POST /whatsapp/webhook` (invalid signature) -> `403` (beklenen)

Not:
- Pilot-run-001'deki bir kisim 404 sonucu method yanlisligi + runtime boot yolundan kaynaklaniyordu.
- Bu turda kritik route'larin dogru methodla 404 donmedigi dogrulandi.

## Postgres Durumu
- Ortamda 5432 erisimi halen yoksa environment blocker devam eder.
- Kod/config destegi saglandi:
  - `docker compose -f docker-compose.local.yml up -d postgres`
  - Ardindan `DATABASE_URL/POSTGRES_URL` local postgres'e guncellenmeli.

## Web Durumu
- `pnpm --filter @hallederiz/web dev` ile:
  - `GET /` -> `200`
  - `GET /login` -> `200`
  - `GET /hizli-islem` -> `200`

## Hizli Islem Mini Smoke
(API seviyesinde)
- Demo login token alindi.
- `POST /quick-operations/preview` -> `200`
- `POST /quick-operations/submit` -> `200`
- Submit `mode` -> `executed`
- `sideActions` -> mevcut

## WhatsApp Mini Smoke
(API seviyesinde, gercek gonderim yok)
- invalid signature -> `403`
- valid signature -> `200` (kabul)
- duplicate guard davranisi unit/integration testlerde mevcut (idempotency testleri geciyor).

## Sonuc
- **PASS_WITH_WARNINGS**

### Kalan Warningler (Environment)
1. Local Postgres halen calismiyorsa pilot turu DB bagimli senaryolarda bloke olur.
2. Local AI opsiyonel servis ayakta degilse AI local senaryolari degraded/mock olarak test edilmelidir.

### Kod/Config Bloker Durumu
- API import boot hatasi: **Cozuldu**
- Kritik route 404 sorunu (dogru methodla): **Cozuldu**
- Postgres local boot yolu: **Dokumante edildi ve compose dosyasi eklendi**
