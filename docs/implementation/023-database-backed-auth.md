# 023 - Database Backed Auth for Real Users

## Ozet
Bu degisiklik ile `/auth/login` endpoint'i `PERSISTENCE_MODE=postgres` modunda gercek kullaniciyi Postgres'ten dogrular.
Demo/mock/header fallback davranislari production guvenlik kurallarini bozmadan korunmustur.

## Neler Eklendi
- `users` ve `tenants` auth alanlari icin migration:
  - `tenants.slug` (unique, not null)
  - `users.password_hash`
  - `users.role`
  - `users.is_active`
  - `users.updated_at`
  - tenant + email (case-insensitive) unique index
- Guvenli parola hash/verify yardimcisi:
  - `apps/api/src/shared/password-hash.ts`
  - `scrypt` + rastgele salt + `timingSafeEqual`
- DB auth yardimcisi:
  - `apps/api/src/shared/database-auth.ts`
- `/auth/login` postgres akisinda DB dogrulama:
  - dogru kullanici/parola: `200`
  - yanlis parola veya kullanici yok: `401`
  - pasif kullanici: `403`
  - DB erisimi yok / misconfigured: `503` fail-closed

## Local/Dev ve Pilot Auth Uyumu
- `LOCAL_PILOT_AUTH_*` akisi sadece `NODE_ENV !== production` ve explicit flag ile calismaya devam eder.
- Postgres modunda once DB auth denenir; local pilot auth sadece explicit local gelistirme senaryosu icin fallback olarak kalir.
- `mock_access` ve header principal fallback production/postgres guvenlik politikasina aykiri sekilde acilmaz.
- `PERSISTENCE_MODE=demo` ve `NODE_ENV=development` iken `DEMO_AUTH_ENABLED` unset ise demo login aciktir; `DEMO_AUTH_ENABLED=false` ise fail-closed kalir.

## Admin Seed (Idempotent)
- Script: `apps/api/src/scripts/seed-admin-user.ts`
- Komut:
  - `pnpm --filter @hallederiz/api seed:auth-admin`
- Davranis:
  - tenant kaydini olusturur/gunceller
  - admin user kaydi varsa sifre hash + rol + aktiflik gunceller
  - yoksa yeni kayit olusturur

## Yeni/Onemli Env Alanlari
- `AUTH_SEED_TENANT_SLUG`
- `AUTH_SEED_TENANT_NAME`
- `AUTH_SEED_ADMIN_EMAIL`
- `AUTH_SEED_ADMIN_PASSWORD`
- `AUTH_SEED_ADMIN_FULL_NAME`
- `AUTH_SEED_ADMIN_ROLE`

## Test Kapsami
- `auth-hardening` testlerine postgres DB auth login senaryolari eklendi.
- `database-auth` icin parola dogrulama + inactive/invalid senaryolari eklendi.

## Guvenlik Notu
Bu PR production/postgres modunda auth guvenligini gevsetmez:
- demo auth production'da acilmaz
- mock token/header fallback acilmaz
- DB hata durumunda silent mock success donulmez
