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
