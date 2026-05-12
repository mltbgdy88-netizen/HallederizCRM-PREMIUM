# Module and Plan Model

Core (platform dahil) ile ücretli modüllerin ayrımı. **Mevcut** `TenantModuleCode`: `core`, `users`, `settings`, `whatsapp`, `ai`, `erp`, `reporting` (`packages/types/src/tenant.ts`). Genişletme hedefi aşağıdaki tablodur.

## Paket seviyeleri

| Seviye | Anlam |
|--------|--------|
| **core** | Tüm tenant’larda; plan’dan bağımsız minimum |
| **premium** | Üst paket / add-on |
| **enterprise** | Yüksek limit, compliance, çok kanal |

## Modül tablosu

| module key | Açıklama | Tier | tenant config | Permission örnekleri | AI | Approval | Audit | Plan limit örnekleri | Faturalama metriği |
|------------|----------|------|---------------|----------------------|----|----------|-------|----------------------|-------------------|
| `core.platform` | Tenant, auth, session, permission | core | `modules.core` | `platform.settings.read` | Hayır | Hayır | Evet | max_users | active_users |
| `core.cari` | Müşteri / cari | core | enabled | `customer.read`, `customer.create` | Özet | Hayır | Evet | max_customers | customer_count |
| `core.product` | Ürün, temel stok okuma | core | enabled | `product.read`, `stock.read` | Özet | Hayır | Okuma | max_skus | sku_count |
| `core.audit` | Audit / timeline | core | always | `audit.read` | Hayır | Hayır | Zorunlu | retention_days | audit_events |
| `core.approval` | Onay foundation | core | enabled | `approval.request`, `approval.decide` | Proposal | Evet | Zorunlu | max_pending_approvals | approval_count |
| `core.qop` | Quick Operation Center | core | enabled | `order.create`, `offer.create` | Öneri | Kritikte | Evet | — | qop_sessions |
| `core.reporting.basic` | Temel rapor | core | `reporting` | `report.read` | Özet | Hayır | Hayır | — | report_exports |
| `premium.ai.operator` | AI Operator | premium | `modules.ai` | `ai.proposal.create`, `ai.action.execute` | Evet | Mutation’da | Evet | ai_tokens_month | ai_tokens |
| `premium.ai.voice` | Sesli asistan | premium | `ai.voice` | `ai.voice.use` | Evet | Komut→proposal | Evet | voice_minutes | stt_tts_minutes |
| `premium.whatsapp` | WhatsApp | premium | `modules.whatsapp` | `channel.whatsapp.reply` | Öneri | Riskli outbound | Evet | wa_messages_month | wa_outbound |
| `premium.instagram` | Instagram | premium | `channel.instagram` | `channel.instagram.reply` | Öneri | Evet | Evet | ig_messages | channel_messages |
| `premium.facebook` | Facebook | premium | `channel.facebook` | `channel.facebook.reply` | Öneri | Evet | Evet | fb_messages | channel_messages |
| `premium.webchat` | Web Chat | premium | `channel.webchat` | `channel.webchat.reply` | Öneri | Evet | Evet | chat_sessions | chat_sessions |
| `premium.email` | E-posta | premium | `channel.email` | `channel.email.send` | Taslak | Toplu gönderim | Evet | emails_month | emails_sent |
| `premium.sms` | SMS | premium | `channel.sms` | `channel.sms.send` | Hayır | Evet | Evet | sms_month | sms_sent |
| `premium.workflow` | Gelişmiş workflow | premium | `workflow.advanced` | `workflow.admin` | Plan | Adım onayı | Evet | active_workflows | workflow_runs |
| `premium.wms` | Depo / WMS | premium | `wms` | `warehouse.execute`, `stock.transfer` | Özet | Hazırlık/teslim | Evet | warehouses | warehouse_ops |
| `premium.field_delivery` | Saha teslimat | premium | `field.delivery` | `delivery.complete` | Hayır | Evet | Evet | drivers | delivery_completions |
| `premium.erp` | ERP entegrasyon | premium | `modules.erp` | `erp.sync.read`, `erp.sync.write` | Özet | Write | Evet | erp_sync_jobs | erp_writes |
| `premium.factory` | Fabrika entegrasyon | premium | `factory` | `factory.order.create` | Özet | Sipariş | Evet | factory_orders | factory_orders |
| `premium.documents.advanced` | Gelişmiş belge | premium | `documents.advanced` | `document.send`, `document.render` | Taslak | Gönderim | Evet | doc_generations | documents_issued |
| `premium.analytics` | Gelişmiş analitik | premium | `analytics` | `analytics.read` | Insight | Hayır | Hayır | dashboards | analytics_queries |
| `enterprise.metering` | Kullanım ölçümü | enterprise | `billing.metering` | `billing.read` | Hayır | Hayır | Evet | — | usage_records |
| `enterprise.compliance` | Audit export | enterprise | `compliance` | `audit.export` | Hayır | Export onayı | Zorunlu | export_jobs | compliance_exports |

## Plan limit modeli (hedef)

```text
tenant_plan (plan_code, limits_json, effective_from)
usage_counter (tenant_id, metric_key, period, value)
```

Limit aşımı: **fail-closed** veya salt okunur mod; sessiz kesinti yok.

## Kontrol sırası

1. Tenant aktif mi?  
2. Modül enabled + configured mı? (`hasTenantModule`)  
3. Plan limiti aşıldı mı?  
4. Permission var mı?  
5. Approval policy geçti mi? (kritik mutation)

## Mevcut repo notu

`mockTenant.modules` demo’da WhatsApp/AI/ERP kapalı. API route’ların çoğu **modül check** yapmıyor; yalnızca permission. Hedef: modül + plan katmanı API guard’a eklenmeli (`PLATFORM_CORE_GAP_REPORT.md`).
