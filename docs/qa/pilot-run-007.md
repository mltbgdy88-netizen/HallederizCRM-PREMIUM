# Pilot Run 007

- Tarih: 2026-04-30 15:34:44 +03:00
- Git commit SHA: `6835b7d`

## 1) Env var/yok ozeti (secret/password degerleri yazilmadan)

Kaynak dosya: `.env.local` (local, commit edilmez)

- `NODE_ENV`: var
- `DEMO_AUTH_ENABLED`: var
- `NEXT_PUBLIC_ENABLE_DEMO_AUTH`: var
- `PERSISTENCE_MODE`: var
- `ALLOW_DEMO_FALLBACK`: var
- `DATABASE_URL`: var (`127.0.0.1:55432` portuna isaretli)
- `POSTGRES_URL`: var (`127.0.0.1:55432` portuna isaretli)
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`: var
- `WHATSAPP_WEBHOOK_APP_SECRET`: var
- `AI_PROVIDER`: var (`mock`)
- `LOCAL_AI_SERVICE_URL`: var
- `LOCAL_AI_TIMEOUT_MS`: var
- `LOCAL_PILOT_AUTH_ENABLED`: var
- `LOCAL_PILOT_AUTH_EMAIL`: var
- `LOCAL_PILOT_AUTH_PASSWORD`: var
- `LOCAL_PILOT_AUTH_ROLE`: var

Not: `.env.local` git'e eklenmedi.

## 2) Docker/Postgres durumu

- Compose project: `hallederizcrm-premium-pilot`
- Container: `hallederizcrm-premium-pilot-postgres-1`
- Durum: `healthy`
- Port: `55432 -> 5432`

## 3) API boot ve route smoke

- `GET /health` -> `200`
- `POST /auth/login` (local pilot auth credential) -> `200`
- `GET /orders` (auth yok) -> `401`
- `POST /quick-operations/preview` (auth yok) -> `401`
- `GET /whatsapp/webhook` (yanlis token) -> `403`
- `GET /whatsapp/webhook` (dogru token) -> `200`
- `POST /whatsapp/webhook` (invalid signature) -> `403`

## 4) Local pilot auth sonucu

- Local pilot login basarili (`200`)
- Uretilen access token `mock_access_*` degil, `pilot_access_*` prefix ile donuyor
- Bu sayede postgres modunda request-context tarafinda session dogrulamasi basarili

## 5) Hizli Islem authenticated mini run (API)

Kullanilan akış:
- `POST /quick-operations/preview` (auth)
- `POST /quick-operations/submit` (auth)

Payload:
- `operationType: sale_order`
- `customerId` + `customerNameSnapshot`
- en az 1 satir (`center_warehouse`, `Merkez Depo`, `A-01-03`)

Sonuc:
- Preview -> `200`, workflow impact listesi dondu
- Submit -> `200`
- `mode` -> `executed`
- `workflowImpacts` -> var
- `sideActions.documentPreview` -> var
- `sideActions.whatsappDraft` -> var (`sendEnabled=false`)
- `sideActions.aiInsight` -> var (`source=template`)

## 6) WhatsApp valid signature + duplicate testi

- Ilk valid signature POST -> `200`, `duplicate=false`
- Ayni `messageId` ile ikinci POST -> `200`, `duplicate=true`

## 7) Web boot sonucu

- Web dev server calisti (port `3000` dolu oldugu icin `3001`'e gecti)
- `GET /` -> `200`
- `GET /login` -> `200`
- `GET /hizli-islem` -> `200`

## 8) Local AI durumu

- `AI_PROVIDER=mock`
- Beklenen davranis: mock/degraded foundation (local AI service zorunlu degil)

## 9) Blocker listesi

- Yok

## 10) Warning listesi

- Bu turda web dev boot `3000` yerine `3001` portunda dogrulandi (3000 baska process tarafindan doluydu).

## 11) Kalite komutlari

- `pnpm test` -> PASS
- `pnpm typecheck` -> PASS
- `pnpm build` -> PASS
- `pnpm smoke:routes` -> PASS
- `pnpm smoke:navigation` -> PASS

## 12) Sonuc

`PASS_WITH_WARNINGS`
