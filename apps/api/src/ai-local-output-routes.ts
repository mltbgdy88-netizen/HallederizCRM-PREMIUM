import type { FastifyInstance } from "fastify";
import type { ApprovalExecution, LocalOutputRule } from "@hallederiz/types";
import { cancelApprovalExecution, chatAi, createApprovalExecution, getAiProposal, getApprovalExecution, listAiInsights, listAiProposals, listApprovalExecutions, listFileSaveJobs, listLocalOutputRules, listPrintJobs, parseAiCommand, patchLocalOutputRules, queueDocumentPrint, queueDocumentSave, runAiInsights, runApprovalExecution, updateAiProposalStatus } from "./ai-local-output-store";

export async function registerAiLocalOutputRoutes(server: FastifyInstance) {
  server.post<{ Body: { message?: string } }>("/ai/chat", async (request) => ({ item: chatAi(request.body) }));
  server.post<{ Body: { text?: string } }>("/ai/commands/parse", async (request) => ({ item: parseAiCommand(request.body) }));
  server.get("/ai/proposals", async () => ({ items: listAiProposals(), total: listAiProposals().length }));
  server.get<{ Params: { id: string } }>("/ai/proposals/:id", async (request, reply) => { const item = getAiProposal(request.params.id); if (!item) return reply.status(404).send({ message: "AI proposal not found" }); return { item }; });
  server.post<{ Params: { id: string } }>("/ai/proposals/:id/confirm", async (request, reply) => { const item = updateAiProposalStatus(request.params.id, "approved"); if (!item) return reply.status(404).send({ message: "AI proposal not found" }); return { item }; });
  server.post<{ Params: { id: string } }>("/ai/proposals/:id/reject", async (request, reply) => { const item = updateAiProposalStatus(request.params.id, "rejected"); if (!item) return reply.status(404).send({ message: "AI proposal not found" }); return { item }; });
  server.get("/ai/insights", async () => ({ items: listAiInsights(), total: listAiInsights().length }));
  server.post("/ai/insights/run", async () => ({ item: runAiInsights() }));

  server.get("/approval-executions", async () => ({ items: listApprovalExecutions(), total: listApprovalExecutions().length }));
  server.get<{ Params: { id: string } }>("/approval-executions/:id", async (request, reply) => { const item = getApprovalExecution(request.params.id); if (!item) return reply.status(404).send({ message: "Approval execution not found" }); return { item }; });
  server.post<{ Body: Partial<ApprovalExecution> }>("/approval-executions", async (request, reply) => reply.status(201).send({ item: createApprovalExecution(request.body) }));
  server.post<{ Params: { id: string } }>("/approval-executions/:id/run", async (request, reply) => { const item = runApprovalExecution(request.params.id); if (!item) return reply.status(404).send({ message: "Approval execution not found" }); return { item }; });
  server.post<{ Params: { id: string } }>("/approval-executions/:id/cancel", async (request, reply) => { const item = cancelApprovalExecution(request.params.id); if (!item) return reply.status(404).send({ message: "Approval execution not found" }); return { item }; });

  server.get("/local-output/rules", async () => ({ items: listLocalOutputRules() }));
  server.patch<{ Body: LocalOutputRule[] }>("/local-output/rules", async (request) => ({ items: patchLocalOutputRules(request.body) }));
  server.get("/print-jobs", async () => ({ items: listPrintJobs() }));
  server.get("/file-save-jobs", async () => ({ items: listFileSaveJobs() }));
  server.post<{ Params: { id: string } }>("/documents/:id/queue-save", async (request, reply) => reply.status(201).send({ item: queueDocumentSave(request.params.id) }));
  server.post<{ Params: { id: string } }>("/documents/:id/queue-print", async (request, reply) => reply.status(201).send({ item: queueDocumentPrint(request.params.id) }));
}
