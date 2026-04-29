# AI Provider Config

## LLM

- `AI_LLM_PROVIDER=mock|openai`
- `OPENAI_API_KEY=...`
- `OPENAI_LLM_MODEL=gpt-4.1-mini` (ornek)

## STT

- `AI_STT_PROVIDER=mock|openai`
- `OPENAI_STT_MODEL=gpt-4o-mini-transcribe`

## TTS

- `AI_TTS_PROVIDER=mock|openai`
- `OPENAI_TTS_MODEL=gpt-4o-mini-tts`

## Davranis

- Provider `openai` secili ama `OPENAI_API_KEY` yoksa sistem otomatik fallback (`mock`) calisir.
- Bu fallback, UI davranisini bozmaz; sadece cevaplar gercek model yerine kontrollu mock olur.

## Guvenlik Notu

- API key repo icine yazilmaz.
- Ortam degiskenleri local `.env` / deployment secret store uzerinden verilir.

