import type { SttProvider, SttTranscriptionMetadata, SttTranscriptionResult } from "../../contracts";

interface OpenAiTranscriptionResponse {
  text?: string;
  language?: string;
}

export class OpenAiSttProvider implements SttProvider {
  readonly providerName = "openai";

  constructor(
    private readonly apiKey: string,
    private readonly model: string
  ) {}

  async transcribeAudio(audioBuffer: Uint8Array, metadata?: SttTranscriptionMetadata): Promise<SttTranscriptionResult> {
    const form = new FormData();
    form.append("model", this.model);
    form.append("language", metadata?.language ?? "tr");
    const rawBytes = new Uint8Array(audioBuffer.byteLength);
    rawBytes.set(audioBuffer);
    form.append("file", new Blob([rawBytes], { type: metadata?.mimeType ?? "audio/webm" }), "voice.webm");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.apiKey}`
      },
      body: form
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`OpenAI STT failed: ${response.status} ${message}`);
    }

    const payload = (await response.json()) as OpenAiTranscriptionResponse;
    return {
      transcript: payload.text ?? "",
      detectedLanguage: payload.language ?? metadata?.language ?? "tr",
      confidence: 0.82,
      provider: this.providerName
    };
  }
}
