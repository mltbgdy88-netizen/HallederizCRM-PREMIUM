# ERP Live Setup

## Env Degiskenleri

- `ERP_PROVIDER=live`
- `ERP_API_BASE_URL`
- `ERP_API_KEY` (veya)
- `ERP_USERNAME`
- `ERP_PASSWORD`
- `ERP_TIMEOUT_MS` (opsiyonel)

## Endpointler

- `POST /erp/connections/:id/test`
- `POST /erp/connections/:id/sync`
- `GET /health/erp`

## Davranis

- `test`: live modda `/health` cagrisi denenir.
- `sync`: live modda `/sync` cagrisi denenir, basarisizsa fallback preview doner.
- Mapping/log ekranlari mevcut contract ile calismaya devam eder.

## Fallback

- Live mode + eksik `ERP_API_BASE_URL` -> health `error`
- Provider timeout/hata -> sync sonucu `provider=fallback` + warning mesaji
