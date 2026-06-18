# Payment Postgres Cross-Tenant Analysis (P0 / Faz 2)

**Agent:** A  
**Branch target:** `analysis/p0-payment-postgres-xtenant-persistence`  
**Date:** 2026-06-18  
**Scope:** Analysis-only. No runtime, test, or migration changes in this PR.

---

## Executive summary

Mevcut `payment-cross-tenant-idor.test.ts` dosyasi **demo persistence** ve **header spoof** (`x-tenant-id: tenant_other`) senaryolarini 403 ile dogruluyor. **Postgres gercek DB yolu**, **iki kiracili seed** ve **repository `getPayment` mock fallback** riski bu test dosyasinda kapsanmiyor. CI `postgres-runtime-smoke.cjs` odeme idempotency/origin guard kaniti uretiyor; cross-tenant odeme izolasyonu icermiyor.

**Verdict:** `PAYMENT_POSTGRES_XTENANT_ANALYSIS_READY` — Faz 2 uygulama PR kapsami asagida netlestirildi; bloklayici dokuman/mojibake sorunu yok.

---

## 1) Postgres test harness — mevcut mu?

| Katman | Durum | Kanit |
|--------|-------|-------|
| Unit/integration (`node:test`) | **Yok** | `apps/api/src/tests/test-env.ts` yalnizca `withDemoAuth` (`PERSISTENCE_MODE=demo`, `DEMO_AUTH_ENABLED=true`) ve genel `withEnv` saglar. `withPostgresAuth` / `withPostgresHarness` benzeri helper yok. |
| CI runtime smoke | **Var** | `scripts/ci/postgres-runtime-smoke.cjs` — gercek Postgres, `seed:auth-admin`, API boot, `/auth/login`, odeme idempotency smoke. |
| Postgres env kullanan API testleri | **Kismi** | Bircok test `PERSISTENCE_MODE=postgres` ile **env/policy** davranisini dogrular; gercek `DATABASE_URL` ile HTTP + repository entegrasyonu yok. |

**Sonuc:** Postgres odeme cross-tenant icin **node:test harnessi henuz tanimli degil**. Faz 2'de ya (a) `test-env.ts` + opsiyonel `DATABASE_URL` guard ile entegrasyon dosyasi, ya da (b) `postgres-runtime-smoke.cjs` genisletmesi gerekir. Her iki yol da backlog ile uyumlu.

---

## 2) Iki kiracili seed — mevcut mu?

| Kaynak | Icerik |
|--------|--------|
| `packages/database/src/seeds/demo-seed.sql` | Tek kiraci: `tenant_1`. `payment_1` + `payment_allocations` yalnizca `tenant_1` altinda. |
| `apps/api/src/scripts/seed-admin-user.ts` | Tek kiraci: `AUTH_SEED_TENANT_SLUG` (default `hallederiz`). Ikinci kiraci / ikinci admin yok. |
| `apps/api/src/commercial-operations/mock-store.ts` | Demo bellek: `tenant_1`, `payment_1`. |
| `postgres-runtime-smoke.cjs` | `ensureCiCustomer` — smoke kiracisi icin `customer_ci_1`; ikinci kiraci seed yok. |

**Sonuc:** **Iki kiracili Postgres seed yok.** `tenant_other` testlerde yalnizca **var olmayan / eslesmeyen header degeri** olarak kullaniliyor; DB'de `tenant_b` + kullanici + `payment_1` (tenant_a) kombinasyonu seed edilmiyor.

**Faz 2 seed onerisi (minimal):**

- `tenant_a` (veya mevcut `hallederiz` slug) + `payment_1` satiri `payment_receipts` tablosunda.
- `tenant_b` (or. slug `tenant_b`, id `tenant_b` veya UUID) + ayri admin kullanici (`AUTH_SEED_*_B` veya test fixture SQL).
- `tenant_b` altinda **ayni id** `payment_1` **olmayacak** (cross-tenant ID collision testi icin kritik).

---

## 3) Tenant B, Tenant A `payment_1` okuma — gercek DB yolu

### Mevcut demo test (guard katmani)

`payment-cross-tenant-idor.test.ts`:

- `withDemoAuth` → demo persistence.
- `createSession({ tenantSlug: "hallederiz", ... })` → session `tenant_1` (`mockTenant`).
- `x-tenant-id: tenant_other` → `buildRequestContext` `tenantMismatch` → `assertAuthenticated` → **403**.

Bu, **oturum kiracisi ile header kiracisi uyumsuzlugu** testidir; repository SQL'i calismadan reddedilir.

### Gercek Postgres senaryosu (Faz 2 hedefi)

**Senaryo A — Header spoof (mevcut testin postgres karsiligi):**

1. `PERSISTENCE_MODE=postgres`, `DEMO_AUTH_ENABLED=false`, `ALLOW_DEMO_FALLBACK=false`.
2. Tenant A admin ile `/auth/login` → token (`tenantId = tenant_a`).
3. `GET /payments/payment_1` + `x-tenant-id: tenant_b`.
4. Beklenen: **403** (`tenant_mismatch`).

**Senaryo B — Gecerli Tenant B oturumu, Tenant A kaydina erisim (asil IDOR):**

1. DB'de `payment_receipts`: `(id='payment_1', tenant_id='tenant_a')`.
2. Tenant B admin token (header spoof **yok**).
3. `GET /payments/payment_1`.
4. Beklenen: **404** (`Payment not found`) — repository sorgusu:

```sql
select * from payment_receipts
where tenant_id = $1 and (id = $2 or receipt_no = $2) limit 1
```

`$1 = tenant_b` oldugunda satir donmez; route 404 dondurur.

**Senaryo C — Liste sizintisi:**

- `GET /payments` Tenant B token → yalnizca `tenant_b` satirlari; Tenant A `payment_1` listede **olmamali**.

**Uygulama notu:** `commercial-operations/routes.ts` odeme read guard'lari `requireReadAccess(readPermissions.payments)` kullanir; `requireTenantReadAccess` + `resolveTenantId` **yok**. Cross-tenant koruma read'de **buyuk olcude repository `tenant_id` filtresine** bagli. Faz 2 postgres testleri bu filtreyi kanitlamalidir.

---

## 4) `createSession` cok kiracili mi?

**Hayir.**

- `createSession` (`apps/api/src/shared/session-store.ts`):
  - `assertDemoAuthAllowed()` — yalnizca demo auth acikken.
  - Her zaman `mockTenant` (`id: tenant_1`) baglar.
  - `tenantSlug` input'u session tenant seciminde **kullanilmiyor** (yalnizca `createLoginPayload` icin).

Postgres entegrasyon testleri icin:

- **Gercek login:** `POST /auth/login` + `seed:auth-admin` (smoke deseni).
- veya test-only `createDatabaseAuthSession` / imzali token uretimi (varsa `database-auth` yolu).
- `createSession` **Faz 2 postgres matrisine uygun degil**; demo-only kalabilir.

---

## 5) `payment_1` / `payment_receipts` seed konumu

| Konum | Detay |
|-------|--------|
| `packages/database/src/seeds/demo-seed.sql` | Postgres seed: `payment_1`, `tenant_1`, `PAY-930`, allocation `allocation_payment_1_order_1`. |
| `packages/database/src/schema/payments.ts` | `payment_receipts` + `payment_allocations` sema tanimi. |
| `apps/api/src/commercial-operations/mock-store.ts` | Demo bellek `payment_1` (tutar/allocations demo-seed'den farkli olabilir). |
| `apps/api/src/modules/commercial-core/repository.ts` | Postgres read/write `payment_receipts` tablosu. |

**Not:** `apps/api/src/commercial-operations/repository.ts` **yok**; persistence `modules/commercial-core/repository.ts` uzerinden.

Auth seed kiraci (`hallederiz`) ile demo-seed `tenant_1` **farkli id'ler** olabilir. Faz 2'de test fixture'da tenant id'leri **tek kaynakta** hizalanmali (slug → id mapping smoke'taki gibi `SELECT id FROM tenants WHERE slug = ...`).

---

## 6) `getPayment` mock fallback riski — test yaklasimi

`modules/commercial-core/repository.ts` — `getPayment`:

```typescript
if (!runtime.dbEnabled) return getPayment(id);           // mock-store
// ...
} catch (error) {
  runtime.handleDbFailure(error);
  return getPayment(id);                                 // mock-store fallback
}
```

`db-runtime.ts` / `persistence-policy.ts`:

- `shouldThrowOnDbFailure` = `production` **veya** `postgres` **veya** `!ALLOW_DEMO_FALLBACK`.
- Postgres + `ALLOW_DEMO_FALLBACK=false` (CI smoke) → DB hatasinda **throw**, mock'a dusmez.
- Postgres + `ALLOW_DEMO_FALLBACK=true` (bazi dev profilleri) → DB hatasinda mock `getPayment(id)` — **tenant filtresi yok** → teorik sizinti riski.

**Onerilen Faz 2 test matrisi:**

| Test | Env | Beklenti |
|------|-----|----------|
| Fallback kapali | `PERSISTENCE_MODE=postgres`, `ALLOW_DEMO_FALLBACK=false`, DB kasitli hata / baglanti kopuk | 503 veya `persistence_unavailable`; **200 + payment body olmamali** |
| Tenant izolasyonu (saglikli DB) | Postgres, iki kiraci seed | Tenant B → Tenant A `payment_1` → **404** |
| Fallback acik (regresyon) | `ALLOW_DEMO_FALLBACK=true`, DB disabled veya hata | Mock donerse bile cross-tenant session ile `payment_1` **tenant_1 mock verisine ulasmamali** — bu davranis **bug ise ayri hardening PR** |

Ayri unit test: `handleDbFailure` sonrasi `getPayment` cagrilmamasi icin repository'de `if (!runtime.fallbackAllowed) throw` pattern'i degerlendirilebilir (Faz 2 veya follow-up).

---

## 7) Postgres Runtime Smoke dahil mi?

**Kismen — cross-tenant yok.**

`scripts/ci/postgres-runtime-smoke.cjs` mevcut odeme kontrolleri:

- Idempotency key eksik → 400
- Evil origin → 403
- Create + replay + conflict → idempotency kaniti
- `idempotency_records` count (`payments.create`)

**Eksik:**

- Cross-tenant `GET /payments/payment_1` (Tenant B token)
- Header spoof `x-tenant-id`
- `payment_1` read-back tenant scope

`docs/operations/qop-runtime-smoke-plan.md` QOP submit odakli; odeme cross-tenant maddesi yok.

**Faz 2 smoke onerisi:** `postgres-runtime-smoke.cjs` sonuna veya ayri adim olarak:

1. Ikinci kiraci + admin seed (veya test SQL).
2. Tenant A'da bilinen `payment_1` (veya smoke'ta olusturulan payment id).
3. Tenant B login → `GET /payments/{id}` → 404.
4. Tenant B login + `x-tenant-id: tenant_a` → 403.

---

## 8) Onerilen Faz 2 uygulama PR kapsami

**PR adi (onerilen):** `test/security-payment-cross-tenant-postgres`  
**Backlog referansi:** `docs/operations/security-ops-backlog-plan.md` — P0 item #4

### Dosya kapsami (hedef)

| Dosya / alan | Degisiklik |
|--------------|------------|
| `apps/api/src/tests/test-env.ts` | `withPostgresAuth` veya `withPostgresIntegrationEnv` (fail-closed: `DATABASE_URL` yoksa skip veya acik fail) |
| `apps/api/src/tests/payment-cross-tenant-postgres.test.ts` | Yeni: senaryo A/B/C matrisi |
| `packages/database/src/seeds/` veya test fixture | `tenant_b` + ikinci admin + tenant_a `payment_1` |
| `apps/api/src/scripts/seed-admin-user.ts` veya `seed-ci-tenants.ts` | Opsiyonel ikinci kiraci seed |
| `scripts/ci/postgres-runtime-smoke.cjs` | Cross-tenant read adimlari |
| `.github/workflows/postgres-runtime-smoke.yml` | Ikinci kiraci env (gerekirse) |
| `docs/operations/security-ops-backlog-plan.md` | Faz 2 tamamlandi notu (opsiyonel) |

### Dokunulmayacaklar (bu analiz PR'si gibi)

- `apps/web`, UI
- Migration sema degisikligi (mevcut `payment_receipts.tenant_id` yeterli)
- `ALLOW_DEMO_FALLBACK` production acilmasi

### Test plani (Faz 2 PR)

- `pnpm --filter @hallederiz/api test` — yeni postgres testler (`DATABASE_URL` ile CI job)
- `postgres-runtime-smoke` workflow — cross-tenant adim PASS
- Mevcut `payment-cross-tenant-idor.test.ts` — demo regressions korunur
- `pnpm security:audit`, `pnpm lint`

### Kabul kriterleri

- [ ] Tenant B gecerli oturum ile Tenant A `payment_1` → **404**, body sizintisi yok
- [ ] Header spoof → **403**
- [ ] `GET /payments` listesinde cross-tenant kayit yok
- [ ] Postgres + fallback kapali profilde DB hatasi mock'a dusmuyor
- [ ] CI smoke'ta kanit log satiri

---

## 9) Risk ozeti

| Risk | Seviye | Not |
|------|--------|-----|
| Demo testlerin postgres regresyonu yakalamamasi | **Yuksek** | Mevcut durum; Faz 2 ile kapanir |
| `getPayment` mock fallback (dev fallback acik) | **Orta** | Production/CI kapali; dev profilde ayri test |
| Read guard'da explicit tenant assert yok | **Orta** | Repository filtresine bagimlilik; postgres test kaniti sart |
| `tenant_1` vs `hallederiz` id drift | **Dusuk** | Seed hizalama gerekir |
| `createSession` ile yanlis harness | **Dusuk** | Postgres testlerde kullanilmamali |

---

## 10) Referans dosyalar

- `apps/api/src/tests/payment-cross-tenant-idor.test.ts` — demo cross-tenant (9 test)
- `apps/api/src/tests/test-env.ts` — `withDemoAuth`
- `apps/api/src/commercial-operations/routes.ts` — odeme HTTP yuzeyi
- `apps/api/src/modules/commercial-core/repository.ts` — `getPayment`, `listPayments`
- `packages/database/src/seeds/demo-seed.sql` — `payment_1`
- `scripts/ci/postgres-runtime-smoke.cjs` — CI postgres smoke
- `docs/operations/qop-runtime-smoke-plan.md`
- `docs/operations/security-ops-backlog-plan.md`

---

## Final verdict

**`PAYMENT_POSTGRES_XTENANT_ANALYSIS_READY`**

Gerekce: Mevcut kod ve test envanteri incelendi; bosluklar (postgres harness, iki kiraci seed, gercek DB IDOR, smoke cross-tenant, fallback risk testi) tanimlandi. Faz 2 uygulama PR kapsami uygulanabilir. Bu analiz PR'si yalnizca dokumantasyon icerir; mojibake kontrolu PASS.
