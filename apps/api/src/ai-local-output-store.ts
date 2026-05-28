import type {
  AiInsight,
  AiMessage,
  AiProposal,
  ApprovalExecution,
  FileSaveJob,
  LocalAgentStatus,
  LocalOutputRule,
  PrintJob
} from "@hallederiz/types";
import { createOffer } from "./sales-crm/mock-store";
import {
  completeDelivery,
  createInvoice,
  createOrder,
  createPayment,
  createReturn,
  getOrder,
  markWarehouseOrderPrepared,
  patchOrder,
  sendDocumentWhatsApp
} from "./commercial-operations/mock-store";
import { recordAuditEvent } from "./shared/audit-timeline";
import type { RequestContext } from "./shared/request-context";

const now = "2026-04-28T12:00:00.000Z";
const tenantId = "tenant_1";

const aiProposals: AiProposal[] = [
  {
    id: "ai_proposal_1",
    tenantId,
    proposalNo: "AI-401",
    sessionId: "ai_session_api",
    status: "waiting_approval",
    actionType: "send_document_whatsapp",
    channel: "crm_ui",
    inputMode: "text",
    title: "AI aksiyon onerisi",
    summary: "Mira Yapi icin tahsilat follow-up mesaji onerisi",
    requestedBy: "user_1",
    requestedByName: "Mevlut",
    targetType: "customer",
    targetId: "customer_2",
    targetNo: "CUS-002",
    requiresApproval: true,
    approvalId: "approval_ai_1",
    createdAt: now,
    updatedAt: now,
    operations: [
      {
        id: "ai_op_1",
        type: "send_document_whatsapp",
        targetType: "customer",
        targetId: "customer_2",
        targetNo: "CUS-002",
        mutation: true,
        summary: "WhatsApp follow-up gonder",
        payload: { template: "PAYMENT_FOLLOWUP" }
      }
    ]
  }
];

const aiInsights: AiInsight[] = [
  {
    id: "ai_insight_1",
    tenantId,
    title: "Riskli cari",
    category: "risk",
    severity: "critical",
    confidence: 0.84,
    summary: "Yuksek bakiye ve geciken tahsilat.",
    targetType: "customer",
    targetId: "customer_2",
    targetNo: "CUS-002",
    suggestedAction: "send_document_whatsapp",
    createdAt: now
  }
];

const approvalExecutions: ApprovalExecution[] = [
  {
    id: "approval_exec_1",
    tenantId,
    approvalId: "approval_ai_1",
    proposalId: "ai_proposal_1",
    targetType: "ai_proposal",
    targetId: "ai_proposal_1",
    operationType: "send_document_whatsapp",
    status: "authorized",
    requestedBy: "user_1",
    authorizedBy: "user_2",
    createdAt: now,
    authorizedAt: now
  }
];

const localOutputRules: LocalOutputRule[] = [
  {
    id: "local_rule_invoice_pdf",
    tenantId,
    documentType: "invoice_pdf",
    destination: "both",
    subfolder: "Faturalar",
    autoSave: true,
    autoPrint: true,
    printerName: "Ofis-Laser-01",
    copies: 1,
    safeMode: true,
    active: true
  }
];

const printJobs: PrintJob[] = [
  {
    id: "print_document_1",
    tenantId,
    documentId: "document_1",
    documentType: "invoice_pdf",
    status: "queued",
    printerName: "Ofis-Laser-01",
    copies: 1,
    queuedAt: now
  }
];

const fileSaveJobs: FileSaveJob[] = [
  {
    id: "file_save_document_1",
    tenantId,
    documentId: "document_1",
    documentType: "invoice_pdf",
    status: "queued",
    targetFolder: "C:\\HallederizCRM\\Belgeler\\Faturalar",
    fileName: "INV-2026-001.pdf",
    queuedAt: now
  }
];

const localAgentState: { status: LocalAgentStatus; version: string; checkedAt: string; message?: string } = {
  status: "safe_mode",
  version: "0.1.0-foundation",
  checkedAt: now,
  message: "Local agent beklemede."
};

function classifyExecutionFailure(error: unknown): { retryable: boolean; message: string } {
  const message = error instanceof Error ? error.message : "Execution failed";
  const retryableHints = ["timeout", "network", "ECONN", "rate limit", "temporarily"];
  const retryable = retryableHints.some((hint) => message.toLowerCase().includes(hint.toLowerCase()));
  return { retryable, message };
}

export function chatAi(body: { message?: string }) {
  const message: AiMessage = {
    id: `ai_msg_api_${Date.now()}`,
    tenantId,
    sessionId: "ai_session_api",
    role: "assistant",
    inputMode: "text",
    body: `Mock AI cevap: ${body.message ?? ""}`,
    createdAt: new Date().toISOString()
  };
  return { message, proposals: aiProposals };
}

export function parseAiCommand(body: { text?: string }) {
  const text = body.text ?? "";
  return {
    text,
    mutation: /olustur|gonder|tamamla|kaydet|tahsilat/.test(text.toLocaleLowerCase("tr-TR")),
    parsedAt: new Date().toISOString()
  };
}

export function listAiProposals() {
  return aiProposals;
}

export function saveAiProposal(proposal: AiProposal) {
  aiProposals.unshift(proposal);
  return proposal;
}

export function getAiProposal(id: string) {
  return aiProposals.find((proposal) => proposal.id === id || proposal.proposalNo === id);
}

export function updateAiProposalStatus(id: string, status: AiProposal["status"]) {
  const proposal = getAiProposal(id);
  if (!proposal) return null;
  proposal.status = status;
  proposal.updatedAt = new Date().toISOString();
  return proposal;
}

export function listAiInsights() {
  return aiInsights;
}

export function replaceAiInsights(nextInsights: AiInsight[]) {
  aiInsights.splice(0, aiInsights.length, ...nextInsights);
  return aiInsights;
}

export function runAiInsights() {
  return { items: aiInsights, generatedAt: new Date().toISOString() };
}

export function listApprovalExecutions() {
  return approvalExecutions;
}

export function getApprovalExecution(id: string) {
  return approvalExecutions.find((execution) => execution.id === id);
}

export function createApprovalExecution(body: Partial<ApprovalExecution>) {
  const execution = {
    ...approvalExecutions[0],
    ...body,
    id: `approval_exec_${approvalExecutions.length + 1}`,
    createdAt: new Date().toISOString()
  } as ApprovalExecution;
  approvalExecutions.push(execution);
  return execution;
}

export function runApprovalExecution(id: string) {
  const execution = getApprovalExecution(id);
  if (!execution) return null;
  const actorContext: RequestContext = {
    tenantId: execution.tenantId,
    userId: execution.authorizedBy ?? execution.requestedBy,
    persistenceMode: process.env.PERSISTENCE_MODE === "postgres" ? "postgres" : "demo",
    isAuthenticated: true,
    roles: ["admin"],
    permissions: ["*"]
  };

  try {
    const operation = execution.operationType;
    const proposal = execution.proposalId ? getAiProposal(execution.proposalId) : undefined;
    const payload = proposal?.operations.find((item) => item.type === operation)?.payload ?? {};

    const actionMap: Record<string, () => unknown> = {
      create_offer: () => createOffer(payload as never),
      create_order: () => createOrder(payload as never),
      update_order_status: () => {
        const orderId = String((payload.orderId ?? execution.targetId) as string);
        const status = String(payload.status ?? "confirmed") as NonNullable<Parameters<typeof patchOrder>[1]["status"]>;
        const order = getOrder(orderId);
        if (!order) throw new Error("Order not found for update_order_status");
        return patchOrder(orderId, { status });
      },
      create_payment: () => createPayment(payload as never),
      mark_warehouse_ready: () => markWarehouseOrderPrepared(String(payload.warehouseOrderId ?? execution.targetId)),
      complete_delivery: () => completeDelivery(String(payload.deliveryId ?? execution.targetId)),
      create_invoice: () => createInvoice(payload as never),
      create_return: () => createReturn(payload as never),
      send_document_whatsapp: () => sendDocumentWhatsApp(String(payload.documentId ?? execution.targetId)),
      queue_document_save: () => queueDocumentSave(String(payload.documentId ?? execution.targetId)),
      queue_document_print: () => queueDocumentPrint(String(payload.documentId ?? execution.targetId))
    };

    const runner = actionMap[operation];
    if (!runner) {
      throw new Error(`Unsupported execution action: ${operation}`);
    }

    const dispatchResult = runner();
    execution.status = "executed";
    execution.executedAt = new Date().toISOString();
    execution.result = {
      id: `ai_exec_result_${Date.now()}`,
      tenantId: execution.tenantId,
      proposalId: execution.proposalId ?? "proposal_unknown",
      operationId: execution.id,
      status: "completed",
      message: "Onayli aksiyon basariyla calistirildi.",
      completedAt: execution.executedAt
    };

    if (proposal) {
      proposal.status = "executed";
      proposal.updatedAt = execution.executedAt;
    }

    recordAuditEvent(actorContext, {
      entityType: "approval_execution",
      entityId: execution.id,
      eventType: "approval.execution.executed",
      title: "Onayli islem calistirildi",
      description: `${operation} aksiyonu basariyla dispatch edildi.`,
      payload: {
        operation,
        dispatchResult
      }
    });
  } catch (error) {
    const failure = classifyExecutionFailure(error);
    execution.status = "failed";
    execution.result = {
      id: `ai_exec_result_${Date.now()}`,
      tenantId: execution.tenantId,
      proposalId: execution.proposalId ?? "proposal_unknown",
      operationId: execution.id,
      status: "failed",
      message: `${failure.message}${failure.retryable ? " [RETRYABLE]" : " [NON_RETRYABLE]"}`,
      completedAt: new Date().toISOString()
    };
    recordAuditEvent(actorContext, {
      entityType: "approval_execution",
      entityId: execution.id,
      eventType: "approval.execution.failed",
      title: "Onayli islem basarisiz",
      description: execution.result.message,
      payload: { operation: execution.operationType, retryable: failure.retryable }
    });
  }
  return execution;
}

export function cancelApprovalExecution(id: string) {
  const execution = getApprovalExecution(id);
  if (!execution) return null;
  execution.status = "cancelled";
  recordAuditEvent(
    {
      tenantId: execution.tenantId,
      userId: execution.authorizedBy ?? execution.requestedBy,
      persistenceMode: process.env.PERSISTENCE_MODE === "postgres" ? "postgres" : "demo",
      isAuthenticated: true,
      roles: ["admin"],
      permissions: ["*"]
    },
    {
      entityType: "approval_execution",
      entityId: execution.id,
      eventType: "approval.execution.cancelled",
      title: "Onayli islem iptal edildi",
      description: `${execution.operationType} aksiyonu iptal edildi.`
    }
  );
  return execution;
}

export function listLocalOutputRules() {
  return localOutputRules;
}

export function patchLocalOutputRules(body: LocalOutputRule[]) {
  localOutputRules.splice(0, localOutputRules.length, ...body);
  return localOutputRules;
}

export function listPrintJobs() {
  return printJobs;
}

export function listFileSaveJobs() {
  return fileSaveJobs;
}

export function getLatestFileSaveJobForDocument(documentId: string) {
  return [...fileSaveJobs]
    .filter((job) => job.documentId === documentId)
    .sort((left, right) => right.queuedAt.localeCompare(left.queuedAt))[0];
}

export function queueDocumentSave(documentId: string) {
  const job = {
    ...fileSaveJobs[0],
    id: `file_save_${documentId}_${Date.now()}`,
    documentId,
    queuedAt: new Date().toISOString(),
    status: "queued"
  } as FileSaveJob;
  fileSaveJobs.push(job);
  return job;
}

export function queueDocumentPrint(documentId: string) {
  const job = {
    ...printJobs[0],
    id: `print_${documentId}_${Date.now()}`,
    documentId,
    queuedAt: new Date().toISOString(),
    status: "queued"
  } as PrintJob;
  printJobs.push(job);
  return job;
}

export function getLocalAgentStatus() {
  return { ...localAgentState };
}

export function reportLocalAgentStatus(payload: {
  status?: LocalAgentStatus;
  version?: string;
  checkedAt?: string;
  message?: string;
}) {
  localAgentState.status = payload.status ?? localAgentState.status;
  localAgentState.version = payload.version ?? localAgentState.version;
  localAgentState.checkedAt = payload.checkedAt ?? new Date().toISOString();
  localAgentState.message = payload.message ?? localAgentState.message;
  return getLocalAgentStatus();
}

export function markPrintJobStatus(id: string, status: PrintJob["status"], errorMessage?: string) {
  const job = printJobs.find((item) => item.id === id);
  if (!job) return null;
  if (status === "printing") {
    job.startedAt = new Date().toISOString();
  }
  if (status === "completed" || status === "failed" || status === "cancelled") {
    job.completedAt = new Date().toISOString();
  }
  job.status = status;
  job.errorMessage = errorMessage;
  return job;
}

export function markFileSaveJobStatus(id: string, status: FileSaveJob["status"], errorMessage?: string) {
  const job = fileSaveJobs.find((item) => item.id === id);
  if (!job) return null;
  if (status === "saving") {
    job.startedAt = new Date().toISOString();
  }
  if (status === "completed" || status === "failed" || status === "cancelled") {
    job.completedAt = new Date().toISOString();
  }
  job.status = status;
  job.errorMessage = errorMessage;
  return job;
}
