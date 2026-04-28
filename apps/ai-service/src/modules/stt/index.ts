import type { SttAdapter } from "../contracts";
export const mockSttAdapter: SttAdapter = { async transcribeAudio() { return "Ses girdisi mock olarak metne cevrildi."; } };
export async function transcribeAudio(input: Parameters<SttAdapter["transcribeAudio"]>[0]) { return mockSttAdapter.transcribeAudio(input); }
