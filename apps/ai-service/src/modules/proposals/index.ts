import { buildAiProposal } from "@hallederiz/domain";
export function generateProposal(prompt: string) { return buildAiProposal({ tenantId: "tenant_1", sessionId: "ai_session_service", requestText: prompt, requestedBy: "user_1", requestedByName: "AI Operator", targetType: "customer", targetId: "customer_2", targetNo: "CUS-002" }); }
