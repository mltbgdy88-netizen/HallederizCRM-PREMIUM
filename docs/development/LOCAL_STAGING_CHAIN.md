# Yerel Staging Operasyon Zinciri

Sprint 8 kabul paketi: **Hızlı İşlem (teklif) → Onay → Teklif kaydı** akışını Postgres üzerinde otomatik doğrular.

## Ne test eder?

| Adım | Beklenen |
|------|----------|
| API `PERSISTENCE_MODE=postgres` | production-readiness `persistence.mode=postgres` |
| `POST /quick-operations/submit` (teklif) | `mode=queued_for_approval`, `approvalId` dolu |
| `POST /platform/approvals/:id/approve` | `ok=true` |
| Postgres `offers` tablosu | Kayıt sayısı artar |
| `GET /offers` | En az bir teklif döner |

Bu script **tarayıcı UI** veya **web build** gerektirmez; yalnızca API + Postgres.

## Önkoşullar

1. **Postgres ayakta** (ör. Docker):
   ```powershell
   docker compose -f docker-compose.local.yml up -d postgres
   ```
2. **Seed kimlik bilgileri** (`.env` veya shell):
   ```env
   AUTH_SEED_ADMIN_EMAIL=admin@hallederiz.local
   AUTH_SEED_ADMIN_PASSWORD=change-me-local-only
   AUTH_SEED_TENANT_SLUG=hallederiz
   DATABASE_URL=postgres://hallederiz:hallederiz_dev@127.0.0.1:5432/hallederizcrm
   ```
3. İlk koşuda script `migrate:apply` ve `seed:auth-admin` çalıştırır.

## Komut

```powershell
cd C:\HallederizCRM-PREMIUM-CURSOR

# Tam otomatik (kendi API'sini 4012'de açar)
pnpm staging:local-chain

# Migration zaten uygulandıysa
$env:STAGING_SKIP_MIGRATE="1"
pnpm staging:local-chain

# Kendi API'niz postgres modda 4000'de çalışıyorsa
$env:STAGING_USE_EXISTING_API="1"
$env:STAGING_API_BASE_URL="http://127.0.0.1:4000"
$env:STAGING_SKIP_MIGRATE="1"
pnpm staging:local-chain
```

## Web ile manuel doğrulama (isteğe bağlı)

API postgres modda çalışırken web:

```env
NEXT_PUBLIC_USE_DEMO_DATA=false
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4000
NEXT_PUBLIC_ENABLE_DEMO_AUTH=false
```

Akış:

1. `/hizli-islem` → teklif gönder
2. `/onaylar` → onayla
3. `/teklifler` → yeni kayıt görünür
4. `/ayarlar/staging-kontrol` → servis sağlığı

## Ortam değişkenleri

| Değişken | Varsayılan | Açıklama |
|----------|------------|----------|
| `DATABASE_URL` | docker-compose local URL | Postgres bağlantısı |
| `STAGING_SKIP_MIGRATE` | — | `1` ise migrate atlanır |
| `STAGING_USE_EXISTING_API` | — | `1` ise script API spawn etmez |
| `STAGING_API_BASE_URL` | `http://127.0.0.1:4000` | Mevcut API tabanı |
| `STAGING_CHAIN_API_PORT` | `4012` | Script'in açtığı API portu |
| `WEB_URL` | `http://localhost:3000` | CORS origin (login) |

## Başarısızlık ipuçları

| Hata | Çözüm |
|------|--------|
| `persistence mode postgres olmali` | Yerel API `PERSISTENCE_MODE=demo` ile çalışıyor; script kendi API'sini kullanın veya env düzeltin |
| `tenant not found` | `seed:auth-admin` çalıştırın veya `AUTH_SEED_TENANT_SLUG` kontrol edin |
| `health check timed out` | Postgres/API portu; `4012` veya `4000` çakışması |
| `offers tablosu artmadi` | Onay bridge / commercial dispatch; API loglarına bakın |

## İlgili dokümanlar

- [SMOKE_AUTOMATION.md](./SMOKE_AUTOMATION.md)
- [sec-3b-staging-runtime-runbook.md](../operations/sec-3b-staging-runtime-runbook.md)
- [staging-validation.md](../staging-validation.md)
