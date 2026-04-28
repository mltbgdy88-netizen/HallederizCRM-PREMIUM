# Approval Execution Flow

## Zincir

`approval -> execution record -> dispatcher -> domain action -> audit/timeline`

## Adimlar

1. AI veya sistem bir mutation onerisi uretir.
2. Onay kaydi (`approval`) olusur.
3. Onaylandiginda execution kaydi (`approval_execution`) authorized olur.
4. `POST /approval-executions/:id/run` cagrisi dispatcher'i tetikler.
5. Dispatcher `operationType` uzerinden domain aksiyonu calistirir.
6. Sonuc:
   - `executed` + result
   - veya `failed` + error message
7. Audit event yazilir.

## Dispatch Edilen Aksiyonlar

- `create_offer`
- `create_order`
- `update_order_status`
- `create_payment`
- `mark_warehouse_ready`
- `complete_delivery`
- `create_invoice`
- `create_return`
- `send_document_whatsapp`
- `queue_document_save`
- `queue_document_print`

## Hata Davranisi

- Desteklenmeyen action: failed
- Domain kaydi bulunamadi: failed
- Execution result `message` alanina acik hata nedeni yazilir.

## Sonraki Asama

- Retryable vs non-retryable hata siniflamasi DB seviyesinde saklanacak.
- Job retry policy ve backoff stratejisi eklenecek.

