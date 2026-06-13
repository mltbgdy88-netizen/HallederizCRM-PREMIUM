# SEC-3B Staging Runtime Runbook

Operasyon hedefi: Postgres persistence, migration uygulanmış DB ve production-benzeri env ile API/web runtime'ını staging'de güvenli şekilde doğrulamak.

**Bu doküman SEC-3B dry-run çıktısıdır.** Production-ready iddiası içermez.

---

## 1. Staging deploy sırası

1. Main branch'i deploy et (`HEAD` DEP-1 sonrası temiz audit beklenir).
2. Postgres ve Redis servislerini ayağa kaldır (managed veya `docker compose -f docker-compose.local.yml up -d postgres redis`).
3. Secret/env değerlerini staging secret store'a yaz.
4. `@hallederiz/database` paketini build et ve migration uygula.
5. API'yi `PERSISTENCE_MODE=postgres` + production-benzeri env ile boot et.
6. Web'i `NEXT_PUBLIC_USE_DEMO_DATA=false` ile build/deploy et.
7. Readiness ve smoke kontrollerini çalıştır.
8. Kritik mutation smoke (payment/QOP idempotency) staging DB üzerinde manuel veya otomasyon ile doğrula.

---

## 2. Gerekli env listesi (staging)

| Değişken | Staging değeri |
|---|---|
| `NODE_ENV` | `production` (prod-parity önerilir) |
| `PERSISTENCE_MODE` | `postgres` |
| `DATABASE_URL` veya `POSTGRES_URL` | Staging Postgres connection string |
| `REDIS_URL` | Staging Redis |
| `AUTH_SESSION_SECRET` | Güçlü random secret |
| `TENANT_ENCRYPTION_KEY` | Güçlü random secret |
| `APP_BASE_URL` | Staging web origin |
| `API_BASE_URL` | Staging API origin |
| `API_CORS_ORIGINS` | Staging web origin(ler)i (wildcard yok) |
| `WORKER_MODE` | `durable` |
| `APPROVAL_EXECUTION_MODE` | `controlled` (foundation değil) |
| `DEMO_AUTH_ENABLED` | `false` |
| `NEXT_PUBLIC_ENABLE_DEMO_AUTH` | `false` |
| `LOCAL_PILOT_AUTH_ENABLED` | `false` |
| `NEXT_PUBLIC_USE_DEMO_DATA` | `false` |
| `ALLOW_DEMO_FALLBACK` | `false` |
| `OMNICHANNEL_ALLOW_MOCK_PROVIDERS` | `false` |

Referans: `docs/development/ENV_MATRIX.md`, `.env.example`

---

## 3. Secret listesi

- `AUTH_SESSION_SECRET`
- `TENANT_ENCRYPTION_KEY`
- `DATABASE_URL` / `POSTGRES_URL` (credentials içerir)
- `REDIS_URL` (varsa auth)
- WhatsApp live ise: `WHATSAPP_WEBHOOK_APP_SECRET`, `WHATSAPP_ACCESS_TOKEN`, vb.
- Meta live ise: `META_WEBHOOK_APP_SECRET`

---

## 4. Demo flag kill-switch listesi

Staging/production'da **kapalı** olmalı:

- `PERSISTENCE_MODE=demo`
- `DEMO_AUTH_ENABLED=true`
- `NEXT_PUBLIC_ENABLE_DEMO_AUTH=true`
- `LOCAL_PILOT_AUTH_ENABLED=true`
- `NEXT_PUBLIC_USE_DEMO_DATA=true`
- `ALLOW_DEMO_FALLBACK=true`
- `OMNICHANNEL_ALLOW_MOCK_PROVIDERS=true`

Readiness blocker kaynağı: `apps/api/src/shared/production-readiness-runtime.ts`

---

## 5. Postgres migration sırası

```bash
pnpm --filter @hallederiz/database build
export DATABASE_URL="postgres://USER:PASS@HOST:5432/DBNAME"
pnpm --filter @hallederiz/database migrate:status
pnpm --filter @hallederiz/database migrate:apply
pnpm --filter @hallederiz/database migrate:status
```

Sıra (registry): `20260502_ai_foundation` → `0001_initial` … → `0015_idempotency_records`

Kaynak: `packages/database/src/migration-registry.ts`

---

## 6. Migration doğrulama SQL'leri

```sql
-- Uygulanan migration sayısı (beklenen: 16)
SELECT COUNT(*) FROM schema_migrations;

-- Son migration adı
SELECT name, applied_at FROM schema_migrations ORDER BY applied_at DESC LIMIT 5;

-- 0015 idempotency tablosu
\d idempotency_records

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'idempotency_records'
ORDER BY ordinal_position;

-- Unique constraint
SELECT conname FROM pg_constraint
WHERE conrelid = 'idempotency_records'::regclass;

-- Indexler
SELECT indexname FROM pg_indexes WHERE tablename = 'idempotency_records';
```

Beklenen kolonlar: `tenant_id`, `scope`, `idempotency_key`, `request_hash`, `expires_at`, `response_json`, `status_code`, `created_at`

Beklenen unique: `(tenant_id, scope, idempotency_key)`

---

## 7. API boot kontrolü

```bash
# Boot öncesi env doğrulama (production strict)
NODE_ENV=production PERSISTENCE_MODE=postgres DATABASE_URL=... \
  pnpm --filter @hallederiz/api dev

# Liveness (tek başına readiness değildir)
curl -s http://localhost:4000/health

# Readiness (auth gerekir)
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:4000/platform/production-readiness | jq .
```

Beklenen staging (env tam + DB migrate edilmiş):

- `/health` → `{ status: "ok" }`
- `/platform/production-readiness` → `overallStatus` en az `degraded`; eksik entegrasyonlar warning/blocker olarak listelenir
- Demo flag açıksa → `blocked` + `unsafeFallbacks`

---

## 8. Web build/deploy kontrolü

```bash
NEXT_PUBLIC_USE_DEMO_DATA=false \
NEXT_PUBLIC_API_BASE_URL=https://staging-api.example.com \
pnpm --filter @hallederiz/web build
pnpm --filter @hallederiz/web start
```

Doğrula:

- Demo preview band görünmemeli (demo flag false)
- Liste sayfaları API'den veri çekmeli; API kapalıysa boş/hata state (mock success yok)

---

## 9. Smoke sonrası kontrol

```bash
pnpm smoke:navigation
pnpm smoke:routes
pnpm smoke:product-readiness
# Staging API ayaktaysa (workflow_dispatch):
pnpm smoke:production-data
pnpm smoke:api-offline  # yalnızca offline contract; DB kanıtı değil
```

Staging DB required akışlar (manuel veya gelecek CI job):

- Payment create: missing key → 400 `idempotency_key_required`
- Payment create: replay → aynı response
- Payment create: conflict → `idempotency_key_conflict`
- QOP submit: aynı idempotency kuralları
- WhatsApp webhook: invalid signature → 403

Test referansları: `sec-3a-idempotency-ops.test.ts`, `quick-operations.test.ts`, `policy-route-integration-hardening.test.ts`

---

## 10. Rollback stratejisi

**Migration rollback scripti yok.** Geri dönüş seçenekleri:

1. **DB snapshot restore** (tercih edilen): deploy öncesi snapshot al.
2. **Forward-fix migration**: yeni SQL migration ile düzeltme.
3. **App rollback**: önceki API/web image'a dön; DB şeması geri alınmaz.

Migration tekrar çalıştırma: `applyDatabaseMigrations` checksum ile idempotent skip yapar; değiştirilmiş migration dosyası checksum mismatch ile fail eder.

---

## 11. Backup/restore notu

- Staging cutover öncesi: `pg_dump -Fc` full backup.
- Restore: `pg_restore --clean --if-exists -d DBNAME backup.dump`
- Idempotency tablosu (`0015`) backup'a dahil edilmeli.

---

## 12. Incident durumunda bakılacak loglar

- API Fastify logger (`apps/api`)
- Postgres connection errors → `persistence_unavailable`
- Worker/outbox: `WORKER_MODE`, dead letter jobs
- Readiness endpoint çıktısı: `blockers`, `missingEnv`, `unsafeFallbacks`
- Audit/timeline write failures
- Idempotency cleanup: `pnpm ops:idempotency-cleanup:dry-run`

---

## 13. Production'a geçmeden önce zorunlu checklist

- [ ] Boş DB'de `migrate:apply` PASS (16 migration)
- [ ] `0015_idempotency_records` tablo + unique + index doğrulandı
- [ ] Tekrar `migrate:apply` → tümü SKIPPED
- [ ] `PERSISTENCE_MODE=postgres` + geçerli `DATABASE_URL` ile API boot
- [ ] `DATABASE_URL` yokken silent mock success yok (test: `persistence-policy.test.ts`)
- [ ] Production env'de demo flag'ler kapalı; readiness blocked değil (entegrasyonlar hariç bilinen blocker'lar)
- [ ] `NEXT_PUBLIC_USE_DEMO_DATA=false` web build
- [ ] Payment/QOP idempotency staging smoke PASS
- [ ] `pnpm security:audit:report` PASS
- [ ] Backup/restore prosedürü yazılı ve denendi

---

## Bilinen ops gap'ler (SEC-3B backlog)

| Gap | Risk | Not |
|---|---|---|
| ~~CI'da Postgres migration job yok~~ | ~~P1~~ | **SEC-3C:** `postgres-runtime-smoke` workflow + `ci:postgres-*` scriptleri eklendi |
| `migrate:list` CLI `dist/migrations` arıyor | P2 | `migrate:apply` registry kullanır; `migrate:list` boş dist'te fail |
| `docker-compose.local.yml` API default `PERSISTENCE_MODE=demo` | P2 | Staging manual env override gerekir |
| `smoke:production-data` CI'da optional (workflow_dispatch) | P2 | Live API gerektirir |

---

## SEC-3C — CI Postgres migration + runtime smoke

**Workflow:** `.github/workflows/postgres-runtime-smoke.yml`  
**Job adı:** `postgres-runtime-smoke`

### CI ortam örneği

```bash
PGUSER=postgres
PGPASSWORD=postgres
PGHOST=127.0.0.1
PGPORT=5432
PGDATABASE=hallederiz_ci
PERSISTENCE_MODE=postgres
NODE_ENV=test
DEMO_AUTH_ENABLED=false
ALLOW_DEMO_FALLBACK=false
AUTH_SESSION_SECRET=ci-sec3c-session-secret-min-32-characters
AUTH_SEED_TENANT_SLUG=hallederiz
AUTH_SEED_ADMIN_EMAIL=ci-admin@hallederiz.test
AUTH_SEED_ADMIN_PASSWORD=CiTestPassword123!
API_CORS_ORIGINS=https://app.example.com
WEB_URL=https://app.example.com
PORT_API=4010
```

### CI komutları

```bash
pnpm ci:postgres-migration-smoke
pnpm ci:postgres-runtime-smoke
```

**Migration smoke doğrular:**

- 16 migration ilk `migrate:apply` → APPLIED
- `0015_idempotency_records` tablo + kolonlar + unique + `expires_at` index
- İkinci `migrate:apply` → 16 SKIPPED

**Runtime smoke doğrular:**

- API `PERSISTENCE_MODE=postgres` boot
- `/health` 200
- `/platform/production-readiness` persistence `postgres`
- Payment idempotency: missing key 400, replay, conflict 409
- Origin guard: kötü origin 403
- Import templates: auth yok 401
- `idempotency_records` satır artışı (mock fallback değil)

### Manuel SEC-3B vs CI SEC-3C

| | SEC-3B (manuel) | SEC-3C (CI) |
|---|---|---|
| Postgres | Fiziksel container / staging | GitHub Actions `postgres:16` service |
| Migration | Manuel `migrate:apply` | `ci:postgres-migration-smoke` |
| Runtime | Manuel curl / API boot | `ci:postgres-runtime-smoke` |
| Auth seed | `seed:auth-admin` manuel | Runtime smoke içinde otomatik |
| Kanıt | Operatör log + SQL | CI job PASS/FAIL |

### Kalan P2/P3 backlog

- P2: `migrate:list` CLI `dist/migrations` uyumsuzluğu
- P2: Web unit testleri ana `pnpm test` zincirine bağlı değil
- P3: Developer shell `DATABASE_URL` kirliliği → test öncesi env temizle
