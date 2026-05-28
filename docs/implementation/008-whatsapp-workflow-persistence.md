# 008 - WhatsApp Workflow Store Postgres Persistence

Bu tur, 007 ile eklenen in-memory WhatsApp workflow store foundation'ini production icin kalici hale getiren Postgres-backed repository omurgasini ekler.

## Neden Gerekli?

In-memory store webhook retry ve duplicate guard icin development ortaminda yeterlidir; fakat production'da proses restart, scale-out veya paralel webhook tesliminde kalici kabul edilemez. WhatsApp inbound mesajlarinin idempotency, pending ticket ve command audit kayitlari tenant bazinda kalici tutulmalidir.

## Yeni Tablo

Migration:

- `packages/database/src/migrations/0002_whatsapp_workflows.sql`

Tablo:

- `tenant_whatsapp_workflows`

Kolonlar:

- `tenant_id TEXT PRIMARY KEY`
- `store_json JSONB NOT NULL DEFAULT '{}'::jsonb`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Ek index:

- `idx_tenant_whatsapp_workflows_updated_at`

Schema export:

- `packages/database/src/schema/whatsapp-workflows.ts`

## Store JSON Yaklasimi

Bu turda workflow state tek tenant satirinda `store_json` olarak tutulur. JSON icinde su alanlar normalize edilir:

- `processedMessages`
- `processingMessages`
- `tickets`
- `commandAudit`
- opsiyonel `mediaMessages`

Eksik alanlar `normalizeTenantWhatsAppWorkflowStore` ile default bos dizilere tamamlanir. Bu sayede eski veya parcali JSON kayitlari domain helper'lari tarafindan guvenli okunur.

## Duplicate Guard ve Transaction

Postgres modda `reserveInboundMessage` su akisi kullanir:

1. Transaction baslatilir.
2. Tenant row yoksa bos store ile olusturulur.
3. Row `FOR UPDATE` ile okunur.
4. `findMessageDuplicate` domain helper'i calisir.
5. Duplicate degilse `reserveProcessingMessage` uygulanir.
6. `store_json` guncellenir.
7. Transaction commit edilir.

Bu row-level lock, ayni tenant icin iki paralel webhook'un ayni messageId veya contentHash icin race condition uretmesini engeller.

## Production Fallback Policy

Policy:

- `NODE_ENV=production` ise in-memory fallback kapali.
- `PERSISTENCE_MODE=postgres` ise DB hata durumunda default olarak fallback kapali.
- Development ortaminda fallback yalnizca `ALLOW_DEMO_FALLBACK=true` ise acilir.

Postgres mode'da DB hata alinir ve fallback kapaliysa `persistence_unavailable` hatasi uretilir. Bu sayede production/postgres modda sessizce memory store'a dusulmez.

## Bu Turda Yapilmayanlar

- `ONAY` / `RED` command execution baglantisi
- Full conversational workflow engine
- WhatsApp Web.js production gateway
- Ticket command -> approval execution zinciri

## Sonraki Is

Siradaki mantikli adim:

- WhatsApp command approval handling
- Pending ticket komutlarinin approval/action request kayitlarina baglanmasi
- Command audit kayitlarinin audit/timeline ile gorunur hale gelmesi
