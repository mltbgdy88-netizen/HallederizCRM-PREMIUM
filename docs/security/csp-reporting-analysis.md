# P1 — CSP Reporting Analysis (Agent D)

| Alan | Değer |
|------|--------|
| Agent | D |
| Branch hedefi | `hardening/security-csp-reporting` (uygulama PR; bu doküman `analysis/p1-csp-reporting`) |
| Kapsam | Docs-only analiz; runtime davranış değişikliği yok |
| Kaynak backlog | `docs/operations/security-ops-backlog-plan.md` §2 (P1) |
| Tarih | 2026-06-18 |

---

## Executive summary

HallederizCRM web katmanında CSP yalnızca `apps/web/middleware.ts` içinde set ediliyor. **`report-uri` ve `report-to` directive'leri yok**; `Reporting-Endpoints` header'ı yok; API'de CSP rapor toplayıcı endpoint yok. Güvenlik görünürlüğü açısından P1 backlog maddesi **uygulanmaya hazır**; collector hedefi ve PII/retention kararları netleştirildikten sonra küçük, izole bir hardening PR ile kapatılabilir.

**Verdict:** `CSP_REPORTING_ANALYSIS_READY`

---

## 1. Mevcut durum — CSP nerede tanımlı?

### 1.1 Birincil kaynak: Next.js middleware

Dosya: `apps/web/middleware.ts` — `applySecurityHeaders()` tüm eşleşen yanıtlara şu header'ları ekler:

| Header | Değer / not |
|--------|-------------|
| `Content-Security-Policy` | `default-src 'self'`; `script-src` içinde `'unsafe-inline'` ve `'unsafe-eval'`; `connect-src` dev için `localhost`/`127.0.0.1` ve WebSocket; `frame-ancestors 'none'` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `Strict-Transport-Security` | Yalnızca `NODE_ENV === "production"` |

**Eksik:** `report-uri`, `report-to`, `Reporting-Endpoints`.

Matcher: `/(?!_next/static|_next/image|favicon.ico).*)` — auth redirect ve güvenlik header'ları çoğu uygulama rotasına uygulanır.

### 1.2 İkincil kaynak: `next.config.mjs`

Dosya: `apps/web/next.config.mjs` — `headers()` ile yalnızca X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy döner. **CSP burada yok.** Middleware ile çakışma riski düşük (CSP yalnızca middleware'de).

### 1.3 API ve altyapı

- `apps/api/**`: CSP, `report-uri`, `report-to` veya CSP collector route **yok** (grep doğrulandı).
- Reverse proxy / nginx / Docker header override: repoda CSP tanımı **yok**; production'da platform katmanı ayrıca header ekliyorsa çift CSP riski deploy sırasında doğrulanmalı.
- `docs/product/PRODUCTION_ENV_CHECKLIST.md`: "Rate limit / security headers | Enabled | Per platform" — CSP reporting spesifik değil.

### 1.4 Kapsam boşlukları (uygulama PR'da ele alınmalı)

1. **Statik asset bypass:** `pathname.startsWith("/_next")` veya dosya uzantılı path'ler `applySecurityHeaders` olmadan `NextResponse.next()` döner — CSP bu yanıtlara uygulanmaz.
2. **Çift header kaynağı:** Middleware CSP + `next.config` diğer güvenlik header'ları — ileride tek helper'da birleştirmek bakımı kolaylaştırır (bu analiz kapsamı dışı, opsiyonel refactor).

---

## 2. `report-uri` / `report-to` mevcut mu?

| Directive / header | Durum |
|--------------------|--------|
| `report-uri` | **Yok** |
| `report-to` | **Yok** |
| `Reporting-Endpoints` | **Yok** |

Repo genelinde (kod + docs) yalnızca `docs/operations/security-ops-backlog-plan.md` backlog maddesi olarak referans var.

### Tarayıcı uyumluluk notu

- **`report-uri` (legacy):** Eski tarayıcılar; `POST` + `Content-Type: application/csp-report`; deprecated ama hâlâ yaygın fallback.
- **`report-to` + Reporting API:** Modern Chromium; `Reporting-Endpoints` header ile endpoint grubu tanımlanır; gövde `application/reports+json`.
- **Öneri:** Uygulama PR'da **ikisini birlikte** hedeflemek (aynı collector URL, farklı content-type handler) — backlog planı ile uyumlu.

---

## 3. Collector: internal vs external

### 3.1 Karar matrisi

| Seçenek | Artı | Eksi |
|---------|------|------|
| **Internal (API endpoint)** | Mevcut Fastify stack; `rate-limit.ts` genişletilebilir; log pipeline'a doğrudan yazım; tenant/auth gerekmez | Origin guard, CORS, noise/abuse yönetimi gerekir |
| **External (Sentry / Datadog / CDN)** | Hazır alerting, retention, dashboard | Ek maliyet; CSP report formatı için SDK veya custom ingress; secret/config yönetimi |
| **Platform log drain only** | Sıfır uygulama kodu | CSP violation'ları otomatik gelmez; header'da report URL yine gerekir |

### 3.2 Önerilen hedef (smallest safe)

**Phase 1 — internal collector** (`apps/api`), harici servis Phase 2 opsiyonel forward.

Gerekçe:

1. Repoda hazır **in-memory route rate limit** (`apps/api/src/shared/rate-limit.ts`) ve test örneği (`sec-1-hardening.test.ts`) var.
2. WhatsApp webhook deseni: kimlik doğrulamasız POST + `origin-guard` istisnası (`ORIGIN_EXEMPT_PREFIXES`) — CSP collector benzer istisna gerektirir.
3. Tenant bağlamı **uygulanmamalı**: CSP raporları tarayıcıdan, oturumdan bağımsız gelir; tenantId çıkarmaya çalışmak PII ve yanlış sınıflandırma riski taşır.
4. Harici Sentry/Datadog entegrasyonu backlog'ta "observability noktası" olarak açık; internal collector + structured log ile başlamak en küçük güvenli adım.

Önerilen endpoint: `POST /security/csp-report` (isim sabit; backlog PR adı `hardening/security-csp-reporting`).

---

## 4. Rate limit, PII redaction, retention

### 4.1 Rate limiting

Mevcut `registerApiRateLimits`: 60 req / 60s / IP+path, rotalar: `/auth/login`, `/whatsapp/webhook`, `/imports`, `/quick-operations/submit`.

CSP collector için öneri:

| Parametre | Önerilen değer | Gerekçe |
|-----------|----------------|---------|
| Pencere | 60s | Mevcut pattern ile tutarlı |
| Limit | 120–300 / IP / dakika | Tek sayfada çoklu ihlal veya extension noise |
| Yanıt | `204 No Content` veya `200 { ok: true }` | Tarayıcı retry davranışını tetiklememek için hafif 2xx |
| Aşım | `429` + mevcut Türkçe mesaj | `sec-1-hardening` ile aynı contract |

Ek: global cap (ör. process başına dakikada 10k) log flood'a karşı opsiyonel.

### 4.2 PII redaction (collector içinde zorunlu)

CSP payload'larında tipik hassas alanlar:

| Alan | Risk | Redaksiyon |
|------|------|------------|
| `document-uri` | Query string'te `next`, token, session | Origin + path only; query strip |
| `blocked-uri` | Üçüncü taraf URL'ler | Host + path truncate (ör. 512 char) |
| `source-file` | Uygulama yapısı sızıntısı | Bundle path'e izin; kullanıcı girdisi şüpheli segmentleri `[redacted]` |
| `script-sample` | Sayfa içeriği / XSS kanıtı | **Loglama dışı** veya hash-only (varsayılan: drop) |
| `referrer` | İç URL sızıntısı | Query strip |
| `body` (ham) | Tam sayfa içeriği | Saklama; yalnızca normalize edilmiş özet |

Fail-closed: redaksiyon hatasında ham body persist etme; yalnızca `violated-directive`, `effective-directive`, `disposition`, timestamp.

### 4.3 Retention ve alerting

| Katman | Öneri |
|--------|--------|
| Uygulama | DB tablosu **yok** (Phase 1); structured log (`server.log.info` / JSON line) |
| Saklama | Log platform retention: **30 gün** (security incident triage); ops sign-off ile 90 gün |
| Alerting | Dakikada N+ aynı `violated-directive` + `document-uri` path → warn; Sentry/Datadog forward Phase 2 |
| Audit timeline | Tenant-scoped `recordAuditEvent` **kullanma** — global security signal |

---

## 5. En küçük güvenli uygulama PR planı

PR adı: `hardening/security-csp-reporting` (backlog ile uyumlu).

### PR-1a — Collector (API)

| Dosya | Değişiklik |
|-------|------------|
| `apps/api/src/security/csp-report-routes.ts` (yeni) | `POST /security/csp-report`; `application/csp-report` ve `application/reports+json` parse; redaction; 204 |
| `apps/api/src/shared/rate-limit.ts` | `/security/csp-report` route ekle; limit tunable env (opsiyonel) |
| `apps/api/src/shared/origin-guard.ts` | `ORIGIN_EXEMPT_PREFIXES` veya CSP-specific: rapor POST'larına izin (tarayıcı Origin = app origin) |
| `apps/api/src/index.ts` | Route register |
| `apps/api/src/tests/csp-report.test.ts` (yeni) | Örnek payload → 2xx; redaction assert; rate limit 429 |

Auth: **yok** (tarayıcı raporu). Tenant header: **yok**.

### PR-1b — CSP directive'ler (Web)

| Dosya | Değişiklik |
|-------|------------|
| `apps/web/middleware.ts` | `report-uri` + `report-to` ekle; `Reporting-Endpoints` header; URL = `NEXT_PUBLIC_API_BASE_URL` veya türetilmiş absolute URL |
| `apps/web/middleware.ts` (opsiyonel aynı PR) | `/_next` statik yanıtlara en azından CSP (reporting dahil) — ayrı commit tercih edilebilir |

Env:

- `NEXT_PUBLIC_API_BASE_URL` (mevcut) — collector absolute URL üretimi.
- Opsiyonel feature flag: `CSP_REPORTING_ENABLED=true` (staging önce).

### PR-1c — Kanıt ve docs

| Dosya | Değişiklik |
|-------|------------|
| `docs/operations/security-ops-backlog-plan.md` | Madde 2'ye "implemented by PR-xxx" link (uygulama sonrası) |
| `docs/product/PRODUCTION_ENV_CHECKLIST.md` | CSP reporting satırı |

### Test planı (uygulama PR)

```text
pnpm --filter @hallederiz/api test  # csp-report + rate limit
pnpm --filter @hallederiz/web typecheck
pnpm smoke:routes
pnpm smoke:navigation
pnpm lint
pnpm test
pnpm security:audit
pnpm security:audit:report
```

Manuel: DevTools → Security / Console ile kasıtlı inline script ihlali; Network'te `csp-report` POST doğrulama.

### Rollback

1. Middleware'den `report-uri` / `report-to` / `Reporting-Endpoints` kaldır (anında rapor kesilir).
2. API route unregister veya `CSP_REPORTING_ENABLED=false`.
3. DB yok — ek rollback gerekmez.

### Bağımlılıklar / önkoşullar

- [x] CSP tanım yeri tespit edildi (middleware).
- [ ] Production'da platform ek CSP header'ı olup olmadığı ops doğrulaması (çift policy riski).
- [ ] Log drain / retention 30g ops onayı.
- [ ] Collector URL'nin production'da HTTPS ve API ile aynı site veya CORS-safe olması.

---

## 6. Riskler

| Risk | Şiddet | Azaltma |
|------|--------|---------|
| Rapor flood / DoS | Orta | Rate limit + 204 hafif yanıt + opsiyonel global cap |
| PII / token sızıntısı (document-uri query) | Yüksek | Zorunlu query strip; script-sample drop |
| Origin guard 403 | Yüksek | Collector için exempt path + integration test |
| Çift CSP (CDN + middleware) | Orta | Deploy checklist; tek kaynak politikası |
| `unsafe-inline` / `unsafe-eval` gürültü | Düşük | Alert'leri directive + path bazlı grupla; CSP sıkılaştırma ayrı initiative |
| `report-uri` deprecation | Düşük | `report-to` birlikte; collector her iki content-type |
| In-memory rate limit (multi-instance) | Orta | Phase 2 Redis/shared limit; Phase 1 tek instance / düşük traffic kabul |

---

## 7. Mojibake kontrolü

Bu dosyadaki Türkçe karakterler (ğ, ü, ş, ı, ö, ç, İ) UTF-8 kaynak olarak yazıldı; `Lütfen`, `görünürlüğü`, `işlem`, `şema` vb. doğrulanmalı — commit öncesi `git diff` ile bozuk `Ã` / `Ä` dizileri aranmalı.

---

## 8. Sonuç

| Soru | Cevap |
|------|--------|
| CSP nerede? | `apps/web/middleware.ts` (`applySecurityHeaders`) |
| `report-uri` / `report-to`? | **Hayır** |
| Collector? | **Yok**; öneri: internal `POST /security/csp-report` |
| Rate limit altyapısı? | Var; genişletilebilir |
| PII / retention? | Tanımlı değil; yukarıdaki redaction + 30g log önerisi |
| Uygulama PR hazır mı? | **Evet** — `CSP_REPORTING_ANALYSIS_READY` |

**Engelleyici (BLOCKED) koşul yok**; yalnızca production platform CSP çakışması ve log retention ops onayı uygulama öncesi doğrulanmalı.
