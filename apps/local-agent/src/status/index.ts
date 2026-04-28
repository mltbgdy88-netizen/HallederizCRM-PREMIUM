import type { LocalAgentStatus } from "@hallederiz/types";
export function reportLocalStatus(): { status: LocalAgentStatus; version: string; checkedAt: string } { return { status: "safe_mode", version: "0.1.0-foundation", checkedAt: new Date().toISOString() }; }
