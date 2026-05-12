# Feature Registry Model

**Feature Registry**, tenant’ın hangi ürün yeteneklerini kullanabileceğini tanımlar. **Permission** kim yapabilir; **approval** kritik işlem onayı; **feature** kapı açık mı sorularını ayırır.

## Paket seviyeleri

| Seviye | Açıklama |
|--------|----------|
| **core** | Tüm tenant’larda; plan’dan bağımsız minimum |
| **premium** | Ücretli add-on |
| **enterprise** | Yüksek limit, compliance, çok kanal |

## Tenant durumları

- `enabled` / `disabled` — feature açık mı  
- `configured` — entegrasyon/credential tamam mı  
- `trial` / `paid` / `suspended` — faturalama ve süre  
- `usageMetering` — dönemsel sayaç (`usageMetric`)

## Plan limit

```text
tenant_plan.limits[metricKey] → max | soft_cap | hard_cap
usage_counter(tenantId, metricKey, period) → current
```

Limit aşımı: fail-closed veya read-only; sessiz kesinti yok.

## Feature vs permission vs approval

| Soru | Katman |
|------|--------|
| Özellik satın alındı mı? | Feature + plan |
| Kullanıcı yetkili mi? | Permission |
| Kritik işlem onaylı mı? | Approval policy |

## Bağımlılık

Örnek: `premium.whatsapp` → `core.customer`, `core.approval`. Bağımlı feature kapalıysa üst feature `deny`.

## Örnek feature tablosu

| featureKey | moduleKey | package | dependencies | tenantConfigKey | permissionPrefix | approvalPolicy | usageMetric | limit örnekleri | billingReady | audit |
|------------|-----------|---------|--------------|-----------------|------------------|----------------|-------------|-----------------|--------------|-------|
| `core.tenant` | tenant | core | — | `modules.core` | `platform.` | Hayır | — | — | Hayır | Evet |
| `core.company` | company | core | core.tenant | — | `platform.` | Hayır | — | — | Hayır | Evet |
| `core.branch` | branch | core | core.company | `branches` | `platform.` | Hayır | max_branches | 5 / 50 | Hayır | Evet |
| `core.user` | user | core | core.tenant | `users` | `platform.users` | Hayır | max_users | 10 / 500 | Evet | Evet |
| `core.role` | role | core | core.user | — | `platform.roles` | Hayır | — | — | Hayır | Evet |
| `core.auth` | auth | core | core.user | — | — | Hayır | — | — | Hayır | Evet |
| `core.permission` | permission | core | core.role | — | — | Hayır | — | — | Hayır | Evet |
| `core.customer` | customer | core | core.tenant | — | `customer.` | Koşullu | customers | 5k / 100k | Evet | Evet |
| `core.product` | product | core | core.tenant | — | `product.` | Hayır | skus | 2k / 50k | Evet | Evet |
| `core.stock.read` | stock | core | core.product | — | `stock.read` | Hayır | — | — | Hayır | Hayır |
| `core.audit` | audit | core | core.tenant | — | `audit.` | Hayır | audit_retention_days | 90 / 2555 | Enterprise | Zorunlu |
| `core.timeline` | timeline | core | core.audit | — | `audit.read` | Hayır | — | — | Hayır | Zorunlu |
| `core.approval` | approval | core | core.audit | — | `approval.` | — | pending_approvals | 100 | Hayır | Zorunlu |
| `core.qop` | quick_operation | core | core.customer | — | `order.` | Evet | qop_sessions | — | Hayır | Evet |
| `core.reporting.basic` | reporting | core | core.customer | `modules.reporting` | `report.` | Hayır | report_exports | 50/ay | Premium | Hayır |
| `premium.ai.operator` | ai | premium | core.approval | `modules.ai` | `ai.` | Evet | ai_tokens | 100k/ay | Evet | Evet |
| `premium.ai.voice` | ai | premium | premium.ai.operator | `ai.voice` | `ai.voice` | Evet | voice_minutes | 500 | Evet | Evet |
| `premium.whatsapp` | whatsapp | premium | core.approval | `modules.whatsapp` | `channel.whatsapp` | Evet | wa_outbound | 10k/ay | Evet | Evet |
| `premium.instagram` | instagram | premium | core.approval | `channel.instagram` | `channel.instagram` | Evet | ig_messages | 5k | Evet | Evet |
| `premium.facebook` | facebook | premium | core.approval | `channel.facebook` | `channel.facebook` | Evet | fb_messages | 5k | Evet | Evet |
| `premium.webchat` | webchat | premium | core.approval | `channel.webchat` | `channel.webchat` | Koşullu | chat_sessions | 2k | Evet | Evet |
| `premium.email` | email | premium | core.approval | `channel.email` | `channel.email` | Evet | emails_sent | 20k | Evet | Evet |
| `premium.sms` | sms | premium | core.approval | `channel.sms` | `channel.sms` | Evet | sms_sent | 5k | Evet | Evet |
| `premium.workflow.advanced` | workflow | premium | core.approval | `workflow.advanced` | `workflow.` | Evet | workflow_runs | 1k | Evet | Evet |
| `premium.wms` | wms | premium | core.stock.read | `wms` | `warehouse.` | Evet | warehouse_ops | — | Evet | Evet |
| `premium.field_delivery` | delivery | premium | core.qop | `field.delivery` | `delivery.` | Evet | deliveries | — | Evet | Evet |
| `premium.erp` | erp | premium | core.approval | `modules.erp` | `erp.` | Evet | erp_writes | 500/gün | Evet | Evet |
| `premium.factory` | factory | premium | premium.erp | `factory` | `factory.` | Evet | factory_orders | 200/gün | Evet | Evet |
| `premium.documents.advanced` | documents | premium | core.qop | `documents.advanced` | `document.` | Evet | doc_generations | 5k | Evet | Evet |
| `premium.analytics` | analytics | premium | core.reporting.basic | `analytics` | `analytics.` | Hayır | queries | 10k | Evet | Hayır |
| `enterprise.metering` | billing | enterprise | core.tenant | `billing.metering` | `billing.` | Hayır | usage_records | — | Evet | Evet |
| `enterprise.compliance.export` | compliance | enterprise | core.audit | `compliance` | `audit.export` | Evet | export_jobs | 50/ay | Evet | Zorunlu |

## Mevcut repo

`TenantModuleCode` ve `mockTenant.modules` (`packages/types`, `mock-data`) — feature registry’nin ilk alt kümesi. Plan/metering şema yok (`PLATFORM_CORE_GAP_REPORT.md`).

## Per-tenant config

`tenant_feature_config(featureKey, json)` — örn. WhatsApp onay telefonları, AI confidence eşiği, mesai saatleri. Policy Engine evaluate sırasında okunur.
