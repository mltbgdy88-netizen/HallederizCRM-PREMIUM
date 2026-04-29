# Factory Live Setup

## Env Degiskenleri

- `FACTORY_PROVIDER=live`
- `FACTORY_API_BASE_URL`
- `FACTORY_API_KEY`
- `FACTORY_TIMEOUT_MS` (opsiyonel)

## Endpointler

- `POST /factories/:id/sync-stock`
- `POST /factory-orders/:id/send`
- `GET /health/factory`
- `GET /integrations/factories/health`

## Davranis

- Stok sync ve order send, live modda provider endpointlerine request atar.
- Basarisiz cagrida fallback sonuc + warning bilgisi doner.

## Fallback

- Live mode + base URL eksikse health `error`
- Provider baglanamazsa sync/send response icinde `provider=fallback` bilgisi gelir
