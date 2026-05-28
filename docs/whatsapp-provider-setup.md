# WhatsApp Provider Setup

## Env Degiskenleri

- `WHATSAPP_PROVIDER=live` (`mock` ise fallback)
- `WHATSAPP_API_BASE_URL`
- `WHATSAPP_API_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_BUSINESS_ACCOUNT_ID` (opsiyonel metadata)
- `WHATSAPP_TIMEOUT_MS` (opsiyonel)
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
- `WHATSAPP_WEBHOOK_APP_SECRET` (opsiyonel ama onerilir)

## Endpointler

- `POST /whatsapp/outbound` -> live modda provider uzerinden gercek gonderim denenir
- `POST /whatsapp/inbound` -> manual inbound
- `GET /whatsapp/webhook` -> verify token dogrulamasi
- `POST /whatsapp/webhook` -> inbound webhook alim foundation
- `GET /health/whatsapp` -> provider readiness

## Webhook

- Verify token eslesmezse `403`
- Signature aktifse (`WHATSAPP_WEBHOOK_APP_SECRET`) HMAC-SHA256 kontrol edilir

## Fallback

- Live konfig eksikse outbound mock queue'da kalir ve health `error` doner
- Provider hata verirse mesaj `failed` olarak isaretlenir ve hata notu saklanir
