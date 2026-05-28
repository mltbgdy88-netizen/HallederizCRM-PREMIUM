# Platform Core Gap Report

Mevcut repo ile `PLATFORM_CORE_ARCHITECTURE.md` hedefi arasındaki farklar. Görev 2 sağlık raporu (`docs/development/TECH_DEBT_HEALTH_REPORT.md`) repoda henüz yok; gap’ler kod ve mevcut spec incelemesine dayanır.

| # | Gap adı | Etkilenen alan | Risk | Neden önemli? | Önerilen çözüm | Sahip | Sonraki görev |
|---|---------|----------------|------|---------------|----------------|-------|----------------|
| 1 | Guard zinciri standardizasyonu | API route’ları | **critical** | Endpoint’ler arası tutarsız guard regresyon ve sızıntı riski | Merkezi `withGuards` şablonları; route audit checklist | Codex | **003** |
| 2 | RBAC persistence | Auth, permission | **high** | DB’de tek `users.role`; rol-permission tablosu yok | Migration + role/permission seed; session DB’den resolve | Codex | 004 |
| 3 | Modül/plan enforcement | Tenant, billing | **high** | `hasTenantModule` API’de yaygın değil | `assertModuleEnabled` + plan limit middleware | Codex | 005 |
| 4 | Session/token production | Auth | **high** | In-memory session; mock token | Server session store veya imzalı JWT + refresh | Codex | 006 |
| 5 | Webhook tenant routing | WhatsApp, omnichannel | **high** | `tenantId` payload/default `tenant_1` | Meta phone_number_id → tenant map | Codex | 007 |
| 6 | Permission key registry | Auth, API | **medium** | Legacy/flat key karışımı | `PERMISSION_KEY_STANDARD` registry + alias | Codex | 008 |
| 7 | Worker tenant context | Worker, queue | **medium** | Worker stub; job yok | Job envelope `tenantId` + guard | Codex | 009 |
| 8 | Audit persistence | Compliance | **medium** | In-memory audit | DB `audit_events` + async writer | Codex | 010 |
| 9 | Branch/company model | Platform domain | **medium** | Şube entity yok | `branches` + context `branchId` | Cursor | 011 |
| 10 | AI permission ayrımı | AI, approval | **medium** | `ai.actions.write` birleşik | `ai.proposal.*` / `ai.action.execute` | Codex | 012 |
| 11 | Approval limit policy | Operations | **medium** | Tutar/adet limiti merkezi değil | Policy engine + audit | Codex | 013 |
| 12 | Server action guard | Web | **low** | Server action yok | Eklenirse BFF guard spec | Cursor | — |
| 13 | Plan/metering schema | Billing | **low** | Usage tablosu yok | `tenant_plan` + counters | Cursor | 014 |
| 14 | Cross-tenant test suite | QA | **medium** | Otomatik isolation paketi sınırlı | Dedicated tenant isolation tests | Codex | 003 (kısmi) |

## En kritik 5 gap (özet)

1. **Guard zinciri standardizasyonu** — tüm API mutation/read yüzeyi.  
2. **RBAC persistence** — rol ve permission DB’den.  
3. **Modül/plan enforcement** — ücretli modül ve limit.  
4. **Session/token production** — ölçek ve güvenlik.  
5. **Webhook tenant routing** — çok kiracılı kanal güvenliği.

## Sonraki Codex önerisi

**003 — Tenant/Auth/Permission guard standardizasyonu** (`docs/codex-prompts/003-platform-core-guard-standardization.md`).

## Dokunulmayacaklar (gap çözümünde)

Migration/schema değişikliği 003 kapsamı dışında; approval/AI davranışı gevşetilmez; webhook fail-open yapılmaz.

## 003 ilerleme notu (2026-05-12)

- API guard zinciri icin tenant+permission ortak helper standardizasyonu baslatildi.
- Platform-core mutation route'larinda ortak helper kullanimina gecildi.
- WhatsApp webhook tenant context cozumlemesinde production fail-closed davranisi netlestirildi.
- Worker/job tenant envelope standardizasyonu halen ayri bir takip isidir (Gap #7).
