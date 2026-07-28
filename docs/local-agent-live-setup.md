# Local Agent Live Setup

## Env Degiskenleri

- `LOCAL_AGENT_MODE=enabled|disabled`
- `LOCAL_OUTPUT_ROOT`
- `DEFAULT_PRINTER_NAME`
- `LOCAL_AGENT_AUTO_PRINT=true|false`
- `LOCAL_AGENT_SAFE_MODE=true|false`
- `LOCAL_AGENT_COPIES`
- `LOCAL_AGENT_API_BASE_URL`
- `LOCAL_AGENT_TENANT_ID`
- `LOCAL_AGENT_USER_ID`
- `LOCAL_AGENT_SESSION_TOKEN` (opsiyonel ama onerilir)
- `LOCAL_AGENT_POLL_INTERVAL_MS`
- `WHATSAPP_WEB_LOCAL_ENABLED=false` (varsayilan kapali; production ortaminda hard-deny)
- `LOCAL_AGENT_CONTROL_PORT=4319`
- `LOCAL_AGENT_CONTROL_TOKEN` (yerel kontrol uclari icin zorunlu; loglanmaz)

Opsiyonel alt klasor env:

- `LOCAL_SUBFOLDER_INVOICE`
- `LOCAL_SUBFOLDER_OFFER`
- `LOCAL_SUBFOLDER_DELIVERY`

## Akis

1. API: `POST /documents/:id/queue-save` veya `POST /documents/:id/queue-print`
2. Local agent kuyrugu poll eder (`/print-jobs`, `/file-save-jobs`)
3. Job status API'ye geri yazilir (`start/complete/fail`)
4. `GET /local-agent/status` ve `GET /health/local-agent` ile izlenir

### Job Lifecycle Audit

Print ve file-save gecisleri audit olayina yazilir:
- `local_output.print.start`
- `local_output.print.completed`
- `local_output.print.failed`
- `local_output.file_save.start`
- `local_output.file_save.completed`
- `local_output.file_save.failed`

## Fallback ve Guvenlik

- `LOCAL_AGENT_MODE=disabled` ise agent sadece disabled status raporlar
- `safe_mode=true` ise riskli otomatik aksiyonlar kapali tutulabilir
- Yazdirma basarisiz olursa job `failed` olur ve `errorMessage` saklanir

## Local WhatsApp Web Pairing Foundation

- Feature kimligi `whatsapp_web_local` olarak sabittir.
- Bu fazdaki pairing engine yalnizca bellek ici durum makinesidir; gercek WhatsApp Web kutuphanesi veya QR uretimi yoktur.
- Outbound mesaj adaptoru fail-closed calisir ve `providerCallExecuted=false` doner.
- Production ortaminda env degeri ne olursa olsun feature acilmaz.
- Secret, QR icerigi, token, auth state ve session verisi olay kaydina veya loglara eklenmez.

### Yerel Pairing Control Plane

- Sunucu yalnizca `127.0.0.1` adresine bind olur ve `Authorization: Bearer <LOCAL_AGENT_CONTROL_TOKEN>` ister.
- `GET /whatsapp-web-local/status`
- `POST /whatsapp-web-local/start`
- `POST /whatsapp-web-local/refresh`
- `POST /whatsapp-web-local/disconnect`
- `POST /whatsapp-web-local/logout`
- Tum yanitlar `Cache-Control: no-store` kullanir ve yalnizca `state`, `reasonCode`, `generation`, `providerCallExecuted`, `checkedAt` alanlarini dondurur.
- Feature kapaliysa durum `disabled` kalir. Production ortaminda tum mutasyon uclari hard-deny olur.
- Kontrol duzlemi gercek QR, auth-state, session saklama veya canli mesaj gonderimi yapmaz.
