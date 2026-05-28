import type { TtsProvider, TtsSpeakOptions, TtsSpeakResult } from "../../contracts";

export const mockTtsProvider: TtsProvider = {
  providerName: "mock",
  async speakText(text: string, _options?: TtsSpeakOptions): Promise<TtsSpeakResult> {
    const id = Date.now();
    return {
      audioRef: `mock://tts/${id}?text=${encodeURIComponent(text.slice(0, 40))}`,
      provider: "mock",
      mimeType: "audio/mpeg"
    };
  },
  async listVoices() {
    return [
      { id: "tr-female-1", name: "Turkce Kadin 1", language: "tr" },
      { id: "tr-male-1", name: "Turkce Erkek 1", language: "tr" }
    ];
  }
};

