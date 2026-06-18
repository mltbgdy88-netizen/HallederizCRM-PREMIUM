---
title: Cron / Scheduler Idempotency Cleanup Analysis
owner: AUDIT-FIX-7A / Agent B
status: analysis
last_updated: 2026-06-18
verdict: CRON_IDEMPOTENCY_ANALYSIS_READY
---

# Cron / Scheduler Idempotency Cleanup — Analysis (P0)

Bu doküman **docs-only** analiz çıktısıdır. Runtime davranışı değiştirmez. Kaynak: `apps/worker/**`, `apps/api/**` (idempotency cleanup), `packages/domain/**`, `packages/database/**`, `scripts/**`, `docs/operations/qop-runtime-smoke-plan.md`, `docs/operations/security-ops-backlog-plan.md`.

---

## 1. Executive summary

| Alan | Bulgu |
|------|--------|
| Dahili cron/scheduler | **Yok** — worker tek-tick, process-exit modeli; periyodik iş dış orchestrator gerektirir |
| Idempotency TTL purge | **Var** — CLI + API helper + DB repository; otomatik zamanlama **yok** |
| Outbox worker | **Var** — Postgres claim/lease/retry/DLQ; tick başına in-memory duplicate guard |
| Kritik uyumsuzluk | Readiness `WORKER_MODE=durable` bekler; runtime yalnızca `production` kabul eder |
| Önerilen ilk PR | Ops zamanlaması + `durable`/`production` hizalama + cleanup runbook (kod minimal) |

**Verdict:** `CRON_IDEMPOTENCY_ANALYSIS_READY`

---

## 2. Scheduler / cron / job runner konumu

### 2.1 Worker uygulaması (`apps/worker`)

- Giriş: `apps/worker/src/index.ts`
- Modlar:
  - `WORKER_MODE=production` → `runWorkerProductionTick()` (Postgres outbox, tek tick)
  - `WORKER_MODE=foundation_dry_run` (varsayılan) → bellek içi dry-run
  - `WORKER_MODE=disabled` → çıkış
- Tick sonrası process biter; repo içinde **sürekli döngü veya dahili cron yok**.
- Üretim konfig çözümü: `packages/domain/src/worker/production-config.ts` (`resolveWorkerRuntimeConfig`)

### 2.2 Domain worker runtime (`packages/domain/src/worker`)

| Dosya | Rol |
|-------|-----|
| `runtime.ts` / `async-runtime.ts` | Claim → handler → complete / fail / DLQ |
| `outbox.ts` | Enqueue, retry backoff, lease işaretleme |
| `contract-handlers.ts` | `approval_execution`, `ai_reply_send`, `integration_sync` + document handlers |
| `outbox-job-types.ts` | Standart job type listesi ve payload validasyonu |
| `production-config.ts` | `WORKER_ID`, `WORKER_CLAIM_LEASE_MS` (varsayılan 300000 ms) |

### 2.3 Postgres outbox (`packages/database`)

- Şema: `packages/database/src/schema/execution-worker-audit.ts` → `outbox_jobs`, `dead_letter_jobs`
- Repository: `packages/database/src/repositories/outbox-job-repository.ts`
- Atomik claim: `FOR UPDATE SKIP LOCKED` (`buildClaimNextOutboxJobSql`)
- Hardening notları: `docs/durable-workflow-outbox-hardening.md` — “Distributed scheduler orchestration” **bu fazda yapılmadı**

### 2.4 Harici zamanlama (beklenen)

Repo dışı orchestrator örnekleri:

- Kubernetes `CronJob` → `node apps/worker/dist/index.js` (veya `pnpm --filter @hallederiz/worker start`)
- Idempotency purge → `pnpm ops:idempotency-cleanup -- --execute [--limit=N]` (Postgres + `PERSISTENCE_MODE=postgres`)

`.github/workflows` altında worker tick veya idempotency cleanup için zamanlanmış job **bulunmuyor**.

### 2.5 `WORKER_MODE` terminoloji çatışması (risk)

| Kaynak | Beklenen değer |
|--------|----------------|
| `apps/api/src/shared/production-readiness-runtime.ts` | Production’da `WORKER_MODE=durable` |
| `docs/operations/sec-3b-staging-runtime-runbook.md` | `durable` |
| `packages/domain/src/worker/production-config.ts` | Yalnızca `foundation_dry_run` \| `production` \| `disabled` |
| `apps/worker/src/index.ts` | Production tick yalnızca `WORKER_MODE=production` |

`durable` değeri `worker_mode_unsupported:durable` ile fail-closed olur; readiness ise `worker_mode_not_durable` blocker üretir. **İlk implementasyon PR’ında hizalanmalı** (alias veya doküman/kod tek isim).

---

## 3. Idempotency key standardı

### 3.1 HTTP mutation (API)

| Bileşen | Konum |
|---------|--------|
| Store / check | `apps/api/src/shared/idempotency-store.ts` |
| Route wrapper | `apps/api/src/shared/idempotency-mutation.ts` (`withStoredIdempotency`) |
| Header | `Idempotency-Key` / `idempotency-key` (`resolveIdempotencyKeyFromHeader`) |

**Composite key (persisted):** `tenant_id` + `scope` + `idempotency_key`  
**Tablo:** `idempotency_records` (`packages/database/src/migrations/0015_idempotency_records.sql`)  
**UNIQUE:** `(tenant_id, scope, idempotency_key)`  
**Aktif kayıt:** `expires_at > NOW()` (`findActive`)

**Request fingerprint:** `SHA-256(JSON.stringify(body))` → conflict vs replay ayrımı.

**TTL:** `IDEMPOTENCY_TTL_MS` veya `IDEMPOTENCY_TTL_HOURS`; varsayılan 24 saat; minimum 1 saat; 7 günden uzun TTL için uyarı logu.

### 3.2 Bilinen API scope’ları

| Scope | Route / kullanım |
|-------|------------------|
| `quick-operations.submit` | `apps/api/src/quick-operations/routes.ts` |
| `payments.create` | `apps/api/src/commercial-operations/routes.ts` |
| `payments.allocate` | `apps/api/src/commercial-operations/routes.ts` (`/payments/:id/confirm`) |

QOP idempotency smoke planı: `docs/operations/qop-runtime-smoke-plan.md`.

### 3.3 Outbox / worker jobs

| Bileşen | Composite |
|---------|-----------|
| `outbox_jobs` | `UNIQUE (tenant_id, idempotency_key)` |
| `approval_execution_logs` | `UNIQUE (tenant_id, idempotency_key)` |
| Enqueue dedup | `createOutboxJob` → `findByIdempotencyKey`; DB `ON CONFLICT (tenant_id, idempotency_key) DO UPDATE` |

**Job ID türetimi:** `job_{tenantCompact}_{idempotencyCompact}` (`packages/domain/src/worker/outbox.ts`).

**Önerilen key üretimi (mevcut desenler):**

- API: istemci `Idempotency-Key` (UUID veya client-generated stable key)
- Approval execution: `exec_{approvalRequestId}_{idempotencyKey}` (`packages/domain/src/approval-execution/dispatcher.ts`)
- Worker payload: `payload.idempotencyKey` zorunlu (`validateStandardOutboxPayload`)

**Scope vs outbox:** Worker tarafında HTTP `scope` alanı yok; tenant + idempotency_key yeterli. API replay koruması scope’lu; outbox replay koruması job-type bağımsız tenant-key ile sınırlı.

---

## 4. Retry / DLQ / lease / outbox çakışmaları

### 4.1 Lifecycle

```
pending | failed  --claim-->  claimed  --handler ok-->  completed
                |                              |
                +-- retryable fail ------------+--> failed (available_at backoff)
                |
                +-- max attempts / non-retryable --> dead_letter
```

- Claim: `status IN ('pending','failed')`, `available_at <= now`, `lease_expires_at IS NULL OR lease_expires_at <= now`
- Lease: claim sırasında `lease_expires_at` set; süre dolunca yeniden claim mümkün
- Retry gecikmesi: üstel backoff (`calculateNextRetryAt`, varsayılan base 1s, max 60s)

### 4.2 Tick içi duplicate guard

`processWorkerTick` / `processWorkerTickAsync`: aynı tick’te aynı `idempotencyKey` ikinci kez işlenmez → `duplicate_idempotency_second_execution_blocked` ile complete edilir.

**Sınır:** Guard yalnızca **tek tick** içinde; farklı tick’lerde veya farklı worker instance’larında domain handler idempotency’sine güvenilir.

### 4.3 Çakışma senaryoları

| Senaryo | Davranış | Risk |
|---------|----------|------|
| Lease süresi doldu, handler hâlâ çalışıyor | İkinci worker claim edebilir | **Yüksek** — çift mutation (handler idempotent değilse) |
| Handler başarılı, `complete()` crash | Retry ile yeniden çalıştırma | **Orta-yüksek** |
| `ON CONFLICT DO UPDATE` enqueue (DLQ replay aynı key) | Mevcut satır üzerine yazılır | **Orta** — status/attempts sıfırlanabilir |
| API idempotency kaydı TTL sonrası purge | Aynı key ile yeni istek “new” sayılır | **Orta** — istemci replay penceresi dışına çıkarsa çift kayıt |
| Outbox completed + aynı tenant/key yeni enqueue | Conflict update | **Düşük-orta** — operasyonel karar gerekir |

### 4.4 DLQ replay

- Foundation: `packages/domain/src/worker/admin.ts` → `replayDeadLetterJobFoundation` (pending’e alıp yeniden enqueue)
- Production Postgres replay path ayrıca doğrulanmalı; aynı `idempotency_key` ile `ON CONFLICT` güncellemesi yan etki üretebilir.

---

## 5. Mevcut cleanup script’leri ve API helper

### 5.1 CLI

| Öğe | Detay |
|-----|--------|
| Script | `scripts/ops/idempotency-cleanup.cjs` |
| Paket komutları | `pnpm ops:idempotency-cleanup:dry-run`, `pnpm ops:idempotency-cleanup` (`--execute`) |
| Varsayılan | **dry-run**; silme için `--execute` zorunlu |
| Postgres şartı | Execute modu `PERSISTENCE_MODE=postgres` + `DATABASE_URL` / `POSTGRES_URL` |
| Demo mod | DB silmez; stdout’ta 0 kayıt |

### 5.2 API katmanı

`apps/api/src/shared/idempotency-cleanup.ts` → `runIdempotencyCleanup()`:

- Postgres: `DatabaseIdempotencyRecordRepository.purgeExpiredIdempotencyRecords`
- Demo/memory: `purgeMemoryIdempotencyStore`

HTTP cron endpoint **yok**; yalnızca programatik/CLI kullanım.

### 5.3 Repository purge semantiği

`packages/database/src/repositories/idempotency-record-repository.ts`:

- `expires_at <= before` (varsayılan `before = now`)
- Batch: `DEFAULT_IDEMPOTENCY_PURGE_LIMIT = 1000`, max 10000
- Dry-run: sayım döner, silmez
- Delete: `ORDER BY expires_at ASC LIMIT n` — büyük tabloda çoklu cron tick ile tamamlanır

### 5.4 Test / runbook referansları

- `apps/api/src/tests/sec-3a-idempotency-ops.test.ts`
- `docs/operations/sec-3b-staging-runtime-runbook.md` §12 — incident’te `pnpm ops:idempotency-cleanup:dry-run`

---

## 6. `idempotency_records` TTL / purge

| Parametre | Kaynak | Varsayılan |
|-----------|--------|------------|
| Kayıt süresi (insert) | `Date.now() + resolveIdempotencyTtlMs()` | 24 saat |
| Purge kriteri | `expires_at <= before` | `before = now` |
| Index | `idx_idempotency_records_expires_at` | purge için uygun |

**Operasyonel notlar:**

- TTL uzatılırsa tablo büyür; cleanup sıklığı artırılmalı.
- Purge, **aktif replay penceresini** kısaltmaz (zaten expired olanları siler).
- Purge idempotent: aynı batch’i tekrar çalıştırmak güvenli (kayıt kalmadıysa 0 silme).
- **Outbox / execution log TTL’si yok** — bu analiz yalnızca `idempotency_records` purge’unu kapsar.

---

## 7. Job type bazında duplicate execution riski

| Job type | Handler | Duplicate risk | Gerekçe |
|----------|---------|----------------|---------|
| `approval_execution` | `contract-handlers.ts` → execution port | **Kritik** | Finansal/ticari mutation; retry/lease overlap |
| `ai_reply_send` | execution port | **Kritik** | Outbound mesaj çift gönderim |
| `integration_sync` / `erp.sync` | execution port | **Yüksek** | ERP write / çift sync |
| `document_render` | document handlers | **Orta** | Render maliyeti; çift çıktı |
| `document_archive` | document handlers | **Orta** | Arşiv yan etkisi |
| `audit.timeline.writeback` | (standart listede) | **Orta** | Timeline duplicate event |
| HTTP `payments.create` | idempotency_records | **Düşük** (TTL içi) / **Orta** (TTL sonrası) | Scope + key + hash |
| HTTP `quick-operations.submit` | idempotency_records | **Düşük** (TTL içi) | SEC-3C smoke hedefi |

Foundation handler’lar production’da `foundation_blocked_in_production` ile DLQ’ya gider (`NODE_ENV=production`).

---

## 8. En küçük güvenli implementasyon PR planı

Backlog referansı: `docs/operations/security-ops-backlog-plan.md` → `fix/ops-idempotency-cron-cleanup`

### PR-1 — Terminoloji ve ops runbook (minimal kod)

**Amaç:** Production readiness ile worker runtime uyumu.

- `WORKER_MODE`: `durable` → `production` alias (veya tek isimde doküman + readiness hizalama)
- `docs/operations/sec-3b-staging-runtime-runbook.md` güncelle
- Unit test: `durable` ve `production` aynı tick yoluna girer

**Risk:** Düşük | **Rollback:** env eski değere dön

### PR-2 — Zamanlanmış idempotency cleanup (ops-only, kod minimal)

**Amaç:** Otomatik TTL purge; **yeni mutation yok**.

- Örnek K8s CronJob manifest (repo `docs/operations/` veya deploy repo) — bu PR’da yalnızca runbook da yeterli
- Zamanlama önerisi: günde 1–4 kez; `pnpm ops:idempotency-cleanup:dry-run` önce CI/staging
- Execute: `--limit=5000` ile batch; `remainingEstimate > 0` ise alarm
- Env: `PERSISTENCE_MODE=postgres`, `DATABASE_URL`, ops secret injection
- **Ops sign-off:** retention = mevcut TTL (varsayılan 24h); uzatma ayrı karar

**Test:** Mevcut `sec-3a-idempotency-ops.test.ts` + staging dry-run kanıtı

### PR-3 — Zamanlanmış worker tick (ayrı PR, ops bağımlı)

**Amaç:** Outbox işleme gecikmesini sınırla.

- Harici cron: `WORKER_MODE=production`, `PERSISTENCE_MODE=postgres`, `WORKER_ID` unique per replica
- Sıklık: 30s–60s (lease 300s ile uyumlu)
- İzleme: tick log `deadLettered`, `failed`; readiness `/platform/worker/*` health

**Bu PR idempotency cleanup ile birleştirilmemeli** — blast radius ayrımı.

### PR-4 — Sertleştirme (opsiyonel, P1)

- Handler-level idempotency audit (execution port sonrası kayıt)
- DLQ replay policy: yeni `idempotency_key` suffix zorunluluğu
- `postgres-runtime-smoke` genişletmesi (QOP planı: `docs/operations/qop-runtime-smoke-plan.md`)

### Kabul kriterleri (implementasyon PR’ları için)

- [ ] Cleanup cron dry-run + execute staging kanıtı
- [ ] Purge sonrası aktif replay bozulmuyor (expires_at gelecekte olan kayıtlar kalıyor)
- [ ] `pnpm test`, `pnpm smoke:routes`, `pnpm smoke:navigation`
- [ ] `pnpm security:audit`, `pnpm security:audit:report`
- [ ] Worker mode readiness blocker kalkmış

---

## 9. Açık riskler ve bağımlılıklar

1. **Dahili scheduler yok** — cleanup ve worker tick dış platforma bağlı; unutulursa tablo büyür / outbox gecikir.
2. **`WORKER_MODE` split** — staging “durable”, kod “production”; canlı açılış blocker.
3. **Lease overlap** — uzun süren handler’lar çift execution riski; lease süresi ve handler idempotency gözden geçirilmeli.
4. **Outbox ON CONFLICT UPDATE** — DLQ replay ve yeniden enqueue operasyonel prosedür gerektirir.
5. **Idempotency purge ≠ outbox purge** — tamamlanmış outbox kayıtları ayrı retention politikası ister (bu analiz kapsam dışı backlog).
6. **TTL sonrası API replay** — istemcilerin key yenileme politikası dokümante edilmeli.

---

## 10. Mojibake kontrolü

Bu dosya ve referans alınan kaynak dosyalarda bozuk UTF-8 / mojibake tespit edilmedi. Analiz durdurulmadı.

---

## 11. Referans dosya listesi

| Yol | Konu |
|-----|------|
| `apps/worker/src/index.ts` | Worker tick giriş |
| `apps/worker/src/production-runtime.ts` | Postgres async tick |
| `apps/api/src/shared/idempotency-store.ts` | TTL, check/store |
| `apps/api/src/shared/idempotency-cleanup.ts` | Purge helper |
| `apps/api/src/shared/idempotency-mutation.ts` | Route wrapper |
| `scripts/ops/idempotency-cleanup.cjs` | Ops CLI |
| `packages/database/src/repositories/idempotency-record-repository.ts` | DB purge |
| `packages/database/src/repositories/outbox-job-repository.ts` | Claim/enqueue |
| `packages/domain/src/worker/runtime.ts` | Retry/DLQ/duplicate guard |
| `packages/domain/src/worker/production-config.ts` | Env çözümleme |
| `docs/operations/security-ops-backlog-plan.md` | P0 backlog |
| `docs/operations/qop-runtime-smoke-plan.md` | QOP idempotency smoke |
| `docs/durable-workflow-outbox-hardening.md` | Outbox sözleşmesi |
