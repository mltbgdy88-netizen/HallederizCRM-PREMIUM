# Local Sales AI Real Ollama Activation

## Amaç
Bu faz, Local Sales AI asistanını gerçek Ollama modeliyle çalışır hale getirir. Production'da servis/model/repository hazır değilse sistem fake success vermez; `degraded`, `not_configured` veya `blocked` döner.

## Kurulu Model Bilgisi
- `RefinedNeuro/Turkcell-LLM-7b-v1:latest`
- `llama3.2:3b`

## Mimari Akış
- Sales chat: `API -> Ollama (11434)`
- Voice STT/TTS: `API -> local-ai-service (8008) -> Ollama/Piper/Whisper`
- Health smoke: 8008 ve 11434 ayrı kontrol edilir.

## Zorunlu Env
```env
LOCAL_AI_SERVICE_URL=http://127.0.0.1:8008
OLLAMA_BASE_URL=http://127.0.0.1:11434
SALES_AI_MODEL=RefinedNeuro/Turkcell-LLM-7b-v1:latest
SALES_AI_FALLBACK_MODEL=llama3.2:3b
LOCAL_AI_ALLOW_PUBLIC_URLS=false
```

## Güvenlik Notu
- Varsayılan allowlist: `localhost`, `127.0.0.1`, `::1`, private LAN blokları.
- Public URL varsayılan blokludur.
- Public endpoint sadece bilinçli kurulumda `LOCAL_AI_ALLOW_PUBLIC_URLS=true` ile açılabilir.

## Kurulum ve Başlatma
1. Ollama Desktop'ı çalıştırın.
2. Modelleri doğrulayın:
   - `ollama list`
3. local-ai-service başlatın:
   - `pnpm local-ai:dev`
4. Smoke çalıştırın:
   - `pnpm local-ai:smoke`

## Web Üzerinden Test
- `/ai` ekranında:
  - Sales Assistant Health banner
  - Intent + grounding + suggestedActions
  - Knowledge kayıtlarıyla “Bu bilgilerle asistanı dene”
  - Voice durumu (`degraded/not_configured` görünür)

## Sales Knowledge Eğitimi
- `/platform/ai/sales-knowledge` tenant-scoped CRUD
- Alanlar:
  - productName, productId, category, description, salesNotes
  - allowedClaims, blockedClaims
  - priceVisibility, stockVisibility
  - faqSnippets, selectedDocuments

## Voice Durumu
- STT/TTS provider hazır değilse açık reason döner.
- Fake transcript/audio üretilmez.

## Troubleshooting
- `8008 fetch failed`: local-ai-service kapalı veya erişilemiyor.
- `ollama_available_service_missing`: Ollama açık, local-ai-service kapalı.
- `sales_ai_models_not_found`: primary ve fallback model bulunamadı.
- `local_ai_url_not_allowed`: URL allowlist dışında.
- `local_ai_url_protocol_not_allowed`: http/https dışı protokol.
- Knowledge API `503`: persistence unsupported/degraded.

## Production Notları
- Kritik mutation AI tarafından doğrudan çalıştırılmaz.
- AI yalnızca öneri/taslak/onay akışına yönlendirir.
- `mutationExecuted` ve `externalProviderCallExecuted` false kalır.

