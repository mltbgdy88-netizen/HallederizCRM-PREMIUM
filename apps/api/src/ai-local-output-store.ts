import type { AiInsight, AiMessage, AiProposal, ApprovalExecution, FileSaveJob, LocalOutputRule, PrintJob } from "@hallederiz/types";

const now = "2026-04-28T12:00:00.000Z";
const tenantId = "tenant_1";
const aiProposals: AiProposal[] = [{ id: "ai_proposal_1", tenantId, proposalNo: "AI-401", sessionId: "ai_session_api", status: "waiting_approval", actionType: "send_document_whatsapp", channel: "crm_ui", inputMode: "text", title: "AI aksiyon onerisi", summary: "Mira Yapi icin tahsilat follow-up mesaji onerisi", requestedBy: "user_1", requestedByName: "Mevlut", targetType: "customer", targetId: "customer_2", targetNo: "CUS-002", requiresApproval: true, approvalId: "approval_ai_1", createdAt: now, updatedAt: now, operations: [{ id: "ai_op_1", type: "send_document_whatsapp", targetType: "customer", targetId: "customer_2", targetNo: "CUS-002", mutation: true, summary: "WhatsApp follow-up gonder", payload: { template: "PAYMENT_FOLLOWUP" } }] }];
const aiInsights: AiInsight[] = [{ id: "ai_insight_1", tenantId, title: "Riskli cari", category: "risk", severity: "critical", confidence: 0.84, summary: "Yuksek bakiye ve geciken tahsilat.", targetType: "customer", targetId: "customer_2", targetNo: "CUS-002", suggestedAction: "send_document_whatsapp", createdAt: now }];
const approvalExecutions: ApprovalExecution[] = [{ id: "approval_exec_1", tenantId, approvalId: "approval_ai_1", proposalId: "ai_proposal_1", targetType: "ai_proposal", targetId: "ai_proposal_1", operationType: "send_document_whatsapp", status: "authorized", requestedBy: "user_1", authorizedBy: "user_2", createdAt: now, authorizedAt: now }];
const localOutputRules: LocalOutputRule[] = [{ id: "local_rule_invoice_pdf", tenantId, documentType: "invoice_pdf", destination: "both", subfolder: "Faturalar", autoSave: true, autoPrint: true, printerName: "Ofis-Laser-01", copies: 1, safeMode: true, active: true }];
const printJobs: PrintJob[] = [{ id: "print_document_1", tenantId, documentId: "document_1", documentType: "invoice_pdf", status: "queued", printerName: "Ofis-Laser-01", copies: 1, queuedAt: now }];
const fileSaveJobs: FileSaveJob[] = [{ id: "file_save_document_1", tenantId, documentId: "document_1", documentType: "invoice_pdf", status: "queued", targetFolder: "C:\\HallederizCRM\\Belgeler\\Faturalar", fileName: "INV-2026-001.pdf", queuedAt: now }];

export function chatAi(body: { message?: string }) { const message: AiMessage = { id: `ai_msg_api_${Date.now()}`, tenantId, sessionId: "ai_session_api", role: "assistant", inputMode: "text", body: `Mock AI cevap: ${body.message ?? ""}`, createdAt: new Date().toISOString() }; return { message, proposals: aiProposals }; }
export function parseAiCommand(body: { text?: string }) { const text = body.text ?? ""; return { text, mutation: /olustur|gonder|tamamla|kaydet|tahsilat/.test(text.toLocaleLowerCase("tr-TR")), parsedAt: new Date().toISOString() }; }
export function listAiProposals() { return aiProposals; }
export function getAiProposal(id: string) { return aiProposals.find((proposal) => proposal.id === id || proposal.proposalNo === id); }
export function updateAiProposalStatus(id: string, status: AiProposal["status"]) { const proposal = getAiProposal(id); if (!proposal) return null; proposal.status = status; proposal.updatedAt = new Date().toISOString(); return proposal; }
export function listAiInsights() { return aiInsights; }
export function runAiInsights() { return { items: aiInsights, generatedAt: new Date().toISOString() }; }
export function listApprovalExecutions() { return approvalExecutions; }
export function getApprovalExecution(id: string) { return approvalExecutions.find((execution) => execution.id === id); }
export function createApprovalExecution(body: Partial<ApprovalExecution>) { const execution = { ...approvalExecutions[0], ...body, id: `approval_exec_${approvalExecutions.length + 1}`, createdAt: new Date().toISOString() } as ApprovalExecution; approvalExecutions.push(execution); return execution; }
export function runApprovalExecution(id: string) { const execution = getApprovalExecution(id); if (!execution) return null; execution.status = "executed"; execution.executedAt = new Date().toISOString(); return execution; }
export function cancelApprovalExecution(id: string) { const execution = getApprovalExecution(id); if (!execution) return null; execution.status = "cancelled"; return execution; }
export function listLocalOutputRules() { return localOutputRules; }
export function patchLocalOutputRules(body: LocalOutputRule[]) { localOutputRules.splice(0, localOutputRules.length, ...body); return localOutputRules; }
export function listPrintJobs() { return printJobs; }
export function listFileSaveJobs() { return fileSaveJobs; }
export function queueDocumentSave(documentId: string) { const job = { ...fileSaveJobs[0], id: `file_save_${documentId}`, documentId, queuedAt: new Date().toISOString(), status: "queued" } as FileSaveJob; fileSaveJobs.push(job); return job; }
export function queueDocumentPrint(documentId: string) { const job = { ...printJobs[0], id: `print_${documentId}`, documentId, queuedAt: new Date().toISOString(), status: "queued" } as PrintJob; printJobs.push(job); return job; }
