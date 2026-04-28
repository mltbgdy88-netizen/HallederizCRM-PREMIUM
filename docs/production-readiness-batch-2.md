# Production Readiness Batch 2

Bu batch, foundation seviyesinden production-benzeri davranisa gecis icin kritik omurgalari guclendirir.

## Tamamlanan Alanlar

1. Auth / Session / Tenant akisi API-first hale getirildi.
2. Approval execution aksiyonlari domain dispatch map ile calisir hale getirildi.
3. Document output queue aksiyonlari audit ile birlikte guclendirildi.
4. Audit / timeline write-back bircok kritik write endpointte aktif hale getirildi.
5. Batch-2 integration-style test foundation eklendi.

## Auth / Session

- `POST /auth/login` artik session store kaydi olusturur.
- `GET /auth/me` ve `GET /auth/session` endpointleri session token uzerinden aktif oturum dondurur.
- `buildRequestContext` session token ile user/tenant/role/permission cozumler.
- `401` (oturum yok), `403` (yetki yok), tenant mismatch ayrimi guard seviyesinde korunur.

## Approval Execution Dispatch

`runApprovalExecution` artik aksiyon tipine gore domain aksiyonuna dispatch eder:

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

Basarili dispatch `executed`, hatali dispatch `failed` durumuna dusurulur ve sonuc mesaji execution result icine yazilir.

## Audit / Timeline

Yeni merkezi audit kaydi:

- `apps/api/src/shared/audit-timeline.ts`

Audit write-back aktiflestirilen ana olaylar:

- customer create/update + relation writes
- product create/update + pricing policy updates
- offer create/update/line/followup/send/convert
- order/payment/warehouse/delivery/invoice/return kritik writes
- ai proposal approve/reject
- approval execute/fail
- document render/regenerate
- document queue save/print

Read endpointleri:

- `GET /audit-events`
- `GET /entity-timelines/:entityType/:entityId`

## Demo Mode ve DB Mode

- Demo fallback korunur.
- Session, approval execution ve audit katmanlari demo modda da ayni contract ile calisir.
- `PERSISTENCE_MODE=postgres` oldugunda mevcut repository/service akisi bozulmadan devam eder.

## Sonraki Batch IcIn Notlar

1. Auth token imzalama/refresh mekanizmasi.
2. Approval execution retry policy + dead-letter stratejisi.
3. Audit event persistence icin DB tablosuna tasima.
4. Timeline UI'da entity tablarina direkt baglama ve filtreleme.

