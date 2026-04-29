# AI Runtime Architecture

Bu mimari, AI katmanini 3 ayri entegrasyon katmanina boler:

1. LLM (yanit/proposal/insight)
2. STT (ses -> metin)
3. TTS (metin -> ses)

## Katmanlar

- `apps/ai-service/src/modules/contracts`
  - Ortak runtime contract'lari.
- `apps/ai-service/src/modules/llm`
  - Provider abstraction (`mock`, `openai`)
  - Prompt builder ve structured parser.
- `apps/ai-service/src/modules/stt`
  - Ses transkripsiyon provider abstraction.
- `apps/ai-service/src/modules/tts`
  - Ses uretim provider abstraction.
- `apps/ai-service/src/modules/proposals`
  - Proposal engine + approval draft baglantisi.
- `apps/ai-service/src/modules/insights`
  - Insight engine.
- `apps/ai-service/src/modules/execution`
  - Approval execution guard/result helper.

## API Runtime Bridge

`apps/api/src/modules/ai-runtime/service.ts` AI endpointleri icin runtime bridge gorevi gorur:

- `chat`
- `generateProposal`
- `generateInsights`
- `transcribeVoice`
- `speakVoice`

Bu bridge, provider env yoksa controlled fallback doner.

