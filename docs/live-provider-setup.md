# Canli Provider Setup

Bu dokuman pilot tenant icin canli servis baglantilarini acma adimlarini ozetler.

## Ortak Prensip

- Varsayilan mod fallback/mock calisir.
- Provider `live` secildiginde env eksikse sistem guvenli fallback + health error dondurur.
- Tum baglantilar tenant/user context ile API uzerinden cagrilir.

## AI (OpenAI)

Gerekli env:

- `OPENAI_API_KEY`
- `AI_LLM_PROVIDER=openai`
- `AI_STT_PROVIDER=openai`
- `AI_TTS_PROVIDER=openai`
- `AI_MODEL` (opsiyonel)
- `AI_STT_MODEL` (opsiyonel)
- `AI_TTS_MODEL` (opsiyonel)
- `AI_TTS_VOICE` (opsiyonel)
- `AI_TIMEOUT_MS` (opsiyonel, default `15000`)
- `AI_RETRY_COUNT` (opsiyonel, default `1`)

Kontrol endpointi:

- `GET /health/ai`

## Integrations Health

Toplu durum:

- `GET /health/integrations`

Tekil durumlar:

- `GET /health/whatsapp`
- `GET /health/erp`
- `GET /health/factory`
- `GET /health/local-agent`

## Fallback Davranisi

- AI key yoksa: `status=error`, `mode=fallback`
- Live WhatsApp/ERP/Factory env eksikse: ilgili health `error`
- Local agent offline/safe-mode ise health warning/error dondurur
