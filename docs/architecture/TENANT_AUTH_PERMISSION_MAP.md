# Tenant / Auth / Permission Map

Mevcut repo ile hedef platform çekirdeği arasındaki akış haritası. **Mevcut davranış** kod incelemesine dayanır; **hedef** `PLATFORM_CORE_ARCHITECTURE.md` ile uyumludur.

| Alan | Mevcut dosya/katman | Mevcut davranış | Eksik / risk | Hedef davranış | Test ihtiyacı |
|------|---------------------|-----------------|--------------|----------------|---------------|
| Login | `platform-core/routes/auth-routes.ts`, `session-store.ts`, `database-auth.ts` | Demo / postgres / local pilot dalları; DB auth scrypt | Token imzasız; session bellekte | Postgres + server session; prod’da tek yol | Login success/fail/inactive/503 |
| Session doğrulama | `auth-routes.ts` GET session, `request-context.ts` | Token → session veya mock principal | Expired session edge | Her istekte geçerli session | Session invalid → 401 |
| Tenant seçimi | Login `tenantSlug`; session `tenant.id` | Slug → tenant çözümü | Çok tenant UI seçimi sınırlı | Kullanıcı yetkili tenant listesi | Yanlış slug → 401 |
| Tenant mismatch guard | `request-context.ts`, `assertAuthenticated` | Header tenant ≠ session → `tenant_mismatch` | Tüm route’larda explicit `assertTenantAccess` yok | Body/path tenantId session ile eşleşmeli | Mismatch → 403 |
| Role lookup | `session-store`, `mock-data`, DB `users.role` | Demo: mock roles; DB: tek string kolon | Tam RBAC tablosu yok | `user_roles` + role catalog | Role değişince permission set |
| Permission lookup | Session permissions; `parseTokenPrincipal` | Flat string list; demo geniş write set | İsimlendirme karışık (`users.manage` vs `platform.users.read`) | Merkezi registry + DB | Missing permission → 403 |
| Server actions | `apps/web` | **Yok** (`"use server"` yok) | Gelecekte guard bypass riski | API ile aynı guard veya BFF | Action deny tests |
| API routes (read) | `read-guards.ts`, modül `routes.ts` | `requireReadAccess` çoğu GET’te | Public liste dışı sızıntı regresyonu | Tüm hassas GET korumalı | 401/403 read matrix |
| API routes (write) | Modül route’ları | `assertAnyPermission` endpoint bazlı | Kapsam tutarsızlığı olabilir | Standart `withGuards` şablonu | Write deny per resource |
| Workers / jobs | `apps/worker/src/index.ts` | TODO stub | Tenant’sız job riski | Job `tenantId` + principal | Job isolation |
| Webhooks | `integrations/routes.ts`, `webhook-security.ts` | Signature, duplicate, approval command | `tenantId` payload default `tenant_1` | Host/path tenant routing | Signature, idempotency, tenant |
| AI actions | `ai-proposal-flow`, `operations-engine/routes.ts` | Proposal + approval; `ai.actions.write` | Operator vs user permission ayrımı zayıf | `ai.proposal.*` / `ai.action.execute` ayrı | Proposal without approval block |
| Approval execution | `approval-execution-flow`, `operations-engine/routes.ts` | Dispatcher + audit | Retry policy DB’de değil | Authorized → execute → audit zorunlu | Execute without approve fail |
| Document ops | `documents` routes, AI local output | Permission + onaylı queue | — | `document.*` + approval outbound | Render/send guard |
| ERP write | `integrations` adapters | `erp.write` permission | Modül + canlı bağlantı check | `erp.sync.write` + approval | Fallback no silent write |
| Factory write | `integrations` adapters | `factory.write` | Aynı | `factory.order.create` + approval | Adapter error surfaced |
| Stock mutations | `commercial-core`, product-stock routes | `warehouse.write`, `products.write` | Stok adjust key standardı eksik | `stock.adjust` + policy | Tenant scoped stock |
| Finance mutations | payments, invoices routes | `payments.*`, `invoices.*` | Tutar limiti yok | `finance.*` + approval | Payment confirm audit |

## Okuma kaynakları

- `apps/api/src/shared/request-context.ts`, `auth-guards.ts`, `read-guards.ts`
- `packages/domain/src/auth/permission-helpers.ts`
- `docs/implementation/004-api-read-guards.md`, `023-database-backed-auth.md`
