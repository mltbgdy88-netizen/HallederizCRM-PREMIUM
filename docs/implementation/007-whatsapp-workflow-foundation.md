# 007 - WhatsApp Workflow Idempotency + Approval Ticket Foundation

Bu tur, eski `hallederizcrm-wa-clean` reposundaki WhatsApp workflow-store fikrini yeni monorepo mimarisine kontrollu sekilde tasir. Tam konusma motoru veya menu engine eklenmedi; once inbound webhook duplicate guard, pending ticket ve command audit omurgasi kuruldu.

## Port Edilen Fikirler

- Ayni `messageId` tekrar islenmez.
- Ayni telefon numarasindan ayni normalize edilmis icerik kisa pencere icinde tekrar gelirse duplicate sayilir.
- Inbound mesaj islenirken once `processing`, basarili tamamlaninca `processed` durumuna tasinir.
- Hata olursa processing kaydi serbest birakilir.
- Approval ticket token'i raw olarak saklanmaz; sadece SHA-256 hash tutulur.
- Ticket komutlari normalize edilir.
- Command audit, kabul / red / duplicate sonucunu izlemek icin ayrilir.

## Idempotency Davranisi

Varsayilan duplicate penceresi `20 saniye`dir.

Kontrol sirasi:

1. `same_message_processed`: ayni message id daha once basariyla islenmis.
2. `same_message_processing`: ayni message id su an isleniyor.
3. `same_content_processed`: ayni telefon + ayni icerik duplicate penceresi icinde islenmis.
4. `same_content_processing`: ayni telefon + ayni icerik duplicate penceresi icinde isleniyor.

Webhook duplicate ise response basarili kalir ama yeni is akisi baslatmaz:

```json
{
  "ok": true,
  "duplicate": true,
  "duplicateReason": "same_message_processed",
  "outbound": []
}
```

## Processing vs Processed

- `processingMessages`: webhook islenirken gecici rezervasyon kaydidir.
- `processedMessages`: inbound mesaj basariyla islendikten sonra yazilir.
- Processing kayitlari `45 dakika` sonra temizlenebilir.
- Processed kayitlari `7 gun` saklanir.

Bu ayrim, webhook retry durumunda ayni talebin iki kez workflow uretmesini engeller.

## Pending Approval Ticket Foundation

Yeni domain helper'lari pending ticket uretir:

- `createWhatsAppApprovalTicket`
- `validateTicketCommand`
- `appendTicket`
- `updateTicket`

Ticket alanlari:

- `type`
- `referenceCode`
- `tokenHash`
- `allowedCommands`
- `customerPhone`
- `status`
- `expiresAt`
- opsiyonel `payload`

Raw token hicbir ticket kaydinda saklanmaz. Komut dogrulama su hatalari ayristirir:

- `ticket_expired`
- `command_not_allowed`
- `token_invalid`
- `approver_not_allowed`
- `ticket_already_resolved`

## Command Audit

`commandAudit`, WhatsApp uzerinden gelen onay/ret benzeri komutlar icin iz birakir:

- referans kodu
- komut
- gonderen telefon
- tarih
- sonuc
- neden

Bu turda audit kaydi DB'ye kalici yazilmaz; tenant bazli in-memory foundation uzerinden tutulur.

## API Store Foundation

`apps/api/src/modules/whatsapp-workflow/store.ts` icinde `WhatsAppWorkflowStoreService` eklendi.

Bu servis su an in-memory/demo foundation'dir:

- `load`
- `save`
- `reserveInboundMessage`
- `markProcessed`
- `releaseProcessing`
- `appendTicket`
- `addCommandAudit`

Sonraki adimda bu interface Postgres-backed `tenant_whatsapp_workflow` repository'ye tasinmalidir. Production icin in-memory store kalici kaynak kabul edilmemelidir.

## Webhook Entegrasyonu

`POST /whatsapp/webhook` artik signature dogrulamadan sonra inbound mesaj icin workflow reservation yapar.

Korunan davranislar:

- 006 turundaki raw body imza kontrolu bozulmadi.
- `WHATSAPP_WEBHOOK_APP_SECRET` production'da zorunlu kalir.
- Gecersiz imza `403` doner.
- Bu turda otomatik siparis / tahsilat / iade execution yapilmaz.

## Bu Turda Tasinmayanlar

- Full `workflow-engine`
- Full conversational menu
- Postgres-backed workflow store
- Real command execution
- WhatsApp Web.js gateway production kullanimi

## Sonraki Is

Siradaki mantikli adim:

- WhatsApp command approval handling
- Postgres-backed workflow repository
- Ticket command -> approval/action request baglantisi
- Idempotency kayitlarinin audit/timeline ile iliskisi
