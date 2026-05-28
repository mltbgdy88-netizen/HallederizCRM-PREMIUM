# OpenAI Live Setup

## Gerekli env
- OPENAI_API_KEY
- AI_LLM_PROVIDER=openai
- AI_STT_PROVIDER=openai
- AI_TTS_PROVIDER=openai
- AI_MODEL
- AI_STT_MODEL
- AI_TTS_MODEL
- AI_TTS_VOICE
- AI_TIMEOUT_MS
- AI_RETRY_COUNT

## Aktivasyon
1. Env alanlarini doldurun.
2. `/ayarlar/staging-kontrol` ekraninda AI testlerini calistirin.
3. `GET /health/ai` sonucunda `mode=live` ve `status=healthy` beklenir.

## Test endpointleri
- `POST /health/ai/test-chat`
- `POST /health/ai/test-stt`
- `POST /health/ai/test-tts`

## Hata durumunda
- Eksik key/model durumunda AI fallback modunda calisir.
- Uygulama durmaz; cevaplar kontrollu fallback olarak doner.
