# Voice Flow (STT/TTS)

## STT Akisi

1. UI ses verisini base64 olarak gonderir.
2. `POST /ai/voice/transcribe`
3. API runtime:
   - provider `openai` + key varsa gercek transcribe
   - yoksa mock transcript fallback
4. UI transcript'i komut alanina veya sohbet akisina yazar.

## TTS Akisi

1. UI metni seslendirme talebi gonderir.
2. `POST /ai/voice/speak`
3. API runtime:
   - provider `openai` + key varsa audio data
   - yoksa mock audio ref fallback
4. UI ses oynatici bileşenine audioRef baglar.

## Endpointler

- `POST /ai/voice/transcribe`
  - request: `audioBase64`, `mimeType`, `language`
- `POST /ai/voice/speak`
  - request: `text`, `voice`, `speed`

## Notlar

- Varsayilan dil Turkce (`tr`).
- STT/TTS hata durumunda kontrollu mesaj ve fallback akisi korunur.

