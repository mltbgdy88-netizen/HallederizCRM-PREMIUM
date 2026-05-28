# Platform Core Architecture

Bu doküman HallederizCRM-PREMIUM **hedef** platform çekirdeğini ve **mevcut** uygulama durumunu özetler. Ürün kodu değiştirilmeden sonraki Codex görevleri için ortak referanstır.

## Mevcut platform çekirdeği özeti

| Katman | Konum | Bugünkü rol |
|--------|--------|-------------|
| Web cockpit | `apps/web` | Oturum localStorage; API çağrıları SDK/header ile |
| API | `apps/api` | `buildRequestContext`, `auth-guards`, modül route’ları |
| Domain | `packages/domain` | İş kuralları, approval execution, WhatsApp policy |
| Tipler | `packages/types` | `Tenant`, `Role`, `Permission`, `SessionModel` |
| DB şema | `packages/database` | `tenants`, `users` (auth migration); ticari tablolar ayrı |
| Worker | `apps/worker` | İskelet; queue işlemcisi yok |
| Audit | `apps/api/src/shared/audit-timeline.ts` | In-memory `recordAuditEvent` |

Kalıcı veri hedefi PostgreSQL (`PERSISTENCE_MODE=postgres`). Demo modda session store ve ticari store’ların bir kısmı bellek içi.

## Tenant modeli

- **Tenant** kimliği: `tenantId` (ör. `tenant_1`), girişte `tenantSlug` (ör. `hallederiz`).
- Oturum çözümlemesinde **otorite session’dır**; `x-tenant-id` yalnızca uyum kontrolü (`tenant_mismatch` → 403).
- `packages/types` `Tenant`: `status`, `locale`, `timeZone`, `modules[]` (`TenantModuleCode`).
- Postgres: `tenants` + `users.tenant_id`; slug unique index (`0004_auth_users.sql`).

**Hedef (500 SaaS):** Her kayıt ve sorgu `tenant_id` ile scope’lu; cross-tenant erişim yasak; askıya alınmış tenant fail-closed.

## Branch / company / user / role ilişkisi

| Kavram | Mevcut | Hedef |
|--------|--------|--------|
| Company | Tenant adı/slug ile özdeşleşmiş | Tenant = hukuki şirket; çok şube için `branch` entity |
| Branch | Ayrı tablo yok | `branchId` opsiyonel context; stok/depo/teslimat scope |
| User | `users` + session `user` | Tenant’a bağlı; `is_active` |
| Role | Session’da `roles[]`; DB’de tek `users.role` string | RBAC: `roles`, `role_permissions`, `user_roles` |
| Direct permission | Tip var; demo’da boş | İstisna yetkiler audit’li |

**Kural:** İş kararı **role string** ile değil, **permission key** + policy ile verilir.

## Session ve tenant context akışı

1. `POST /auth/login` → `session-store` / DB auth (`auth-routes.ts`, `database-auth.ts`).
2. Web `auth-provider`: token + session localStorage; `GET /auth/session`.
3. SDK: `x-session-token`, `Authorization: Bearer`, opsiyonel `x-tenant-id` (`packages/sdk/src/base.ts`).
4. `buildRequestContext` → `tenantId`, `userId`, `roles`, `permissions`, `tenantMismatch`, `authIssue`.
5. Guard’lar: `assertAuthenticated`, `assertTenantAccess`, `assertPermission` / `assertAnyPermission`, `withGuards`.

Demo: `mock_access_*`, header principal yalnızca `getAuthMode()` izin verirse. Production/postgres: fail-closed (`023-database-backed-auth.md`).

## Guard zinciri (API / action / worker / domain)

```
İstek → RequestContext → [Auth] → [Tenant match] → [Module/plan?] → [Permission] → [Approval policy?] → Domain servis → Audit/timeline
```

| Yüzey | Mevcut | Hedef |
|-------|--------|--------|
| API route | `withGuards` + `readPermissions` | Tüm mutation/read (public liste dışı) |
| Server action | `apps/web` içinde `"use server"` yok | Eklenirse API ile aynı zincir |
| Worker job | Yok | Job payload `tenantId` + system principal |
| Domain | Saf fonksiyonlar; context çağıran taşır | Servis girişinde tenant assert |
| Webhook | Signature + idempotency; tenant payload’dan | Tenant routing + policy; prod fail-closed |

## Permission check noktaları

- Okuma: `requireReadAccess(readPermissions.*)` (`read-guards.ts`).
- Yazma: route başına `assertAnyPermission` (ör. `orders.write`, `approvals.execute`).
- Wildcard: `permissions` içinde `*` (demo/mock).
- Domain helper: `hasPermission`, `hasAnyPermission`, `hasTenantModule` (`permission-helpers.ts`) — API’de modül check henüz yaygın değil.

## Role ve permission ayrımı

- **Role:** Permission paketi; UI’da etiket.
- **Permission:** Atomik yetki (`resource.verb`).
- **Approval policy:** Kritik mutation için ek katman; permission tek başına yeterli değil.

## Modül ve plan limit

- **Modül:** `Tenant.modules[]` — feature flag + konfig (`hasTenantModule`).
- **Plan:** Henüz faturalama tablosu yok; hedefte `plan_code`, `limits` (kullanıcı, AI token, kanal mesajı, depo, entegrasyon).
- **Sıra:** Plan/modül **açık mı?** → Permission **yapabilir mi?** → Approval **izinli mi?**

## AI action permission

- Proposal: read-only veya `waiting_approval`; `ai.actions.write` / hedef `ai.proposal.create`.
- Execute: yalnızca insan onayı sonrası dispatcher; `ai.action.execute` ayrı izlenmeli.
- AI actor: audit `actorType: ai`.

## Approval limit

- Mutation proposal → approval kaydı → `approvals.approve` / `approvals.execute`.
- WhatsApp komut onayı: token hash, expiry, duplicate (`009-whatsapp-command-approval.md`).
- Limit örnekleri: günlük onay sayısı, tutar eşiği — policy katmanında (henüz merkezi değil).

## Audit / timeline

- `recordAuditEvent(context, …)` — `tenantId` context’ten.
- Onay/execution, AI, WhatsApp, belge, ticari write olayları (`audit-timeline-model.md`).
- Hedef: DB `audit_events` + entity timeline; worker outbox ile tutarlılık.

## Fail-closed

- Auth/DB/webhook secret eksik → 401/403/503; silent mock success yok.
- Fallback mutation execute etmez (`fallback-behavior.md`).
- `tenant_mismatch` → 403.

## 500 SaaS tenant ölçek varsayımları

- Connection pool + tenant index; büyük listelerde cursor pagination.
- Session store: imzalı token veya server-side session tablosu.
- Webhook/idempotency tenant partition; audit async yazım.
- Modül/plan cache (tenant başına TTL); guard middleware tek kod yolu.

## Güvenli implementation prensipleri

1. Tenant context olmadan mutation yok.  
2. Permission olmadan mutation yok.  
3. Plan/modül, permission’ın yerini tutmaz.  
4. Permission, approval’ın yerini tutmaz.  
5. Onay sonrası dispatcher + audit zorunlu.  
6. Yeni route önce registry/policy + test.  
7. Mock/fallback production güvenliğini gevşetmez.

## İlgili dokümanlar

- `TENANT_AUTH_PERMISSION_MAP.md`, `MODULE_AND_PLAN_MODEL.md`, `PERMISSION_KEY_STANDARD.md`, `PLATFORM_CORE_GAP_REPORT.md`
- `docs/auth-and-tenant-flow.md`, `docs/ai-proposal-flow.md`, `docs/approval-execution-flow.md`
