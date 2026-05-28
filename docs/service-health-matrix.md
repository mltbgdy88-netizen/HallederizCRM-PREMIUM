# Service Health Matrix

## Ortak Response Modeli

Tum health endpointleri su alanlari dondurur:
- `status`: `healthy | degraded | fallback | disabled | misconfigured | error`
- `mode`: `live | fallback | disabled | mock`
- `configured`: boolean
- `reason`: aciklama
- `lastCheckedAt`: ISO zaman
- `details`: servis-ozel detaylar

## Servis Bazli Gereksinimler

### AI
- Required env (live): `OPENAI_API_KEY`, `AI_MODEL`, `AI_STT_MODEL`, `AI_TTS_MODEL`, `AI_TTS_VOICE`, `AI_TIMEOUT_MS`, `AI_RETRY_COUNT`
- Live kosulu: en az bir provider `openai` ve tum zorunlu env dolu
- Fallback: provider mock/fallback secilirse

### WhatsApp
- Required env (live): `WHATSAPP_API_BASE_URL`, `WHATSAPP_API_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_BUSINESS_ACCOUNT_ID`, `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
- Live kosulu: `WHATSAPP_PROVIDER=live` + env tam
- Fallback: provider mock veya env eksik

### ERP
- Required env (live): `ERP_API_BASE_URL`, `ERP_TIMEOUT_MS` + kimlik dogrulama (`ERP_API_KEY` veya `ERP_USERNAME+ERP_PASSWORD`)
- Live kosulu: `ERP_PROVIDER=live` + zorunlu alanlar tam
- Fallback: provider mock veya env eksik

### Factory
- Required env (live): `FACTORY_API_BASE_URL`, `FACTORY_API_KEY`, `FACTORY_TIMEOUT_MS`
- Live kosulu: `FACTORY_PROVIDER=live` + env tam
- Fallback: provider mock veya env eksik

### Local Agent
- Required env (enabled): `LOCAL_OUTPUT_ROOT`, `DEFAULT_PRINTER_NAME`, `LOCAL_AGENT_POLL_INTERVAL_MS`
- Disabled kosulu: `LOCAL_AGENT_MODE=disabled`
- Live kosulu: enabled + env tam
- Fallback: enabled ama env eksik

## Toplu Ozet
- Endpoint: `GET /health/integrations`
- Donen alanlar:
  - `status`
  - `configuredCount`
  - `liveCount`
  - `fallbackCount`
  - `disabledCount`
  - `services[]`

