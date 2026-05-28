# Voice Flow (STT/TTS, Local-First)

## STT Akisi

1. UI ses verisini base64 olarak gonderir.
2. `POST /ai/voice/transcribe`
3. API runtime:
   - provider `local` ise local transcribe davranisi
   - provider `openai` + key varsa external transcribe
   - diger durumlarda safe fallback transcript
4. UI transcript'i komut alanina veya sohbet akisina yazar.

## TTS Akisi

1. UI metni seslendirme talebi gonderir.
2. `POST /ai/voice/speak`
3. API runtime:
   - provider `local` ise local ses yaniti referansi
   - provider `openai` + key varsa external audio data
   - diger durumlarda safe fallback audio ref
4. UI ses oynatici bileşenine audioRef baglar.

## Endpointler

- `POST /ai/voice/transcribe`
  - request: `audioBase64`, `mimeType`, `language`
- `POST /ai/voice/speak`
  - request: `text`, `voice`, `speed`

## Notlar

- Varsayilan dil Turkce (`tr`).
- STT/TTS hata durumunda kontrollu mesaj ve fallback akisi korunur.
- Varsayilan mod local-first oldugu icin external provider zorunlu degildir.
- Mutation etkili sesli komutlar da proposal + approval + execution zincirine tabidir.
