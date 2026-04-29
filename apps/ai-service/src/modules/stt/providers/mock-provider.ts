import type { SttProvider, SttTranscriptionMetadata, SttTranscriptionResult } from "../../contracts";

export const mockSttProvider: SttProvider = {
  providerName: "mock",
  async transcribeAudio(_audioBuffer: Uint8Array, metadata?: SttTranscriptionMetadata): Promise<SttTranscriptionResult> {
    return {
      transcript: "Mock transcript: ses girdisi metne cevrildi.",
      detectedLanguage: metadata?.language ?? "tr",
      confidence: 0.7,
      provider: "mock"
    };
  }
};

