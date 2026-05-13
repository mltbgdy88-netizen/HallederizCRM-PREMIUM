# Local Sales AI Assistant & Voice Runtime

## Amaç
Bu paket, HallederizCRM içinde tenant scoped, local-first satýþ asistaný akýþýný ekler. Sistem local model yoksa veya servis eriþilemiyorsa fake success dönmez; `degraded` veya `not_configured` durumunu açýk döner.

## Yerel Model Standardý
- Varsayýlan model: `RefinedNeuro/Turkcell-LLM-7b-v1:latest`
- Fallback model: `llama3.2:3b`
- Ollama URL: `http://127.0.0.1:11434` (env ile deðiþtirilebilir)
- Generate parametreleri:
  - `temperature=0.2`
  - `top_p=0.8`
  - `repeat_penalty=1.15`
  - `num_predict=160`

## Önerilen Model Matrisi
- `qwen2.5:7b-instruct`: düþük donanýmda hýzlý yanýt
- `qwen2.5:14b-instruct`: daha güçlü niyet/baðlam kalitesi
- `llama3.2:3b`: düþük donaným fallback

## Kurulum
1. Ollama Desktop çalýþtýrýn.
2. Gerekli modelleri pull edin.
3. `LOCAL_AI_SERVICE_URL` ve `OLLAMA_BASE_URL` env deðerlerini doðrulayýn.
4. `pnpm local-ai:smoke` ile saðlýk kontrolü yapýn.

## Sales Knowledge Eðitimi
Tenant bazlý knowledge kayýtlarý:
- ürün adý/kategori/açýklama
- satýþ notlarý
- izinli ve yasak claim listeleri
- fiyat/stok görünürlük kurallarý
- FAQ ve seçili döküman referanslarý

API:
- `GET /platform/ai/sales-knowledge`
- `POST /platform/ai/sales-knowledge`
- `PATCH /platform/ai/sales-knowledge/:id`
- `DELETE /platform/ai/sales-knowledge/:id`

## Tenant Scoped Veri Güvenliði
- Tüm istekler auth + tenant context ile çalýþýr.
- Tenant dýþý knowledge eriþimi fail-closed.
- Production'da memory fallback kapalýdýr; repository yoksa `unsupported` döner.

## AI'nin Yapamayacaðý Ýþler
- Doðrudan sipariþ/teklif/ödeme/belge gönderimi yapmaz.
- Kritik iþlemleri yalnýzca öneri/taslak/onay akýþýna yönlendirir.
- Fiyat/stok görünürlüðü yoksa “Bu bilgi sistemde görünmüyor” yanýtý üretir.
- Uydurma veri üretmez.

## Omnichannel / WhatsApp Akýþý
- AI, müþteri yanýtý için öneri üretir.
- Live gönderim yapmaz; öneri/onay hattýna düþer.
- Provider unavailable durumunda açýk `degraded/not_configured` döner.

## Voice Akýþý
- STT: `POST /platform/ai/sales-assistant/voice/transcribe`
- TTS: `POST /platform/ai/sales-assistant/voice/speak`
- Local voice provider hazýr deðilse fake audio/transcript yok; `degraded` döner.

## Production Readiness Davranýþý
- Model veya provider eksikse `not_configured`
- Servis eriþim hatalarýnda `degraded`
- Mock baþarý, sessiz fallback veya fake live success yok
