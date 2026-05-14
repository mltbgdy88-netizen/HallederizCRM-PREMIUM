# Local Sales AI Assistant & Voice Runtime

## Amaç
Bu paket, HallederizCRM içinde tenant scoped, local-first satış asistanı akışını ekler. Sistem local model yoksa veya servis erişilemiyorsa fake success dönmez; `degraded` veya `not_configured` durumunu açık döner.

## Yerel Model Standardı
- Varsayılan model: `RefinedNeuro/Turkcell-LLM-7b-v1:latest`
- Fallback model: `llama3.2:3b`
- Ollama URL: `http://127.0.0.1:11434` (env ile değiştirilebilir)
- Generate parametreleri:
  - `temperature=0.2`
  - `top_p=0.8`
  - `repeat_penalty=1.15`
  - `num_predict=160`

## Önerilen Model Matrisi
- `qwen2.5:7b-instruct`: düşük donanımda hızlı yanıt
- `qwen2.5:14b-instruct`: daha güçlü niyet/bağlam kalitesi
- `llama3.2:3b`: düşük donanım fallback

## Kurulum
1. Ollama Desktop çalıştırın.
2. Gerekli modelleri pull edin.
3. `LOCAL_AI_SERVICE_URL` ve `OLLAMA_BASE_URL` env değerlerini doğrulayın.
4. Varsayılan güvenlik politikası gereği `LOCAL_AI_ALLOW_PUBLIC_URLS=false` bırakın.
5. `pnpm local-ai:smoke` ile sağlık kontrolü yapın.

## Local AI URL Güvenliği
- API tarafı `LOCAL_AI_SERVICE_URL` ve `OLLAMA_BASE_URL` için sadece `http/https` kabul eder.
- Varsayılan allowlist:
  - `localhost`
  - `127.0.0.1`
  - `::1`
  - `10.0.0.0/8`
  - `172.16.0.0/12`
  - `192.168.0.0/16`
- Public internet hostları varsayılan olarak engellenir ve `local_ai_url_not_allowed` ile `blocked/not_configured` döner.
- `LOCAL_AI_ALLOW_PUBLIC_URLS=true` yalnızca bilinçli deployment kararı ile açılmalıdır.
- URL parse/protocol/host hatalarında fake success dönmez; açık reason ile fail-closed davranılır.

## Sales Knowledge Eğitimi
Tenant bazlı knowledge kayıtları:
- ürün adı/kategori/açıklama
- satış notları
- izinli ve yasak claim listeleri
- fiyat/stok görünürlük kuralları
- FAQ ve seçili döküman referansları

API:
- `GET /platform/ai/sales-knowledge`
- `POST /platform/ai/sales-knowledge`
- `PATCH /platform/ai/sales-knowledge/:id`
- `DELETE /platform/ai/sales-knowledge/:id`

## Tenant Scoped Veri Güvenliği
- Tüm istekler auth + tenant context ile çalışır.
- Tenant dışı knowledge erişimi fail-closed.
- Production'da memory fallback kapalıdır; repository yoksa `unsupported` döner.

## AI'nin Yapamayacağı İşler
- Doğrudan sipariş/teklif/ödeme/belge gönderimi yapmaz.
- Kritik işlemleri yalnızca öneri/taslak/onay akışına yönlendirir.
- Fiyat/stok görünürlüğü yoksa “Bu bilgi sistemde görünmüyor” yanıtı üretir.
- Uydurma veri üretmez.

## Omnichannel / WhatsApp Akışı
- AI, müşteri yanıtı için öneri üretir.
- Live gönderim yapmaz; öneri/onay hattına düşer.
- Provider unavailable durumunda açık `degraded/not_configured` döner.

## Voice Akışı
- STT: `POST /platform/ai/sales-assistant/voice/transcribe`
- TTS: `POST /platform/ai/sales-assistant/voice/speak`
- Local voice provider hazır değilse fake audio/transcript yok; `degraded` döner.

## Production Readiness Davranışı
- Model veya provider eksikse `not_configured`
- Servis erişim hatalarında `degraded`
- Mock başarı, sessiz fallback veya fake live success yok
