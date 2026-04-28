import type { TtsAdapter } from "../contracts";
export const mockTtsAdapter: TtsAdapter = { async speakText() { return { audioRef: "mock://tts/audio" }; } };
export async function speakText(text: string) { return mockTtsAdapter.speakText({ text }); }
