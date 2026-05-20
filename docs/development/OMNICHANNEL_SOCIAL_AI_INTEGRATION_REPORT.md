# Omnichannel + Social AI Integration Report

## Özet

Bu faz, Omnichannel / Facebook / Instagram / WhatsApp / AI cevaplama için **production-safe foundation** kurar. Canlı Meta Graph gönderimi veya sahte başarı mesajı üretilmez. AI cevapları **approval-first** akışına bağlanır; tokenlar plaintext saklanmaz.

## Mevcut Stub / Hidden Scope Bulguları

### Omnichannel API (`registerOmnichannelRoutes`)

| Route | Durum |
|-------|--------|
| GET `/platform/omnichannel/conversations` | Tenant scoped liste |
| GET `/platform/omnichannel/conversations/:id` | Detay |
| GET `/platform/omnichannel/conversations/:id/messages` | Mesaj listesi |
| POST `/platform/omnichannel/conversations/:id/reply` | Policy + provider health; live send foundation dışı |
| POST `/platform/omnichannel/conversations/:id/assign` | Çalışır |
| POST `/platform/omnichannel/conversations/:id/resolve` | Çalışır |
| GET `/platform/omnichannel/health` | Provider health |
| GET `/platform/omnichannel/conversations/:id/ai-suggestions` | **Yeni** |

### Kanal tipleri

`whatsapp`, `instagram`, `facebook`, `web_chat`, `email`, `sms`, `internal_note`

### Provider durumu (önce / sonra)

- **Önce:** Tüm kanallar `getDefaultProviderAdapters()` mock/degraded; production silent fallback riski.
- **Sonra:** `createProviderAdapters(config)` — production'da credential yoksa `degraded`, `providerCallExecuted: false`. Mock yalnızca `OMNICHANNEL_ALLOW_MOCK_PROVIDERS=true` + non-production.

### Web inbox

- `/gelen-kutu` mevcut.
- **Önce:** `fetch("/platform/omnichannel/...")` relative — Next rewrite yok.
- **Sonra:** `@hallederiz/sdk` `omnichannel` client + `NEXT_PUBLIC_API_BASE_URL`.

### WhatsApp

- `/whatsapp/webhook`, `/whatsapp/outbound`, `/whatsapp/session`, `/health/whatsapp` korundu.
- **Yeni köprü:** inbound WhatsApp → `omnichannel_conversations` / `omnichannel_messages` (workflow/command akışı bozulmadı).

### ERP / Fabrika (hidden scope — bu faz dışı)

- `/erp/*`, `/factories/*`, `/factory-orders/*` mock-store / demo adapter.
- Eksik: gerçek ERP adapter, credential store, sync queue, factory live API.
- Önerilen branch: `feat/integration-adapters-erp-factory`

### Local AI

- `apps/local-ai-service` chat/voice/OCR foundation.
- Sales AI: `classify-intent`, `chat`, voice routes.
- **Yeni:** inbound sonrası `ai_reply_jobs` enqueue + `ai_reply_suggestions` contract.

## Yeni Database Tabloları

Migration: `0013_omnichannel_provider_accounts_ai.sql`

- `social_media_accounts`
- `channel_credentials` (encrypted / secret-ref; `verify_token_hash`)
- `webhook_events` (idempotency unique)
- `provider_message_receipts`
- `social_contacts`
- `ai_chat_sessions`
- `ai_reply_suggestions`
- `ai_reply_jobs`
- `channel_templates`

Schema export: `packages/database/src/schema/omnichannel-provider-ai.ts`

## Repository Katmanı

`packages/database/src/repositories/*` — tenant scoped, parametreli SQL, webhook `reserveEvent` duplicate-safe.

## Provider Adapter Mimarisi

`packages/domain/src/omnichannel/providers.ts`

- `createProviderAdapters(config)`
- `createMetaGraphProvider` (facebook / instagram)
- `createWhatsAppBusinessProvider`
- `createMockProvider` (explicit demo only)
- `normalizeMetaInbound`

## Meta/Facebook/Instagram Webhook Flow

- GET `/platform/omnichannel/webhooks/meta` — `hub.verify_token` → `verify_token_hash` (DB) veya dev env hash.
- POST — raw body, `x-hub-signature-256`, tenant routing (`social_media_accounts`), `webhook_events` reserve, normalize, conversation/message, AI jobs.

## WhatsApp Köprü Davranışı

`apps/api/src/integrations/routes.ts` — workflow/command/idempotency korunur; başarılı inbound text → `OmnichannelInboundService.bridgeWhatsAppInbound`.

## AI Classification Flow

`OmnichannelAiService.classifyMessageJob` → `AiRuntimeService.classifySalesIntent` (local AI yoksa job degraded, kullanıcıya teknik metin yok).

## AI Reply Suggestion Flow

`generateReplySuggestionJob` → `ai_reply_suggestions` (`waiting_approval`, `policy_decision: require_approval`) — fiyat/stok iddiası üretmez; kontrol dili kullanır.

## Approval Integration

- Action key: `platform.omnichannel.ai_reply.approve`
- `createApprovalForSuggestion` → pending approval repository
- Execute sonrası `send_reply` job contract: `enqueueSendReplyJob` (Faz 4B worker execution)

## Outbound Delivery Flow

- `ai_reply_jobs` `job_type=send_reply`
- Provider `sendMessage` yalnız onay + health OK iken (foundation'da live send kapalı → `live_send_not_enabled_in_foundation`)
- `provider_message_receipts` model hazır

## Web Inbox Değişiklikleri

- `OmnichannelInboxPage` → SDK
- `OmnichannelConversationDetailPage` + `/gelen-kutu/konusma/[conversationId]`
- Türkçe kanal etiketleri, sanitize error/health

## Security Controls

- Meta signature zorunlu (production)
- Verify token hash (plaintext saklanmaz)
- Webhook idempotency
- Tenant routing zorunlu (production)
- AI approval default
- High-risk intent → approval required

## Demo / Production Davranışı

| Ortam | Davranış |
|-------|----------|
| Production | Credential/secret yok → 503/403/400 fail-closed |
| Dev + `OMNICHANNEL_ALLOW_MOCK_PROVIDERS=true` | Mock adapter; send `dryRun`, kullanıcıya canlı başarı yok |
| Dev | Env verify token hash kabul (Meta GET) |

## ERP / Fabrika Hidden Scope Notları

Bu branch ERP/fabrika adapter yazmaz. Rapor: mock-store, credential/sync/tracking eksik.

## E-posta / SMS Hidden Scope Notları

Interface + mock provider var; SMTP/SMS live adapter, opt-in, bounce handling → ayrı faz.

## Kalan Boşluklar (Faz 4B)

- Meta live credential + Graph send
- Token refresh
- Rate limit enforcement
- Provider media attachments
- Background worker `ai_reply_jobs` processor
- Approval execute → `send_reply` wiring
- E-posta/SMS live adapter

## Sonraki Faz Önerileri

1. `feat/provider-live-meta-whatsapp-hardening`
2. `feat/integration-adapters-erp-factory`

## Test Sonuçları

| Komut | Sonuç |
|-------|--------|
| `pnpm --filter @hallederiz/types build` | Geçti |
| `pnpm --filter @hallederiz/database build` | Geçti |
| `pnpm --filter @hallederiz/domain build` | Geçti |
| `pnpm --filter @hallederiz/sdk build` | Geçti |
| `pnpm --filter @hallederiz/api typecheck` | Geçti |
| `pnpm --filter @hallederiz/web typecheck` | Geçti |
| `pnpm --filter @hallederiz/web build` | Geçti |
| `pnpm smoke:navigation` | Geçti |
| `pnpm smoke:api-offline` | Geçti |
| `pnpm smoke:all` | Geçti (production data smoke API kapalıysa skip) |
| `pnpm --filter @hallederiz/api test` | 363/363 geçti |

**Not:** Gerçek Meta Graph credential olmadan canlı gönderim yapılmadı. Mock provider production'da silent fallback değildir.
