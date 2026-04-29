# AI Proposal Flow

## Zincir

1. Kullanici komutu (`/ai`)
2. Context ozeti
3. LLM proposal generation
4. Structured parse
5. Proposal kaydi
6. Mutation ise approval draft olusumu
7. Kullaniciya summary + operasyon listesi

## Local-First Notu
- Proposal uretim zinciri provider-agnostic kalir.
- Varsayilan calisma modu local provider uzerindendir.
- External provider (OpenAI vb.) yalnizca opsiyonel zenginlestirme/adaptasyon katmanidir.

## Endpointler

- `POST /ai/proposals`
- `GET /ai/proposals`
- `GET /ai/proposals/:id`
- `POST /ai/proposals/:id/confirm`
- `POST /ai/proposals/:id/reject`

## Mutation Guard

- Read-only komutlarda proposal `requiresApproval=false`.
- Mutation komutlarinda proposal `waiting_approval`.
- Execution, approval olmadan dispatch edilmez.

## Execution Baglantisi

Approval onaylandiginda `approval-execution` zinciri:

- `pending -> authorized -> executed|failed`

Desteklenen aksiyonlar:

- `create_offer`
- `create_order`
- `create_payment`
- `mark_warehouse_ready`
- `complete_delivery`
- `create_invoice`
- `create_return`
- `send_document_whatsapp`
- `queue_document_save`
- `queue_document_print`
