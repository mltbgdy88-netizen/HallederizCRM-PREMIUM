# FastAPI Local AI Service

`apps/local-ai-service`, HallederizCRM-PREMIUM icin local-first AI servis foundation'idir. Eski `hallederizcrm-wa-clean/local-ai-backend` yapisindan port edilmistir ve varsayilan olarak kurum ici/local calismayi hedefler.

## Kapsam

- FastAPI tabanli local AI HTTP servisi
- Ollama uzerinden lokal LLM chat streaming
- RAG icin `sector_data.json` bilgi tabani
- STT icin Whisper tabanli ses transkripsiyon foundation'i
- TTS icin Piper/XTTS sesli yanit foundation'i
- Etiket/OCR pipeline foundation'i
- Localhost-only security guard
- CORS sadece localhost origin'leri

## Endpointler

- `GET /health`
- `POST /api/v1/rag/reload`
- `POST /api/v1/chat/text-stream`
- `POST /api/v1/chat/voice-stream`
- `POST /api/v1/tts/stream`
- `POST /api/v1/label/extract`

## Calistirma

Root seviyeden:

```powershell
pnpm local-ai:dev
```

Saglik kontrolu:

```powershell
pnpm local-ai:health
```

Servis varsayilan olarak `http://127.0.0.1:8008` uzerinde baslar.

## Ollama

Varsayilan LLM saglayicisi harici API degil, lokal Ollama'dir. Gerekli degiskenler:

```env
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.2:3b
```

Mevcut ortama uygun baska bir lokal model secilebilir.

## Ses dosyalari

Buyuk ses modeli binary'leri repo icine eklenmez. `start.ps1`, eksikse Piper Turkce modelini `apps/local-ai-service/assets/` altina indirir. Manuel kullanmak icin:

- `assets/tr_TR-dfki-medium.onnx`
- `assets/tr_TR-dfki-medium.onnx.json`

## Guvenlik

Servis varsayilan olarak sadece localhost istemcilerini kabul eder. Remote istemci acmak icin `LOCAL_AI_ALLOW_REMOTE=true` gerekir; pilot/production ortaminda bu varsayilan olarak kapali kalmalidir.

## Notlar

Bu klasor Node build/test zincirine otomatik dahil edilmez. Python dependency kurulumu ve servis calistirma gelistirici tarafindan ayrica yapilir.
