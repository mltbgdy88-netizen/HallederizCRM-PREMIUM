import type { TtsProvider, TtsSpeakOptions, TtsSpeakResult } from "../../contracts";

export class OpenAiTtsProvider implements TtsProvider {
  readonly providerName = "openai";

  constructor(
    private readonly apiKey: string,
    private readonly model: string
  ) {}

  async speakText(text: string, options?: TtsSpeakOptions): Promise<TtsSpeakResult> {
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        input: text,
        voice: options?.voice ?? "alloy",
        speed: options?.speed ?? 1
      })
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`OpenAI TTS failed: ${response.status} ${message}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(audioBuffer).toString("base64");
    return {
      audioRef: `data:audio/mpeg;base64,${base64}`,
      provider: this.providerName,
      mimeType: "audio/mpeg"
    };
  }

  async listVoices() {
    return [
      { id: "alloy", name: "Alloy", language: "tr" },
      { id: "verse", name: "Verse", language: "tr" },
      { id: "marin", name: "Marin", language: "tr" }
    ];
  }
}

