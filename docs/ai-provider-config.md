# AI Provider Config (Local-First)

## 1. Resmi Strateji
- Varsayilan AI modu: `local-first`
- External provider (OpenAI vb.): `opsiyonel`
- Runtime onceligi: `local -> external -> safe fallback`

## 2. LLM Provider
- `AI_LLM_PROVIDER=local|openai|mock`
- Varsayilan: `local`
- External secenegi:
  - `OPENAI_API_KEY=...`
  - `AI_MODEL=...` (veya `OPENAI_LLM_MODEL`)

## 3. STT Provider
- `AI_STT_PROVIDER=local|openai|mock`
- Varsayilan: `local`
- External secenegi:
  - `AI_STT_MODEL=...` (veya `OPENAI_STT_MODEL`)

## 4. TTS Provider
- `AI_TTS_PROVIDER=local|openai|mock`
- Varsayilan: `local`
- External secenegi:
  - `AI_TTS_MODEL=...` (veya `OPENAI_TTS_MODEL`)
  - `AI_TTS_VOICE=...`

## 5. Ortak Runtime Ayarlari
- `AI_TIMEOUT_MS`
- `AI_RETRY_COUNT`

## 6. Davranis Kurallari
- `local` seciliyse local provider birincil olarak calisir.
- `openai` secili ama key/model eksikse local veya fallback moda guvenli gecis yapilir.
- `mock` sadece kontrollu demo/fallback icindir.

## 7. Guvenlik
- Secretlar repoya yazilmaz.
- API keyler sadece `.env` veya deployment secret store uzerinden verilir.
- Mutation istekleri providerdan bagimsiz olarak approval zorunluluguna tabidir.
