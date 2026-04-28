import { buildAiInsightCard, buildAiProposal, buildApprovalFromAiProposal, buildDocumentSaveJob, buildLocalOutputRule, buildPrintJob } from "@hallederiz/domain";
import type { AiInsight, AiMessage, AiProposal, Approval, ApprovalExecution, FileSaveJob, LocalAgentStatus, LocalOutputRule, PrintJob } from "@hallederiz/types";

const tenantId = "tenant_1";
const now = "2026-04-28T12:00:00.000Z";

const baseProposal = buildAiProposal({ tenantId, sessionId: "ai_session_1", requestText: "Mira Yapi icin tahsilat follow-up mesaji olustur ve WhatsApp'tan gonder", requestedBy: "user_1", requestedByName: "Mevlut", targetType: "customer", targetId: "customer_2", targetNo: "CUS-002" });
baseProposal.id = "ai_proposal_1"; baseProposal.proposalNo = "AI-401"; baseProposal.approvalId = "approval_ai_1";

const readonlyProposal = buildAiProposal({ tenantId, sessionId: "ai_session_1", requestText: "Geciken tahsilatlari ozetle", requestedBy: "user_1", requestedByName: "Mevlut", targetType: "customer", targetId: "customer_2", targetNo: "CUS-002" });
readonlyProposal.id = "ai_proposal_2"; readonlyProposal.proposalNo = "AI-402";

export const aiMessages: AiMessage[] = [
  { id: "ai_msg_1", tenantId, sessionId: "ai_session_1", role: "user", inputMode: "text", body: "Geciken tahsilatlari ozetle.", createdAt: "2026-04-28T11:00:00.000Z" },
  { id: "ai_msg_2", tenantId, sessionId: "ai_session_1", role: "assistant", inputMode: "text", body: "Son 7 gunde 4 cari vade asimi riski tasiyor. Read-only ozet hazir.", createdAt: "2026-04-28T11:00:05.000Z", proposalId: "ai_proposal_2" },
  { id: "ai_msg_3", tenantId, sessionId: "ai_session_1", role: "assistant", inputMode: "text", body: "Mira Yapi icin tahsilat follow-up mutation onerisi onay bekliyor.", createdAt: "2026-04-28T11:02:00.000Z", proposalId: "ai_proposal_1" }
];

export const aiProposals: AiProposal[] = [baseProposal, readonlyProposal];
const approvalDraft = buildApprovalFromAiProposal(baseProposal);
export const aiApprovals: Approval[] = [{ ...approvalDraft, id: "approval_ai_1", approvalNo: "APR-AI-401" }];
export const approvalExecutions: ApprovalExecution[] = [{ id: "approval_exec_1", tenantId, approvalId: "approval_ai_1", proposalId: "ai_proposal_1", targetType: "ai_proposal", targetId: "ai_proposal_1", operationType: "send_document_whatsapp", status: "authorized", requestedBy: "user_1", authorizedBy: "user_2", createdAt: now, authorizedAt: now }];

export const aiInsights: AiInsight[] = [
  { id: "ai_insight_1", tenantId, title: "Riskli cari: Mira Yapi", category: "risk", severity: "critical", confidence: 0.84, summary: "Yuksek bakiye ve geciken tahsilat birlikte goruluyor.", targetType: "customer", targetId: "customer_2", targetNo: "CUS-002", suggestedAction: "send_document_whatsapp", createdAt: now },
  { id: "ai_insight_4", tenantId, title: "Tahsilat onceligi: Kuzey Insaat", category: "payment", severity: "critical", confidence: 0.88, summary: "Blokeli risk ve yuksek borc nedeniyle yonetici onayli follow-up onerilir.", targetType: "customer", targetId: "customer_8", targetNo: "CUS-008", suggestedAction: "create_payment", createdAt: now },
  { id: "ai_insight_5", tenantId, title: "Operasyon hatirlatmasi: SO-2455", category: "operation", severity: "warning", confidence: 0.79, summary: "Hazir siparis teslimata alinmazsa musteri bildirimi gecikecek.", targetType: "order", targetId: "order_5", targetNo: "SO-2455", suggestedAction: "complete_delivery", createdAt: now },
  { id: "ai_insight_2", tenantId, title: "Kritik stok egilimi: DK-2022", category: "stock", severity: "warning", confidence: 0.81, summary: "Merkez stok ve siparis hizi kritiklesme sinyali veriyor.", targetType: "product", targetId: "prod_2", targetNo: "DK-2022", suggestedAction: "create_order", createdAt: now },
  { id: "ai_insight_3", tenantId, title: "Fabrika takibi gecikiyor", category: "factory", severity: "warning", confidence: 0.76, summary: "FO-214 icin durum guncellemesi stale.", targetType: "factory_order", targetId: "factory_order_2", targetNo: "FO-214", suggestedAction: "create_order", createdAt: now }
];

export const localOutputRules: LocalOutputRule[] = [
  buildLocalOutputRule({ tenantId, documentType: "invoice_pdf", subfolder: "Faturalar", printerName: "Ofis-Laser-01", autoPrint: true }),
  buildLocalOutputRule({ tenantId, documentType: "offer_pdf", subfolder: "Teklifler", autoPrint: false }),
  buildLocalOutputRule({ tenantId, documentType: "delivery_note_pdf", subfolder: "Teslimatlar", autoPrint: true })
];
const defaultOutputRule = localOutputRules[0] ?? buildLocalOutputRule({ tenantId, documentType: "invoice_pdf" });
export const fileSaveJobs: FileSaveJob[] = [buildDocumentSaveJob({ tenantId, documentId: "document_1", documentType: "invoice_pdf", rootFolder: "C:\\HallederizCRM\\Belgeler", rule: defaultOutputRule, fileName: "INV-2026-001.pdf" })];
export const printJobs: PrintJob[] = [buildPrintJob({ tenantId, documentId: "document_1", documentType: "invoice_pdf", rule: defaultOutputRule })];
export const localAgentStatus: LocalAgentStatus = "safe_mode";

export function getAiAssistantData() { return { messages: aiMessages, proposals: aiProposals, approvals: aiApprovals, executions: approvalExecutions, insights: aiInsights, insightCards: aiInsights.map(buildAiInsightCard) }; }
export function getAiProposalById(id?: string) { return aiProposals.find((proposal) => proposal.id === id || proposal.proposalNo === id) ?? aiProposals[0]; }
export function getAiSettingsData() { return { readOnlyDefault: true, approvalRequiredForMutations: true, allowedChannels: ["crm_ui", "whatsapp", "mobile"], voiceEnabled: true, insightFrequency: "gunluk", localOutputRules, fileSaveJobs, printJobs, localAgentStatus, rootFolder: "C:\\HallederizCRM\\Belgeler" }; }
