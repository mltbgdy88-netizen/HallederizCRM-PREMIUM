# AUDIT-FIX-7A — Ops/Security Backlog Plan (Docs-only)

Bu doküman, AUDIT-FIX-7A kapsamında kapanması hedeflenen ops/security backlog kalemleri için **PR bazlı** planı içerir. Kapsam **docs-only plan**; bu PR hiçbir kod/workflow değişikliği içermez.

---

## Hedefler ve çalışma prensipleri

- Production güvenliği: **fail-closed**, tenant isolation, idempotency ve CSP raporlama kanıtı.
- Değişiklikler küçük ve izole PR’lara bölünür; her PR tek risk alanını hedefler.
- Her PR için: risk, beklenen dosya kapsamı, test planı, rollback, bağımlılıklar net yazılır.

---

## Top priorities (önerilen sıralama)

1. **P0 — Production cron/scheduler idempotency cleanup**
2. **P0 — Payment cross-tenant integration test expansion**
3. **P1 — Developer env `DATABASE_URL` pollution**
4. **P1 — CSP `report-uri`/`report-to` reporting**
5. **P2 — `migrate:list` CLI dist mismatch**

---

## Backlog items

### 1) Production cron/scheduler idempotency cleanup (P0)

#### Risk

- **Çift çalıştırma (duplicate execution)**: scheduler/cron job aynı tenant/scope için tekrar tetiklenirse finansal/operasyonel kayıtların iki kez işlenmesi riski.
- **Kısmi başarısızlık**: job adımı ortasında crash → retry → idempotent değilse tekrarlı yazım / tutarsız timeline.
- **Gözlemlenebilirlik**: idempotency kayıtları ve cleanup stratejisi yoksa incident triage zorlaşır.

#### Expected file scope (hedeflenen)

- `apps/worker/**` (scheduler/job runner, retry semantics)
- `apps/api/**` (job tetikleme endpoint/dispatcher varsa)
- `packages/domain/**` (idempotency policy/registry, scope naming)
- `packages/database/**` (idempotency_records kullanım/TTL/cleanup; gerekiyorsa migration)
- `docs/operations/**` (runbook güncellemesi; kanıt çıktıları)

> Not: Bu plan yalnızca kapsamı tarif eder; gerçek PR’da minimal dosya temas hedeflenmelidir.

#### PR name

- `fix/ops-idempotency-cron-cleanup`

#### Test plan

- **Unit/contract**: idempotency key zorunluluğu, conflict, replay senaryoları.
- **Integration**: aynı job payload ile iki kez koşum → aynı sonuç, ikinci koşumda write yok / safe no-op.
- **Smoke**: `pnpm smoke:routes`, `pnpm smoke:navigation` (job tetikleme UI/route etkisi varsa).
- **Security**: `pnpm security:audit`, `pnpm security:audit:report`.
- **Prod-parity** (staging): Postgres + worker durable modda job replay testi.

#### Rollback plan

- **Uygulama rollback**: worker/api image önceki sürüme döndür.
- **DB rollback yok**: migration eklendiyse geri dönüş snapshot restore veya forward-fix migration.
- **Feature flag** (varsa): idempotency cleanup davranışı runtime flag ile kapatılabilir (fail-closed korunacak şekilde).

#### Dependencies

- `idempotency_records` şeması ve mevcut idempotency contract’ları (SEC-3B/SEC-3C çizgisi).
- Scheduler/worker job naming standardı (scope/tenant + key üretimi).
- Eğer TTL/cleanup cron’u eklenecekse: retention kararları (ops sign-off).

---

### 2) CSP `report-uri` / `report-to` (P1)

#### Risk

- **Güvenlik görünürlüğü kaybı**: CSP ihlalleri (XSS, yanlış third-party) raporlanmazsa incident tespiti gecikir.
- **Yanlış konfig**: report endpoint yanlışsa noise / data leak (raporların yanlış yere gitmesi) riski.
- **Uyumluluk**: modern tarayıcılarda `report-to`/Reporting API; eski davranışlarda `report-uri` farklı çalışır.

#### Expected file scope (hedeflenen)

- `apps/web/**` (CSP header/meta; Next config veya middleware)
- `apps/api/**` (CSP report endpoint (collector) gerekiyorsa; rate limit + auth/tenant kararları)
- `docs/operations/**` (CSP raporlarının toplanması, retention, alerting)
- Gerekirse: `.github/workflows/**` **değil** (audit-fix-7a kapsamında mümkünse ops tooling ayrı PR)

#### PR name

- `hardening/security-csp-reporting`

#### Test plan

- **Header assertions**: CSP header içinde `report-uri` ve/veya `report-to` doğru set.
- **Collector** (varsa): örnek CSP report payload POST → 2xx + rate-limit doğrulama.
- **Regression**: `pnpm lint`, `pnpm test`, `pnpm smoke:routes`.

#### Rollback plan

- CSP reporting directive’lerini kaldır (en hızlı).
- Collector endpoint eklendiyse route disable (feature flag / config) + traffic drop.

#### Dependencies

- Production’da kullanılacak report collector hedefi:
  - internal endpoint mi (API içinde) yoksa harici servis mi?
- Rate limiting + PII redaction kararları.
- Observability: Sentry/Datadog/Log pipeline entegrasyon noktası.

---

### 3) `migrate:list` CLI dist mismatch (P2)

#### Risk

- **Operasyonel sürpriz**: staging/prod ortamında `migrate:list` fail ederse deploy checklist bozulur; yanlış alarm üretir.
- **Güven**: migration toolchain “yarım çalışıyor” algısı.

#### Expected file scope (hedeflenen)

- `packages/database/**` (CLI implementation, path resolution)
- `apps/api/**` (migration runner kullanan yerler; sadece gerekirse)
- `docs/operations/**` (runbook komutları doğrulanır)

#### PR name

- `fix/db-migrate-list-dist-path`

#### Test plan

- **CLI tests**: build edilmiş ortamda `migrate:list` çalışır ve registry ile tutarlı liste döner.
- **Smoke**: `pnpm smoke:routes` (deploy scriptleri etkileniyorsa).
- **Regression**: `pnpm test`, `pnpm lint`.

#### Rollback plan

- `migrate:list` için önceki davranışa dönüş (script revert).
- Runbook’ta geçici workaround: `migrate:status` kullanımı (en azından deploy gate korunur).

#### Dependencies

- Monorepo build çıktısı standardı (dist layout).
- Migration registry’nin canonical kaynak olarak kabul edilmesi (tek truth).

---

### 4) Payment cross-tenant integration test expansion (P0)

#### Risk

- **Kritik: tenant isolation ihlali**: payment/tahsilat akışında cross-tenant read/write olursa veri sızıntısı ve finansal zarar.
- **Gizli regresyon**: küçük refactor’lar cross-tenant guard’ı kırabilir; test yoksa fark edilmez.

#### Expected file scope (hedeflenen)

- `apps/api/**` (payment endpoints + guards)
- `packages/domain/**` (policy/permission names; isolation helpers)
- `packages/database/**` (query scopes; fixtures)
- `apps/worker/**` (payment side-effects worker ile işleniyorsa)
- `docs/development/**` veya `docs/operations/**` (test kanıtı / senaryolar)

#### PR name

- `test/security-payment-cross-tenant-guards`

#### Test plan

- **Integration test matrix**:
  - Tenant A token ile Tenant B payment record read → **403/404** (policy’ye göre fail-closed).
  - Tenant A token ile Tenant B adına create attempt (body’da tenantId spoof) → **reject**.
  - Admin role varyantları (cross-tenant yok; sadece same-tenant elevated).
- **Regression**: `pnpm test`, `pnpm lint`, `pnpm smoke:routes`.
- **Security gates**: `pnpm security:audit`, `pnpm security:audit:report`.

#### Rollback plan

- Test-only PR ise: rollback = revert test changes.
- Eğer guard/policy düzeltmesi de içerirse: uygulama rollback + incident notu; fail-closed doğrulaması.

#### Dependencies

- Test harness’in tenant seed mekanizması (en az 2 tenant).
- Auth token üretimi ve permission fixture’ları.
- Payment akışının “policy name” sözlüğü (tek kaynaktan).

---

### 5) Developer env `DATABASE_URL` pollution (P1)

#### Risk

- **False positive/negative test sonuçları**: geliştirici terminalinde set kalan `DATABASE_URL` beklenmedik şekilde postgres moduna geçirir veya yanlış DB’ye bağlar.
- **Local data leak**: yanlışlıkla prod/staging DB string’inin local testte kullanılması riski.
- **Onboarding maliyeti**: flaky testler ve “bende çalıştı” drift.

#### Expected file scope (hedeflenen)

- `docs/development/**` (env temizliği standardı; “gate öncesi” checklist)
- `package.json` scripts veya tooling (varsa) — yalnızca **gerekliyse**; tercihen minimal.
- `apps/**` test bootstrapping (env sanitize) — yalnızca **fail-closed** ihtiyacı varsa.

#### PR name

- `hardening/dev-env-database-url-sanitize`

#### Test plan

- **Script validation**: `DATABASE_URL` set iken `pnpm test` deterministic davranır (ya explicit fail ya explicit skip; silent başarı yok).
- **Smoke**: `pnpm smoke:routes`, `pnpm smoke:navigation` (env etkisi UI boot’a sızıyorsa).
- **Docs verification**: checklist komutları PowerShell’de copy/paste çalışır.

#### Rollback plan

- Sadece docs ise: revert.
- Eğer sanitize davranışı eklendiyse: flag ile kapat veya eski behavior’a revert.

#### Dependencies

- Local test profili kararı: “DB URL yoksa postgres testleri skip mi fail mi?” (quality gate hedefi).
- Prod readiness kurallarıyla çelişmeyecek şekilde env guard tasarımı.

---

## Cross-cutting notes

### PR batching (önerilen)

- PR-1: `fix/ops-idempotency-cron-cleanup` (P0)
- PR-2: `test/security-payment-cross-tenant-guards` (P0)
- PR-3: `hardening/dev-env-database-url-sanitize` (P1)
- PR-4: `hardening/security-csp-reporting` (P1)
- PR-5: `fix/db-migrate-list-dist-path` (P2)

### Kanıt/çıktı ekleme standardı

- Her PR description’da:
  - “Ne değişti / neden” (1–3 madde)
  - Risk ve blast radius
  - Test çıktısı (komutlar + PASS)
  - Rollback notu

