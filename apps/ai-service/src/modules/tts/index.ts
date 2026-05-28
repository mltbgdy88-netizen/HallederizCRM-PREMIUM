import type { TtsProvider, TtsSpeakOptions, TtsSpeakResult } from "../contracts";
import { mockTtsProvider } from "./providers/mock-provider";
import { OpenAiTtsProvider } from "./providers/openai-provider";

function resolveTtsProvider(): TtsProvider {
  const provider = process.env.AI_TTS_PROVIDER ?? "mock";
  if (provider === "openai" && process.env.OPENAI_API_KEY) {
    return new OpenAiTtsProvider(process.env.OPENAI_API_KEY, process.env.OPENAI_TTS_MODEL ?? "gpt-4o-mini-tts");
  }
  return mockTtsProvider;
}

export function validateTtsRequest(text: string, options?: TtsSpeakOptions) {
  if (!text || text.trim().length === 0) {
    throw new Error("Okunacak metin bos olamaz.");
  }
  if (options?.speed && (options.speed < 0.5 || options.speed > 2)) {
    throw new Error("Konusma hizi 0.5 ile 2 arasinda olmalidir.");
  }
}

export class TtsRuntime {
  constructor(private readonly provider: TtsProvider = resolveTtsProvider()) {}

  async speakText(text: string, options?: TtsSpeakOptions): Promise<TtsSpeakResult> {
    validateTtsRequest(text, options);
    return this.provider.speakText(text, options);
  }

  async listVoices() {
    return this.provider.listVoices();
  }
}

