# 010 - Local AI Service Port

## Amaç

Bu değişiklik, eski `mltbgdy88-netizen/hallederizcrm-wa-clean` reposundaki `local-ai-backend` servisinin foundation yapısını HallederizCRM-PREMIUM monorepo içine taşır. Hedef, AI stratejisinde local-first / açık kaynak / kurum içi çalışma kararını somut bir servis klasörü ve API provider contract ile desteklemektir.

## Port edilen parçalar

- `local-ai-backend/app/*` -> `apps/local-ai-service/app/*`
- `local-ai-backend/requirements.txt` -> `apps/local-ai-service/requirements.txt`
- `local-ai-backend/sector_data.json` -> `apps/local-ai-service/sector_data.json`
- `local-ai-backend/start.ps1` -> `apps/local-ai-service/start.ps1`
- Yeni servis dokümanı -> `apps/local-ai-service/README.md`

Büyük TTS model binary dosyaları repo içine eklenmedi. `assets/.gitkeep` yer tutucu olarak bırakıldı; model dosyaları geliştirici makinesinde indirilecek veya ayrıca sağlanacaktır.

## Local-first AI hedefi

Birincil AI çalışma modu lokal servistir. Bu servis:

- Ollama ile lokal LLM çalıştırır.
- RAG için yerel sektör verisini kullanır.
- STT/TTS foundation'ını localhost üzerinde tutar.
- Harici LLM API'lerini varsayılan kabul etmez.
- CRM API katmanından kontrollü provider olarak çağrılabilir.

OpenAI ve benzeri harici provider'lar opsiyonel kalır.

## API provider contract

API tarafında şu env alanları eklendi:

```env
AI_PROVIDER=mock
LOCAL_AI_SERVICE_URL=http://127.0.0.1:8008
LOCAL_AI_TIMEOUT_MS=30000
```

`AI_PROVIDER=local` olduğunda `AiRuntimeService` şu foundation davranışları destekler:

- Lokal AI health check (`GET /health`)
- Yazılı prompt forward (`POST /api/v1/chat/text-stream`)
- Servis erişilemezse kontrollü degraded response
- Mock/OpenAI davranışlarını bozmadan provider seçimi

## Güvenlik

Local AI servisi varsayılan olarak localhost-only çalışır. CORS listesi sadece localhost origin'lerini içerir. Remote erişim ancak açık flag ile etkinleştirilebilir ve production/pilot ortamlarında varsayılan olarak kapalı kalmalıdır.

## Bu turda yapılmayanlar

- Frontend voice UI binding
- Full AI command execution
- WhatsApp AI intent execution
- Harici provider rewrite
- Hızlı İşlem Merkezi geliştirmesi
- Python dependency kurulumunun CI'a bağlanması

## Sonraki iş

Sıradaki yol haritası maddesi Hızlı İşlem Merkezi frontend foundation'dır. Local AI tarafında sonraki mantıklı adım, CRM context builder ve WhatsApp AI intent akışlarının bu local provider contract üzerinden kontrollü şekilde bağlanmasıdır.
