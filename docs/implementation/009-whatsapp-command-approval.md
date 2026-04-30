# 009 - WhatsApp Command Approval Handling

Bu tur, WhatsApp uzerinden gelen onay/red/incele komutlarini pending workflow ticket ile guvenli sekilde eslestiren foundation katmanini ekler.

## Komut Formatlari

Desteklenen komutlar:

- `ONAY REF123 TOKEN123`
- `ONAYLA REF123 TOKEN123`
- `APPROVE REF123 TOKEN123`
- `RED REF123 TOKEN123`
- `REDDET REF123 TOKEN123`
- `REJECT REF123 TOKEN123`
- `INCELE REF123 TOKEN123`
- `İNCELE REF123 TOKEN123`
- `REVIEW REF123 TOKEN123`

Parser fazla bosluklari tolere eder, case normalize eder ve Turkce `İNCELE` varyantini destekler. Normal musteri mesajlari komut gibi algilanmaz.

## Token Hash Dogrulama

Ticket olusturulurken raw token saklanmaz. Store icinde yalnizca `tokenHash` tutulur.

Komut geldiginde:

1. `referenceCode` ile ticket bulunur.
2. Komut ticket `allowedCommands` listesiyle eslestirilir.
3. Raw token hashlenir ve `ticket.tokenHash` ile karsilastirilir.
4. Raw token audit veya ticket kaydina yazilmaz.

## Yetkili Telefon Kontrolu

Bu turda yetkili telefon kontrolu su alanlardan okunur:

- `ticket.payload.approverPhones`
- `ticket.payload.allowedApproverPhones`
- API tarafindan verilebilecek `approverContext.allowedPhones`
- API tarafindan verilebilecek `approverContext.approverPhones`

Liste bos ise mevcut foundation development/demo akisi izin verir. Production'da bu liste rule resolver / approval policy ile doldurulmalidir.

## Ticket Status Degisimleri

- `approve` -> `applied`
- `reject` -> `rejected`
- `review` -> `pending` kalir, ancak audit `review_requested` nedeni ile yazilir
- expired ticket -> `expired`
- already resolved ticket -> status degismez, duplicate audit yazilir

Basarili komutlarda `usedAt`, `usedByPhone` ve `resolvedCommand` alanlari set edilir.

## Command Audit Sonuclari

Audit sonuclari:

- `accepted`
- `rejected`
- `duplicate`

Olası nedenler:

- `ticket_not_found`
- `ticket_expired`
- `command_not_allowed`
- `token_invalid`
- `approver_not_allowed`
- `ticket_already_resolved`
- `review_requested`

## Webhook Akisi

`POST /whatsapp/webhook` imza ve idempotency kontrollerini korur.

Akis:

1. Signature dogrulanir.
2. Duplicate guard reserve eder.
3. Text command parser'dan gecirilir.
4. Komutsa `handleApprovalCommand` calisir.
5. Ticket state ve command audit kaydedilir.
6. Response icine `commandResult` ve outbound foundation mesaji eklenir.
7. Real order/payment/return execution yapilmaz.

## Bu Turda Yapilmayanlar

- Gercek order/payment/return execution
- Full conversational engine
- WhatsApp Web.js production gateway
- Approval execution dispatcher baglantisi

## Sonraki Is

- Approval command execution dispatcher baglantisi
- Ticket command audit kayitlarinin audit/timeline ekranlarinda gorunurlugu
- Local AI backend port
