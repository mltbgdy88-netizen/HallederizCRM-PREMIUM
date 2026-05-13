# Omnichannel Inbox Foundation

## Amaç

Bu faz, mevcut WhatsApp güvenlik ve workflow çekirdeðini bozmadan kanal-agnostik conversation/message modelini ve guarded API temelini ekler.

## Kanal Modeli

Desteklenen kanal türleri:
- whatsapp
- instagram
- facebook
- web_chat
- email
- sms
- internal_note

Conversation ve message nesneleri tenant scoped çalýþýr.

## Provider Adapter Contract

`ChannelProviderAdapter` sözleþmesi:
- `health()`
- `normalizeInbound(payload)`
- `sendMessage(request)`
- `validateWebhook?()`
- `getCapabilities()`

Bu PR'da Instagram/Facebook/WebChat/Email/SMS mock provider olarak gelir. Live send yapýlmaz, degraded veya mock durum döner.

## Guard ve Policy Sýrasý

Omnichannel route sýrasý:
1. `assertAuthenticated`
2. tenant ve permission guard
3. policy enforcement (`enforcePolicyForRoute`)
4. decision mapping (`deny` / `dry_run_only` / `require_approval` / `allow`)
5. repository/provider iþlemi

Policy engine tenant guard yerine geçmez.

## AI Reply Güvenlik Sýnýrý

AI source ile gelen reply giriþimleri direct live send yapamaz.
`platform.omnichannel.reply` kritiktir ve approval-first çizgisinde kalýr.

## WhatsApp Güvenlik Zinciri

Mevcut WhatsApp webhook signature/token/phone doðrulamasý korunur.
Omnichannel foundation, bu zinciri bypass etmez ve sahte verified metadata üretmez.

## Mock / Live Ayrýmý

- Development/demo: in-memory repository kullanýlabilir.
- Production + postgres mode: silent memory fallback yoktur.
- Postgres eriþimi yoksa explicit `unsupported`/`503` döner.

## Bu PR'da Yapýlmayanlar

- Gerçek Instagram/Facebook provider entegrasyonu
- Gerçek Email/SMS provider entegrasyonu
- Full omnichannel automation orchestration
- Durable workflow migration
- Autonomous AI send
