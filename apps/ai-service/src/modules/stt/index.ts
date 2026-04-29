import type { SttProvider, SttTranscriptionMetadata, SttTranscriptionResult } from "../contracts";
import { mockSttProvider } from "./providers/mock-provider";
import { OpenAiSttProvider } from "./providers/openai-provider";

function resolveSttProvider(): SttProvider {
  const provider = process.env.AI_STT_PROVIDER ?? "mock";
  if (provider === "openai" && process.env.OPENAI_API_KEY) {
    return new OpenAiSttProvider(process.env.OPENAI_API_KEY, process.env.OPENAI_STT_MODEL ?? "gpt-4o-mini-transcribe");
  }
  return mockSttProvider;
}

export function normalizeTranscript(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

export function validateAudioBuffer(audioBuffer: Uint8Array) {
  if (!audioBuffer || audioBuffer.byteLength === 0) {
    throw new Error("Ses verisi bos olamaz.");
  }
}

export class SttRuntime {
  constructor(private readonly provider: SttProvider = resolveSttProvider()) {}

  async transcribeAudio(audioBuffer: Uint8Array, metadata?: SttTranscriptionMetadata): Promise<SttTranscriptionResult> {
    validateAudioBuffer(audioBuffer);
    const result = await this.provider.transcribeAudio(audioBuffer, metadata);
    return {
      ...result,
      transcript: normalizeTranscript(result.transcript)
    };
  }

  detectSpeech(audioBuffer: Uint8Array) {
    return audioBuffer.byteLength > 128;
  }
}

