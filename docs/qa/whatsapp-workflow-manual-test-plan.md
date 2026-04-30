# WhatsApp Workflow Manual Test Plan

## Kapsam
Bu plan inbound webhook guvenligi, duplicate guard ve command approval foundation akisini manuel dogrulamak icin hazirlanmistir.

## On Kosullar
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN` tanimli.
- Production benzeri testte `WHATSAPP_WEBHOOK_APP_SECRET` tanimli.
- Test payloadlari ile route'a istek atilabiliyor.

## Senaryo 1 - Webhook Verify Token
1. GET verify endpoint'e dogru token ile cagir.
2. Beklenen: verify basarili.
3. Yanlis token ile tekrar cagir.
4. Beklenen: verify reddedilir.

## Senaryo 2 - Invalid Signature
1. POST webhook'a gecersiz `x-hub-signature-256` ile cagir.
2. Beklenen: 403.

## Senaryo 3 - Valid Signature
1. Raw body uzerinden dogru HMAC signature uret.
2. POST webhook cagir.
3. Beklenen: istek kabul edilir (`ok: true` path).

## Senaryo 4 - Duplicate messageId
1. Ayni `messageId` ile iki kez POST webhook gonder.
2. Beklenen:
   - ilkinde normal islem
   - ikincide `duplicate: true` benzeri sonuc

## Senaryo 5 - ONAY Command (Valid)
1. Pending ticket olustur.
2. `ONAY REF TOKEN` komutunu authorized telefondan gonder.
3. Beklenen:
   - ticket status applied
   - command audit accepted

## Senaryo 6 - RED Command (Invalid Token)
1. Yanlis token ile `RED REF TOKEN`.
2. Beklenen:
   - rejected audit
   - raw token store edilmez

## Senaryo 7 - Unauthorized Phone
1. Allowed approver phone disinda bir numaradan command gonder.
2. Beklenen:
   - `approver_not_allowed` benzeri reason
   - ticket resolve edilmez

## Senaryo 8 - Expired Ticket
1. Suresi dolmus ticket ile command gonder.
2. Beklenen:
   - status expired
   - audit reason ticket_expired

## Senaryo 9 - Production Missing Secret
1. `NODE_ENV=production` ve `WHATSAPP_WEBHOOK_APP_SECRET` bos.
2. POST webhook cagir.
3. Beklenen:
   - kontrollu misconfigured hata (503/5xx policy)
   - fail-open kabul yok
