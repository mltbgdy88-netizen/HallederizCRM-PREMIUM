---
title: QOP Runtime Smoke (Idempotency) Plan
owner: SEC-3C / AUDIT-FIX-4B
status: draft
last_updated: 2026-06-16
---

## Amaç

CI ve staging ortamlarında **Quick Operation (QOP) submit** akışının Postgres persistence üzerinde:

- **Auth guard** (401/403),
- **Idempotency** (missing key / replay / conflict),
- **Gerçek DB side-effect kanıtı** (idempotency tablosu + en az bir domain kaydı)

üretebildiğini doğrulayan, deterministik ve düşük maliyetli bir runtime smoke planı tanımlamak.

Bu doküman **docs-only** bir tasarım/uygulama planıdır; bu aşamada `scripts/ci/postgres-runtime-smoke.cjs` veya API kodu değiştirilmez.

---

## 1) Route / SDK / API path (kanıt)

### API endpoint’leri

- **Preview**: `POST /quick-operations/preview`
- **Submit**: `POST /quick-operations/submit`

### Auth + permission guard

Her iki endpoint de guard’lıdır:

- `assertAuthenticated`
- `assertAnyPermission(["orders.write", "offers.write", "payments.write"])`

### Idempotency contract (submit)

`POST /quick-operations/submit` için:

- **Header zorunlu**: `Idempotency-Key` (header adı: `idempotency-key`)
- **Eksik header** → `400` + `reason: "idempotency_key_required"`
- **Aynı key, farklı body** → `409` + `reason: "idempotency_key_conflict"`
- **Replay (aynı key + aynı body)** → `200` + daha önce store edilen response body (replay)

Scope:

- `quick-operations.submit`

### SDK client çağrısı

- SDK: `packages/sdk/src/clients/quick-operations.client.ts`
- `submitQuickOperation(payload, { idempotencyKey })` → `POST /quick-operations/submit` + `idempotency-key` header’ı.

---

## 2) CI’de DB-backed idempotency replay/conflict smoke akışı (tasarım)

Hedef: CI’de Postgres üzerinde çalışan API’ya karşı **aynı idempotency-key ile replay**, **farklı body ile conflict** üretmek ve DB’de **idempotency_records** artışı + domain kaydı kanıtlamak.

### Test seçimi: `operationType = "offer"`

Sebep:

- `offer` submit path’i “executed” modda DB’ye gerçek kayıt yazabilen en düşük bağımlılıklı opsiyon.
- `delivery` / `return` bazı koşullarda `foundation_blocked` üretebilir; `payment` ve `sale_order` daha fazla yan-etki/bağımlılık taşıyabilir.

### Örnek payload (minimum anlamlı)

- `customerId`: smoke içinde seed edilen bir CI customer (örn. `customer_ci_1`)
- `lines`: en az 1 satır, `quantity > 0`, `unitPrice > 0`, `lineTotal` uyumlu

Örnek:

```json
{
  "operationType": "offer",
  "customerId": "customer_ci_1",
  "customerName": "CI QOP Cari",
  "note": "CI runtime smoke: QOP offer",
  "lines": [
    {
      "id": "qop_line_1",
      "productCode": "CI-PROD-001",
      "productName": "CI Ürün",
      "quantity": 2,
      "unitPrice": 100,
      "taxRate": 20,
      "discountRate": 0,
      "sourceType": "center_warehouse",
      "lineTotal": 240
    }
  ]
}
```

Not: `lineTotal` basit doğrulama için \(quantity * unitPrice * (1 + taxRate/100)\) şeklinde tutuldu.

### Header seti (runtime smoke için)

- `content-type: application/json`
- `authorization: Bearer <token>` (login’den gelen access token)
- `x-session-token: <token>` (runtime smoke standardı)
- `origin: <allowedOrigin>` (CORS/origin guard için)
- `idempotency-key: <stable_or_unique_key>`

### Beklenen response (1. çağrı: first submit)

Başarı beklentisi:

- Status: `200` (route `{ item }` zarfı döndürüyor; API bazında 200 beklenir)
- Body: `{ item: QuickOperationSubmitResponse }`
- `item.operationType = "offer"`
- `item.ok = true`
- `item.mode = "executed"` (policy approval tetiklenmezse)
- `item.createdEntityType = "offer"`
- `item.createdEntityId` ve `item.createdEntityNo` dolu
- `item.auditEventIds` içinde en az 1 id (route `recordAuditEvent` ekler)

Alternatif (approval policy gerektirirse):

- `item.mode = "queued_for_approval"`
- `item.approvalId` dolu
- Bu durumda domain kaydı “offer” oluşmayabilir; yine de idempotency + audit kanıtı alınmalıdır.

### Beklenen response (2. çağrı: replay)

Aynı payload + aynı `idempotency-key` ile:

- Status: **ilk çağrı ile aynı** (pratikte `200`)
- Response body fingerprint: **ilk çağrı ile aynı**
- DB side-effect: **ekstra domain kayıt yok**, idempotency kayıt sayısı **artmaz**.

### Beklenen response (3. çağrı: conflict)

Aynı `idempotency-key` ile farklı body (örn. `quantity` veya `unitPrice` değiştir):

- Status: `409`
- Body: `{ reason: "idempotency_key_conflict" }` (message da döner)
- DB side-effect: idempotency replay yok; **yeni store yapılmaz**.

### Eksik key (negatif)

`idempotency-key` olmadan submit:

- Status: `400`
- Body: `{ reason: "idempotency_key_required" }`

---

## 3) Beklenen persistence kanıtları (DB side-effects)

Smoke’ın “demo/mock success” olmadığını kanıtlamak için iki ayrı DB kanıtı hedeflenmeli.

### A) Idempotency tablosu artışı

- Tablo: `idempotency_records`
- Scope: `quick-operations.submit`
- Beklenti:
  - first submit sonrası `COUNT(*) WHERE scope = 'quick-operations.submit'` artar
  - replay ve conflict sonrası count değişmez

### B) Domain/audit kanıtı

Minimum:

- `quick-operations.submit` audit event (API route `recordAuditEvent` ile response’a `auditEventIds` ekler)

Tercihen ayrıca:

- Offer create (mode executed) → offers tablosunda yeni satır / `createdEntityId` mevcut

Not: DB tablo isimleri repo içindeki persistence katmanına bağlıdır; smoke akışı DB’de **en az bir gerçek entity** ve **idempotency record** kanıtı üretmelidir.

---

## 4) Gerekli env değişkenleri (CI/Staging)

Bu plan, mevcut `SEC-3C` runtime smoke desenini takip eder (bkz. `scripts/ci/postgres-runtime-smoke.cjs`).

### Zorunlu (CI runtime smoke)

- **DB**
  - `DATABASE_URL` **veya** (`PGUSER`, `PGPASSWORD`, `PGDATABASE`, opsiyonel `PGHOST`, `PGPORT`)
  - `PERSISTENCE_MODE=postgres`
- **Auth seed**
  - `AUTH_SEED_ADMIN_EMAIL`
  - `AUTH_SEED_ADMIN_PASSWORD`
  - opsiyonel: `AUTH_SEED_TENANT_SLUG` (default `hallederiz`)
- **Session/security**
  - `AUTH_SESSION_SECRET` (yoksa smoke içinde default atanabiliyor; prod/staging’de secret olmalı)
- **Origin / CORS**
  - `WEB_URL` (allowed origin; default `https://app.example.com`)
  - `API_CORS_ORIGINS` (API tarafında allowed origin listesi)
- **API boot**
  - `PORT_API` (default `4010`)
  - `NODE_ENV` (test/prod-parity; smoke default `test`)
- **Kill-switch**
  - `DEMO_AUTH_ENABLED=false`
  - `ALLOW_DEMO_FALLBACK=false`

### Staging parity (runbook referansı)

Staging için ek env’ler ve kill-switch listesi: `docs/operations/sec-3b-staging-runtime-runbook.md`.

---

## 5) Gelecek PR için uygulama checklist’i (docs → code)

Bu doküman sadece plan üretir. Gelecek PR’da hedef, `postgres-runtime-smoke` job’una QOP submit idempotency kanıtını eklemek.

### A) Runtime smoke script güncellemesi (gelecek PR)

- [ ] `scripts/ci/postgres-runtime-smoke.cjs` içine QOP submit smoke adımları ekle:
  - [ ] missing key → 400 `idempotency_key_required`
  - [ ] first submit → 200 + response fingerprint kaydı
  - [ ] replay → aynı status + aynı fingerprint
  - [ ] conflict → 409 `idempotency_key_conflict`
- [ ] DB kanıtı:
  - [ ] `idempotency_records` count check (`scope = 'quick-operations.submit'`)
  - [ ] (tercihen) created offer/order/payment tablosunda row kanıtı veya response’daki `createdEntityId` ile read-back
- [ ] Seed ihtiyacı:
  - [ ] CI customer seed (mevcut `ensureCiCustomer` desenini QOP için de kullan veya ortaklaştır)
  - [ ] (gerekirse) ürün seed / line validation’ı için minimal product kayıtları

### B) CI workflow güncellemesi (gelecek PR)

- [ ] `.github/workflows/postgres-runtime-smoke.yml` içinde mevcut job’a QOP kontrolünün eklendiğini doğrula (job adı değişmeden).
- [ ] Fail-closed: demo fallback / demo auth açıksa job fail olmalı.

### C) Tip/test referansları

- [ ] API route davranışı: `apps/api/src/quick-operations/routes.ts`
- [ ] Idempotency store: `apps/api/src/shared/idempotency-store.ts`
- [ ] QOP submit tests: `apps/api/src/tests/quick-operations.test.ts`
- [ ] Idempotency ops tests: `apps/api/src/tests/sec-3a-idempotency-ops.test.ts`

---

## 6) Beklenen CI çıktısı (PASS kriteri)

- API `/health` → 200 `{ status: "ok" }`
- Auth login → 200 + token
- QOP submit:
  - missing key → 400 `idempotency_key_required`
  - replay → aynı response
  - conflict → 409 `idempotency_key_conflict`
- DB kanıtı:
  - `idempotency_records` artışı `scope='quick-operations.submit'`
  - (tercihen) created entity kanıtı (offer)

