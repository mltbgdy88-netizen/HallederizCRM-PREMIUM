# WhatsApp Security and Rule Policy Port

Bu tur, eski `mltbgdy88-netizen/hallederizcrm-wa-clean` reposundaki olgun WhatsApp webhook security ve rule resolver ilkelerini yeni monorepo yapısına taşır. Tam workflow engine bu turda taşınmadı; odak webhook imza doğrulaması ve intent bazlı kural policy foundation'ıdır.

## Port Edilen Parçalar

- Eski `src/lib/whatsapp/webhook-security.ts` mantığı yeni `apps/api/src/shared/webhook-security.ts` içine taşındı.
- Eski `src/lib/whatsapp/rule-resolver.ts` mantığı yeni `packages/domain/src/whatsapp/rule-resolver.ts` altında typed domain policy olarak kuruldu.
- Eski `src/app/api/whatsapp/inbound/route.ts` içindeki production secret policy ve raw body imza kontrolü Fastify route davranışına uyarlandı.
- Eski `workflow-store.ts` yalnızca idempotency/ticket yaklaşımı için incelendi; bu turda komple taşınmadı.

## Kapatılan Güvenlik Riski

Önceki adapter davranışında webhook secret veya signature yoksa doğrulama fail-open çalışabiliyordu. Yeni davranış:

- Secret yoksa shared verify helper hiçbir zaman true dönmez.
- Signature yoksa false döner.
- `sha256=<hex>` ve plain hex formatları desteklenir.
- Geçersiz hex ve length mismatch false döner.
- Karşılaştırma `timingSafeEqual` ile yapılır.

## Webhook Signature Davranışı

`POST /whatsapp/webhook` artık imza doğrulamasını raw body üzerinden yapar. `JSON.stringify(request.body)` ile tekrar üretilmiş body imzalanmaz.

Header desteği:

- `x-hub-signature-256`
- `x-whatsapp-signature`

Production policy:

- `NODE_ENV=production` ve `WHATSAPP_WEBHOOK_APP_SECRET` yoksa inbound webhook `503` döner.
- Secret varsa signature zorunludur.
- Yanlış signature `403` döner.
- Production dışı ortamda secret yoksa mock/fallback webhook kabul edilebilir; bu yalnızca development kolaylığıdır.

GET verification:

- `GET /whatsapp/webhook` public kalır.
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN` eşleşmesi zorunludur.

## Env Alanları

- `WHATSAPP_PROVIDER`
- `WHATSAPP_API_BASE_URL`
- `WHATSAPP_API_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_BUSINESS_ACCOUNT_ID`
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
- `WHATSAPP_WEBHOOK_APP_SECRET`
- `WHATSAPP_TEST_RECIPIENT`
- `WHATSAPP_TIMEOUT_MS`

## WhatsApp Intent / Rule Matrix

| Intent | Kayıtlı telefon | Cari eşleşmesi | Auto reply | İç onay | Roller |
| --- | --- | --- | --- | --- | --- |
| `stok` | Hayır | Hayır | Evet | Hayır | - |
| `fiyat` | Evet | Evet | Hayır | Hayır | - |
| `ekstre` | Evet | Evet | Hayır | Hayır | - |
| `siparis` | Evet | Evet | Hayır | Evet | CRM, satış, muhasebe |
| `odeme` | Evet | Evet | Hayır | Evet | CRM, satış, muhasebe |
| `fatura` | Evet | Evet | Hayır | Evet | CRM, satış, muhasebe |
| `iade` | Evet | Evet | Hayır | Evet | Satış, muhasebe |
| `hatali_urun` | Hayır | Hayır | Evet | Evet | Satış, muhasebe |
| `diger` | Hayır | Hayır | Evet | Hayır | - |

Satış ve muhasebe onay telefonları normalize edilerek `approverPhones` listesine alınır.

## Bu Turda Taşınmayanlar

- `workflow-store` full implementation
- ticket/idempotency full implementation
- WhatsApp Web.js gateway production backbone
- tam workflow engine portu

## Sonraki İş

Sıradaki WhatsApp işi: workflow idempotency + approval ticket port.
