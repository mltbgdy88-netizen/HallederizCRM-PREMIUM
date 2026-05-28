# Codex Görev 003 — Platform Core Guard Standardizasyonu

## Amaç

Tenant / auth / permission guard zincirini tüm API route’larında ve domain servis girişlerinde **tek ve denetlenebilir** hale getirmek. Tenant dışı erişim, yetkisiz mutation ve tutarsız read guard riskini kapatmak. Ürün davranışını değiştirmeden güvenlik ve öngörülebilirlik artırmak.

## Dokunulabilecek dosyalar

- `apps/api/src/shared/auth-guards.ts`
- `apps/api/src/shared/request-context.ts`
- `apps/api/src/shared/read-guards.ts`
- `apps/api/src/**/routes.ts` (modül route kayıtları)
- `apps/api/src/modules/**/service.ts` (yalnızca context assert ekleme; iş kuralı değişikliği yok)
- `apps/api/src/tests/**` (auth, guard, tenant isolation)
- `docs/architecture/TENANT_AUTH_PERMISSION_MAP.md` (güncelleme)

## Dokunulmaması gereken dosyalar

- `apps/web/**` (UI refactor yok)
- `packages/database/**` migration ve şema
- `apps/worker/**` (ayrı görev)
- `apps/local-ai-service/**`, `apps/ai-service/**` (AI runtime davranışı)
- `.env*`, auth secret dosyaları
- Onay policy matrisi ve execution dispatcher **semantiği** (yalnızca guard eksikliği kapatılır)

## Korunacak mevcut davranışlar

- `buildRequestContext` tenant mismatch → 403
- Production/postgres: demo auth, mock token, header principal fallback kapalı
- Public endpoint listesi (`004-api-read-guards.md`): health, login, webhook verify
- Mevcut permission key string’leri (response 403/401 semantiği)
- AI proposal-only; onaysız execution yok
- WhatsApp webhook signature / idempotency / token hash
- Audit `recordAuditEvent` çağrıları silinmez

## Implementation adımları

1. Tüm `apps/api` route dosyalarını envanterle; `withGuards` / `requireReadAccess` kullanımını tabloya işle.
2. Guard’sız hassas GET/POST/PATCH/DELETE endpoint’lerine standart guard ekle.
3. Route içinde `tenantId` body/query’den alınıyorsa `assertTenantAccess(context, tenantId)` ekle.
4. Ortak helper: authenticated + permission + opsiyonel `assertTenantAccess` birleşimi (tekrarı azalt).
5. Domain servis public API’lerinde `tenantId` parametresinin context ile eşleştiğini doğrula (throw `ForbiddenError`).
6. Regresyon testleri: en az bir allow + bir deny per kritik modül (customers, orders, approvals, integrations webhook hariç).
7. `TENANT_AUTH_PERMISSION_MAP.md` “mevcut davranış” sütununu güncelle.

## Test komutları

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm smoke:routes
pnpm smoke:navigation
```

İlgiliyse: `apps/api/src/tests/auth-hardening.test.ts`, yeni guard matrix test dosyası.

## Kabul kriterleri

- Hassas veri dönen veya mutation yapan endpoint’lerde `assertAuthenticated` + uygun permission guard **%100** (public liste istisnası dokümante).
- `tenant_mismatch` ve `permission_missing` testlerle kanıtlanır.
- Mevcut API response shape ve happy-path iş kuralları değişmez (yalnızca yetkisiz çağrılar 401/403 alır).
- CI quality gate yeşil.
- Gap raporu 003 maddesi “kısmen/tamamlandı” notu ile güncellenir.

## Geri alma notu

Guard eklemeleri route bazında revert edilebilir. Toplu helper değişikliği tek commit’te tutulmalı. Production’da beklenmedik 403 artışında ilgili route guard’ı geçici daraltılmaz; permission mapping düzeltilir.

## Rapor formatı (Codex çıktısı)

1. Route envanter tablosu (dosya, method, path, guard durumu)  
2. Eklenen/değişen dosyalar  
3. Test sonuçları  
4. Bilinen istisnalar (public endpoint)  
5. Kalan riskler ve önerilen 004 görevi  

## Referans

- `docs/architecture/PLATFORM_CORE_ARCHITECTURE.md`
- `docs/architecture/PERMISSION_KEY_STANDARD.md`
- `docs/development/CODEX_TASK_STANDARD.md`
- `.cursor/rules/02-tenant-auth-permission.mdc`
