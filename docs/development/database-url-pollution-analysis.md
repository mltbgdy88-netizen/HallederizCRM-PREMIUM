# P1 — Developer `DATABASE_URL` Pollution Analysis

Bu belge, geliştirici kabuğunda veya IDE terminalinde kalan `DATABASE_URL` / `POSTGRES_URL` değerlerinin yerel test, smoke ve ops script sonuçlarını nasıl etkilediğini özetler. Kapsam **yalnızca analiz**; runtime veya script davranışı değiştirilmez.

**Kaynak backlog:** [security-ops-backlog-plan.md](../operations/security-ops-backlog-plan.md) — madde 5 (P1)  
**İlgili hijyen rehberi:** [local-worktree-hygiene.md](./local-worktree-hygiene.md)  
**Son doğrulama:** main üzerinde kod taraması (Agent C, 2026-06-18)

---

## 1. Özet

| Soru | Yanıt |
|------|--------|
| `DATABASE_URL` / `POSTGRES_URL` nerede okunur? | API `shared/*`, `@hallederiz/config`, `@hallederiz/database`, CI/ops scriptleri (aşağıda envanter) |
| Yanlış URL yerel testi nasıl etkiler? | Çoğu birim testi `withEnv` ile izole; kabuk env’si sızarsa `PERSISTENCE_MODE=postgres` + URL kombinasyonunda gerçek bağlantı veya fail-closed hata |
| Skip / fail net mi? | Birim testlerinde çoğunlukla explicit `withEnv`; `pnpm test` harness env sanitize etmez; CI postgres scriptleri eksik URL’de **fail** |
| PowerShell temizlik checklist gerekli mi? | **Evet** — `local-worktree-hygiene.md`’de var; bu analiz bağlam ve risk senaryolarını genişletir |
| Script guard mı, yalnızca docs mu? | **Şimdilik docs + checklist yeterli**; deterministik guard ayrı `hardening/dev-env-database-url-sanitize` PR konusu |
| `package.json` değişikliği gerekli mi? | **Bu analiz PR’sı için hayır** |

---

## 2. Okuma noktaları envanteri

### 2.1 Öncelik sırası (kanonik)

Çoğu runtime modülü aynı önceliği kullanır:

```text
POSTGRES_URL ?? DATABASE_URL
```

| Alan | Dosya / modül | Not |
|------|----------------|-----|
| Repository runtime | `apps/api/src/shared/db-runtime.ts` | `buildRepositoryRuntime` |
| Auth (postgres) | `apps/api/src/shared/database-auth.ts` | `createPostgresAuthExecutor` |
| Audit | `apps/api/src/shared/audit-service.ts` | |
| Omnichannel | `apps/api/src/shared/omnichannel-runtime.ts`, `omnichannel-provider-runtime.ts` | |
| Onay / usage | `apps/api/src/shared/approval-repository-runtime.ts`, `tenant-usage-runtime.ts` | |
| Idempotency cleanup | `apps/api/src/shared/idempotency-cleanup.ts` | |
| Sales AI | `apps/api/src/shared/sales-ai-runtime.ts` | |
| Entity timeline | `apps/api/src/shared/entity-timeline-service.ts` | |
| Production readiness | `apps/api/src/shared/production-readiness-runtime.ts` | `urlSource` raporu |
| Platform routes | `apps/api/src/platform-core/routes/approval-routes.ts`, `worker-routes.ts` | |
| WhatsApp workflow repo | `apps/api/src/modules/whatsapp-workflow/repository.ts` | `env` parametresi |
| Config validation | `packages/config/src/runtime-env.ts` | `PERSISTENCE_MODE=postgres` iken URL zorunlu |
| DB client / CLI | `packages/database/src/client.ts`, `cli.ts` | migrate / executor |
| Domain worker config | `packages/domain/src/worker/production-config.ts` | |
| Seed script | `apps/api/src/scripts/seed-admin-user.ts` | |

### 2.2 İstisna: yalnızca `DATABASE_URL` kontrolü

`apps/api/src/shared/worker-domain-execution-port.ts` içinde `buildWorkerContext`:

```typescript
process.env.PERSISTENCE_MODE === "postgres" && process.env.DATABASE_URL ? "postgres" : "demo"
```

`POSTGRES_URL` set, `DATABASE_URL` unset iken worker context **demo** kalır; diğer modüller postgres kullanabilir. Bu, kirlilikten bağımsız bir **tutarsızlık** riskidir ve pollution analizinde “yanlış mod seçimi” senaryolarına eklenmelidir.

### 2.3 Test harness

| Bileşen | Davranış |
|---------|----------|
| `apps/api/scripts/run-tests.cjs` | `env: { ...process.env }` — kabuk env’sini **olduğu gibi** aktarır; `NODE_ENV=test` set etmez |
| `apps/api/src/tests/test-env.ts` | `withEnv` / `withDemoAuth` — test başına snapshot restore |
| `apps/api/src/shared/runtime-env-bootstrap.ts` | `NODE_ENV === "test"` iken `assertRuntimeEnv` **atlanır** |

### 2.4 CI / ops scriptleri

| Script | URL okuma | Eksik URL |
|--------|-----------|-----------|
| `scripts/ci/postgres-migration-smoke.cjs` | `DATABASE_URL ?? POSTGRES_URL` veya `PG*` bileşenleri | `process.exit(1)` + mesaj |
| `scripts/ci/postgres-runtime-smoke.cjs` | Aynı | Aynı; sonra her iki değişkeni normalize eder |
| `scripts/ops/idempotency-cleanup.cjs` | `POSTGRES_URL ?? DATABASE_URL` | stderr + exit (execute modu) |

Kök `package.json` smoke komutları (`smoke:routes`, `smoke:navigation`) doğrudan DB URL okumaz; yalnızca route/navigation doğrular.

### 2.5 Dokümantasyon ve örnek env

- `.env.example` — her iki URL de örnek localhost değeri
- `docs/development/ENV_MATRIX.md` — ortam matrisi
- `docs/development/local-worktree-hygiene.md` — gate öncesi temizlik (§2)
- `docs/operations/sec-3b-staging-runtime-runbook.md` — staging’de URL zorunluluğu

---

## 3. Kirlilik senaryoları ve etki

### 3.1 Senaryo A — Eski shell `DATABASE_URL`, `PERSISTENCE_MODE` unset (demo)

- **Beklenen:** Demo persistence, bellek tabanlı store.
- **Risk:** Düşük. Çoğu kod `PERSISTENCE_MODE === "postgres"` olmadan postgres executor açmaz.
- **İstisna:** `worker-domain-execution-port` yalnızca `DATABASE_URL` + `PERSISTENCE_MODE=postgres` ister; demo modda etkisiz.

### 3.2 Senaryo B — Shell’de `PERSISTENCE_MODE=postgres` + yanlış / uzak `DATABASE_URL`

- **Etki:** `createQueryExecutor({ mode: "postgres", postgresUrl })` gerçek TCP bağlantısı dener.
- **Test:** `withEnv` kullanmayan veya restore etmeyen testler kabuk URL’sine bağlanabilir; flaky veya uzak DB’ye yazma riski.
- **API dev:** `runtime-env-bootstrap` production dışında strict değil; development + postgres + geçersiz URL → `persistence_unavailable` veya bağlantı hatası.
- **Fail-closed:** `ALLOW_DEMO_FALLBACK=false` (önerilen) iken mock’a düşmez — `persistence-policy.test.ts`, `whatsapp-workflow-persistence.test.ts` ile hizalı.

### 3.3 Senaryo C — `POSTGRES_URL` ve `DATABASE_URL` çakışması

- **Etki:** `POSTGRES_URL` kazanır; geliştirici `DATABASE_URL`’i güncelledi sanabilir.
- **Worker:** Senaryo 2.2 — yalnızca `DATABASE_URL` sayılır.

### 3.4 Senaryo D — Staging / prod URL’nin yerel shell’de kalması

- **Risk:** En yüksek — veri sızıntısı veya istenmeyen migration/seed (`seed:auth-admin`, ops cleanup).
- **Mevcut koruma:** Production `assertRuntimeEnv` + demo bayrak yasağı; ancak **development NODE_ENV** ile staging URL hâlâ bağlanabilir.
- **Öneri:** Gate öncesi checklist; staging URL’leri asla global kullanıcı/profile env’de kalıcı tutmama.

### 3.5 Senaryo E — `pnpm test` sonrası kirli env

- `run-tests.cjs` env’i değiştirmez; ancak `worker-document-handlers.test.ts` gibi doğrudan `process.env` mutasyonu yapan testler restore eder.
- Çoğu test `withEnv` kullanır; env pollution birim test suite’inde **çoğunlukla izole**, ama **garanti değil**.

---

## 4. Fail / skip davranış netliği

### 4.1 `pnpm test` (varsayılan API test suite)

| Durum | Davranış |
|-------|----------|
| URL yok, test `withEnv` ile demo/postgres mock | Deterministik pass |
| URL yok, `PERSISTENCE_MODE=postgres`, fallback kapalı | `persistence_unavailable` reject — **fail (beklenen)** |
| URL var (kabuk), test env set etmiyor | Kabuk değerleri kullanılır — **non-deterministic** |
| Postgres integration (harici harness) | `DATABASE_URL` yoksa dokümanlarda **skip**; kök `pnpm test` içinde ayrı harness yok |

**Boşluk:** Kök test runner’da “postgres URL set ama test izole değil” için explicit guard veya `NODE_ENV=test` zorlaması yok.

### 4.2 CI postgres smoke

- URL yok → script **FAIL** (sessiz skip yok) — `postgres-runtime-smoke.cjs`, `postgres-migration-smoke.cjs`.
- Bu, quality gate hedefiyle uyumlu: silent success yok.

### 4.3 Runtime boot (`apps/api/src/index.ts`)

- `bootstrapRuntimeEnvValidation()` — `NODE_ENV=test` değilse validate eder.
- Yerel `pnpm test` sırasında API boot edilmez; smoke:routes/navigation API’yi genelde offline veya hafif modda çalıştırır.

### 4.4 Önerilen hedef durum (sonraki hardening PR)

`security-ops-backlog-plan.md` ile hizalı:

1. `DATABASE_URL` / `POSTGRES_URL` set iken `pnpm test` → ya explicit **warn + strip** ya da documented **fail** (silent pass yok).
2. Tüm postgres-modlu testler `withEnv` veya harness sanitize kullanır.
3. `worker-domain-execution-port` `POSTGRES_URL ?? DATABASE_URL` ile hizalanır.

---

## 5. PowerShell temizlik checklist (gate öncesi)

Mevcut komutlar `local-worktree-hygiene.md` §2’de tanımlı. Bu analiz **ek bağlam** olarak aşağıdaki sırayı önerir.

### 5.1 Varlık kontrolü (değer yazdırmadan)

```powershell
@('DATABASE_URL','POSTGRES_URL','PERSISTENCE_MODE','NODE_ENV','ALLOW_DEMO_FALLBACK') | ForEach-Object {
  if (Test-Path "Env:$_") { "$_ is set" } else { "$_ is unset" }
}
```

### 5.2 Temiz oturum (API test / gate öncesi)

```powershell
Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue
Remove-Item Env:POSTGRES_URL -ErrorAction SilentlyContinue
Remove-Item Env:PERSISTENCE_MODE -ErrorAction SilentlyContinue
Remove-Item Env:ALLOW_DEMO_FALLBACK -ErrorAction SilentlyContinue
```

### 5.3 Yerel postgres bilinçli kullanım

Docker / yerel Postgres için **yeni terminal** veya profil-scoped env:

```powershell
$env:PERSISTENCE_MODE = "postgres"
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/hallederizcrm"
# POSTGRES_URL ile çift set etmeyin; tek kanonik URL yeterli
```

### 5.4 Gate komutları (sıra)

```powershell
cd c:\HallederizCRM-PREMIUM-CURSOR
pnpm smoke:navigation
pnpm smoke:routes
pnpm test
pnpm lint
pnpm security:audit
pnpm security:audit:report
```

`scripts/windows-clean-dev.ps1` build cache temizler; **shell env temizlemez** — checklist ile birlikte kullanılmalı.

---

## 6. Script guard vs yalnızca dokümantasyon

| Yaklaşım | Artı | Eksi |
|----------|------|------|
| **Docs + checklist (şimdi)** | Sıfır runtime riski; onboarding hızlı | Disiplin gerektirir; ihlal otomatik yakalanmaz |
| **Test runner guard** (`run-tests.cjs` env strip/warn) | `pnpm test` deterministik | Yanlış strip bilinçli postgres testini kırabilir |
| **Pre-test script** (`pnpm test:api:clean` wrapper) | Opt-in / opt-out net | `package.json` değişikliği gerekir |
| **CI only guard** | Main koruması | Yerel drift devam eder |

**Karar (bu analiz):**

- Bu PR: **docs only** — checklist ve risk envanteri yeterli.
- Sonraki PR (`hardening/dev-env-database-url-sanitize`): test runner’da `NODE_ENV=test` zorlama + isteğe bağlı env sanitize veya pollution algılandığında stderr uyarısı.
- `package.json`’a yeni script **bu analiz kapsamında gerekli değil**.

---

## 7. `package.json` değişikliği gerekli mi?

**Hayır** — analiz ve hijyen PR’sı için:

- Mevcut `test` → `test:api` → `apps/api/scripts/run-tests.cjs` zinciri yeterli referans.
- `ci:postgres-*-smoke` zaten ayrı script; kök `pnpm test` bunları çağırmaz.
- Guard eklenirse ayrı hardening PR’da `test:api` veya `run-tests.cjs` hedeflenmeli; bu belgede zorunlu değil.

---

## 8. Açık riskler ve takip işleri

| ID | Risk | Önem | Takip |
|----|------|------|-------|
| R1 | Kabuk `DATABASE_URL` + `PERSISTENCE_MODE=postgres` → uzak DB bağlantısı | Yüksek | Checklist + sonraki sanitize PR |
| R2 | `POSTGRES_URL` / `DATABASE_URL` öncelik tutarsızlığı (worker port) | Orta | `worker-domain-execution-port.ts` hizalama PR |
| R3 | `run-tests.cjs` `NODE_ENV=test` set etmez | Orta | Test runner hardening |
| R4 | `withEnv` kullanmayan testler | Düşük-Orta | Audit + lint kuralı (isteğe bağlı) |
| R5 | Staging URL’nin kullanıcı profil env’sinde kalması | Yüksek | Eğitim + checklist; secret manager disiplini |

---

## 9. Önerilen PR sırası (backlog referansı)

1. **Bu PR** — `docs/development/database-url-pollution-analysis.md` (analiz)
2. `hardening/dev-env-database-url-sanitize` — runner guard, worker URL hizalama
3. Mevcut `local-worktree-hygiene.md` — bu belgeye çapraz link (isteğe bağlı küçük docs PR)

---

## 10. Final karar

**DATABASE_URL_POLLUTION_ANALYSIS_READY**

Gerekçe:

- Okuma noktaları, senaryolar ve fail/skip matrisi dokümante edildi.
- PowerShell checklist mevcut rehberle uyumlu ve genişletildi.
- Script guard ve `package.json` değişikliği **ertelendi**; bilinçli olarak sonraki hardening PR’a bırakıldı.
- Bu PR runtime davranışı değiştirmez; bloklayıcı teknik engel yok.
