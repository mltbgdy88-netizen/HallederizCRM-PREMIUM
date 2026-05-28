# 021 - API CORS Dev Login Fix

## Sorunun Nedeni
Web uygulamasi `http://localhost:3010` uzerinden calisirken login istegi `http://localhost:4000/auth/login` adresine tarayici icinden gidiyordu. API Fastify sunucusunda CORS register edilmedigi icin browser response'u frontend'e ulastirmiyor ve login ekrani genel auth saglayici hatasina dusuyordu.

## Yapilan Duzeltme

- API Fastify bootstrap surecine `@fastify/cors` eklendi.
- CORS ayarlari `apps/api/src/shared/cors-config.ts` icinde test edilebilir hale getirildi.
- Development varsayilanlari local web portlarini kapsar:
  - `http://localhost:3000`
  - `http://localhost:3001`
  - `http://localhost:3002`
  - `http://localhost:3010`
  - `http://127.0.0.1:3010`
- `API_CORS_ORIGINS` env degeri ile staging/local origin listesi acikca yonetilebilir.
- Production modunda wildcard `*` origin kabul edilmez.

## Header ve Method Politikasi

Izinli methodlar:

```text
GET, POST, PUT, PATCH, DELETE, OPTIONS
```

Izinli headerlar:

```text
content-type, authorization, x-session-token, x-tenant-id
```

Credentials kapali tutuldu; mevcut auth modeli localStorage token ve header tabanli calismaya devam eder.

## Auth Guvenligi

Bu degisiklik auth davranisini gevsetmez:

- `LOCAL_PILOT_AUTH` mantigi aynen korunur.
- `DEMO_AUTH` fallback acilmadi.
- `mock_access` token fallback acilmadi.
- Header permission fallback acilmadi.

## Local Calistirma

`.env.local` veya local shell icinde:

```text
API_CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3010,http://127.0.0.1:3010
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

API ve web:

```powershell
pnpm --filter @hallederiz/api dev
pnpm --filter @hallederiz/web dev -- -p 3010
```

## Dogrulama

- `http://localhost:4000/health` -> `200`
- `OPTIONS /auth/login` + `Origin: http://localhost:3010` -> `204`, `Access-Control-Allow-Origin: http://localhost:3010`
- `POST /auth/login` + `Origin: http://localhost:3010` -> `200`, session token dondu
- `http://localhost:3010/login` -> acilir
- Browser login `tenantSlug=hallederiz` ile CORS bloklanmadan API response alir
- Login sonrasi `/hizli-islem` acilir

Not: Codex in-app browser otomasyonu bu ortamda Node runtime surumu nedeniyle calistirilamadi (`node_repl` daha yeni Node istiyor). Browser davranisi preflight ve origin'li POST runtime kontrolleriyle dogrulandi.

## Degisen Dosyalar

- `apps/api/src/index.ts`
- `apps/api/src/shared/cors-config.ts`
- `apps/api/src/tests/cors-config.test.ts`
- `apps/api/package.json`
- `pnpm-lock.yaml`
- `.env.example`
