import type { FastifyInstance } from "fastify";
import type { ApprovalExecution, LocalAgentStatus, LocalOutputRule } from "@hallederiz/types";
import {
  cancelApprovalExecution,
  chatAi,
  createApprovalExecution,
  getAiProposal,
  getApprovalExecution,
  getLocalAgentStatus,
  listAiInsights,
  listAiProposals,
  listApprovalExecutions,
  listFileSaveJobs,
  listLocalOutputRules,
  listPrintJobs,
  markFileSaveJobStatus,
  markPrintJobStatus,
  parseAiCommand,
  patchLocalOutputRules,
  queueDocumentPrint,
  queueDocumentSave,
  replaceAiInsights,
  reportLocalAgentStatus,
  runAiInsights,
  runApprovalExecution,
  saveAiProposal,
  updateAiProposalStatus
} from "./ai-local-output-store";
import { assertAnyPermission, assertAuthenticated, withGuards } from "./shared/auth-guards";
import { recordAuditEvent } from "./shared/audit-timeline";
import { AiRuntimeService } from "./modules/ai-runtime/service";

export async function registerAiLocalOutputRoutes(server: FastifyInstance) {
  server.post<{ Body: { message?: string } }>("/ai/chat", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated], async (context) => {
      const service = new AiRuntimeService(context);
      const prompt = request.body?.message ?? "";
      if (!prompt.trim()) {
        return { item: chatAi(request.body) };
      }
      const chat = await service.chat(prompt);
      const messages = service.buildAssistantMessage(prompt, chat.message, "text");
      const parsed = parseAiCommand({ text: prompt });
      return {
        item: {
          messages,
          reply: chat.message,
          provider: chat.provider,
          mode: chat.mode,
          classification: parsed,
          requiresProposal: parsed.mutation
        }
      };
    })
  );

  server.post<{ Body: { text?: string } }>("/ai/commands/parse", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated], async () => ({ item: parseAiCommand(request.body) }))
  );

  server.post<{ Body: { prompt?: string; inputMode?: "text" | "voice"; targetType?: string; targetId?: string; targetNo?: string } }>(
    "/ai/proposals",
    async (request, reply) =>
      withGuards(request, reply, [assertAuthenticated], async (context) => {
        const prompt = request.body?.prompt?.trim();
        if (!prompt) {
          return reply.status(400).send({ message: "prompt alani zorunludur." });
        }
        const service = new AiRuntimeService(context);
        const generated = await service.generateProposal({
          prompt,
          inputMode: request.body?.inputMode ?? "text",
          targetType: request.body?.targetType as never,
          targetId: request.body?.targetId,
          targetNo: request.body?.targetNo
        });
        const proposal = saveAiProposal(generated.proposal);
        recordAuditEvent(context, {
          entityType: "ai_proposal",
          entityId: proposal.id,
          eventType: "ai.proposal.created",
          title: "AI proposal olusturuldu",
          description: `${proposal.proposalNo} proposal kaydi olusturuldu.`
        });
        return reply.status(201).send({ item: { proposal, approvalDraft: generated.approvalDraft } });
      })
  );

  server.get("/ai/proposals", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated], async () => ({ items: listAiProposals(), total: listAiProposals().length }))
  );

  server.get<{ Params: { id: string } }>("/ai/proposals/:id", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated], async () => {
      const item = getAiProposal(request.params.id);
      if (!item) return reply.status(404).send({ message: "AI proposal not found" });
      return { item };
    })
  );

  server.post<{ Params: { id: string } }>("/ai/proposals/:id/confirm", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["approvals.write", "ai.actions.write"])], async (context) => {
      const item = updateAiProposalStatus(request.params.id, "approved");
      if (!item) return reply.status(404).send({ message: "AI proposal not found" });
      recordAuditEvent(context, {
        entityType: "ai_proposal",
        entityId: item.id,
        eventType: "ai.proposal.approved",
        title: "AI onerisi onaylandi",
        description: `${item.proposalNo} onerisi onaylandi.`
      });
      return { item };
    })
  );

  server.post<{ Params: { id: string } }>("/ai/proposals/:id/reject", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["approvals.write", "ai.actions.write"])], async (context) => {
      const item = updateAiProposalStatus(request.params.id, "rejected");
      if (!item) return reply.status(404).send({ message: "AI proposal not found" });
      recordAuditEvent(context, {
        entityType: "ai_proposal",
        entityId: item.id,
        eventType: "ai.proposal.rejected",
        title: "AI onerisi reddedildi",
        description: `${item.proposalNo} onerisi reddedildi.`
      });
      return { item };
    })
  );

  server.get("/ai/insights", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated], async () => ({ items: listAiInsights(), total: listAiInsights().length }))
  );

  server.post("/ai/insights/run", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["ai.actions.write", "approvals.write"])], async (context) => {
      const service = new AiRuntimeService(context);
      const insights = await service.generateInsights();
      replaceAiInsights(insights);
      return {
        item: runAiInsights()
      };
    })
  );

  server.post<{ Body: { audioBase64?: string; mimeType?: string; language?: string } }>("/ai/voice/transcribe", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated], async (context) => {
      const service = new AiRuntimeService(context);
      const item = await service.transcribeVoice({
        audioBase64: request.body?.audioBase64 ?? "",
        mimeType: request.body?.mimeType,
        language: request.body?.language ?? "tr"
      });
      return { item };
    })
  );

  server.post<{ Body: { text?: string; voice?: string; speed?: number } }>("/ai/voice/speak", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated], async (context) => {
      const service = new AiRuntimeService(context);
      const text = request.body?.text ?? "";
      if (!text.trim()) {
        return reply.status(400).send({ message: "text alani zorunludur." });
      }
      const item = await service.speakVoice({ text, voice: request.body?.voice, speed: request.body?.speed });
      return { item };
    })
  );

  server.get("/approval-executions", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated], async () => ({ items: listApprovalExecutions(), total: listApprovalExecutions().length }))
  );

  server.get<{ Params: { id: string } }>("/approval-executions/:id", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated], async () => {
      const item = getApprovalExecution(request.params.id);
      if (!item) return reply.status(404).send({ message: "Approval execution not found" });
      return { item };
    })
  );

  server.post<{ Body: Partial<ApprovalExecution> }>("/approval-executions", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["approvals.write", "ai.actions.write"])], async () =>
      reply.status(201).send({ item: createApprovalExecution(request.body) })
    )
  );

  server.post<{ Params: { id: string } }>("/approval-executions/:id/run", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["approvals.write", "ai.actions.write"])], async () => {
      const item = runApprovalExecution(request.params.id);
      if (!item) return reply.status(404).send({ message: "Approval execution not found" });
      return { item };
    })
  );

  server.post<{ Params: { id: string } }>("/approval-executions/:id/cancel", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["approvals.write", "ai.actions.write"])], async () => {
      const item = cancelApprovalExecution(request.params.id);
      if (!item) return reply.status(404).send({ message: "Approval execution not found" });
      return { item };
    })
  );

  server.get("/local-output/rules", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated], async () => ({ items: listLocalOutputRules() }))
  );

  server.patch<{ Body: LocalOutputRule[] }>("/local-output/rules", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["local_output.write", "documents.write"])], async () => ({
      items: patchLocalOutputRules(request.body)
    }))
  );

  server.get("/print-jobs", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated], async () => ({ items: listPrintJobs() }))
  );

  server.get("/file-save-jobs", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated], async () => ({ items: listFileSaveJobs() }))
  );

  server.post<{ Params: { id: string } }>("/documents/:id/queue-save", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["local_output.write", "documents.write"])], async (context) => {
      const item = queueDocumentSave(request.params.id);
      recordAuditEvent(context, {
        entityType: "document",
        entityId: request.params.id,
        eventType: "document.queue_save",
        title: "Belge kaydetme kuyruguna eklendi",
        description: `${item.id} dosya kaydetme isi kuyruga alindi.`
      });
      return reply.status(201).send({ item });
    })
  );

  server.post<{ Params: { id: string } }>("/documents/:id/queue-print", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["local_output.write", "documents.write"])], async (context) => {
      const item = queueDocumentPrint(request.params.id);
      recordAuditEvent(context, {
        entityType: "document",
        entityId: request.params.id,
        eventType: "document.queue_print",
        title: "Belge yazdirma kuyruguna eklendi",
        description: `${item.id} yazdirma isi kuyruga alindi.`
      });
      return reply.status(201).send({ item });
    })
  );

  server.post<{ Params: { id: string } }>("/print-jobs/:id/start", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["local_output.write"])], async (context) => {
      const item = markPrintJobStatus(request.params.id, "printing");
      if (!item) return reply.status(404).send({ message: "Print job not found" });
      recordAuditEvent(context, {
        entityType: "print_job",
        entityId: item.id,
        eventType: "local_output.print.start",
        title: "Yazdirma isi baslatildi",
        description: `${item.documentType} yazdirma isi baslatildi.`
      });
      return { item };
    })
  );

  server.post<{ Params: { id: string }; Body: { errorMessage?: string } }>("/print-jobs/:id/complete", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["local_output.write"])], async (context) => {
      const item = markPrintJobStatus(request.params.id, "completed", request.body?.errorMessage);
      if (!item) return reply.status(404).send({ message: "Print job not found" });
      recordAuditEvent(context, {
        entityType: "print_job",
        entityId: item.id,
        eventType: "local_output.print.completed",
        title: "Yazdirma isi tamamlandi",
        description: `${item.documentType} yazdirma isi tamamlandi.`
      });
      return { item };
    })
  );

  server.post<{ Params: { id: string }; Body: { errorMessage?: string } }>("/print-jobs/:id/fail", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["local_output.write"])], async (context) => {
      const item = markPrintJobStatus(request.params.id, "failed", request.body?.errorMessage);
      if (!item) return reply.status(404).send({ message: "Print job not found" });
      recordAuditEvent(context, {
        entityType: "print_job",
        entityId: item.id,
        eventType: "local_output.print.failed",
        title: "Yazdirma isi basarisiz",
        description: request.body?.errorMessage ?? `${item.documentType} yazdirma isi basarisiz oldu.`
      });
      return { item };
    })
  );

  server.post<{ Params: { id: string } }>("/file-save-jobs/:id/start", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["local_output.write"])], async (context) => {
      const item = markFileSaveJobStatus(request.params.id, "saving");
      if (!item) return reply.status(404).send({ message: "File save job not found" });
      recordAuditEvent(context, {
        entityType: "file_save_job",
        entityId: item.id,
        eventType: "local_output.file_save.start",
        title: "Dosya kaydetme isi baslatildi",
        description: `${item.documentType} kaydetme isi baslatildi.`
      });
      return { item };
    })
  );

  server.post<{ Params: { id: string }; Body: { errorMessage?: string } }>("/file-save-jobs/:id/complete", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["local_output.write"])], async (context) => {
      const item = markFileSaveJobStatus(request.params.id, "completed", request.body?.errorMessage);
      if (!item) return reply.status(404).send({ message: "File save job not found" });
      recordAuditEvent(context, {
        entityType: "file_save_job",
        entityId: item.id,
        eventType: "local_output.file_save.completed",
        title: "Dosya kaydetme isi tamamlandi",
        description: `${item.documentType} kaydetme isi tamamlandi.`
      });
      return { item };
    })
  );

  server.post<{ Params: { id: string }; Body: { errorMessage?: string } }>("/file-save-jobs/:id/fail", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["local_output.write"])], async (context) => {
      const item = markFileSaveJobStatus(request.params.id, "failed", request.body?.errorMessage);
      if (!item) return reply.status(404).send({ message: "File save job not found" });
      recordAuditEvent(context, {
        entityType: "file_save_job",
        entityId: item.id,
        eventType: "local_output.file_save.failed",
        title: "Dosya kaydetme isi basarisiz",
        description: request.body?.errorMessage ?? `${item.documentType} kaydetme isi basarisiz oldu.`
      });
      return { item };
    })
  );

  server.get("/local-agent/status", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated], async () => ({ item: getLocalAgentStatus() }))
  );

  server.get("/health/ai", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated], async (context) => {
      const service = new AiRuntimeService(context);
      return { item: service.getHealth() };
    })
  );

  server.post("/health/ai/test-chat", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated], async (context) => {
      const service = new AiRuntimeService(context);
      const chat = await service.chat("staging ping");
      return {
        item: {
          status: "healthy",
          mode: chat.mode === "live" ? "live" : "fallback",
          configured: chat.mode === "live" ? true : false,
          reason: "AI chat testi tamamlandi.",
          lastCheckedAt: new Date().toISOString(),
          details: chat
        }
      };
    })
  );

  server.post("/health/ai/test-stt", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated], async () => {
      return {
        item: {
          status: "degraded",
          mode: "fallback",
          configured: false,
          reason: "STT testi icin ses yuklenmedi; endpoint hazir.",
          lastCheckedAt: new Date().toISOString(),
          details: { dryRun: true }
        }
      };
    })
  );

  server.post("/health/ai/test-tts", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated], async (context) => {
      const service = new AiRuntimeService(context);
      const voice = await service.speakVoice({ text: "Staging test ses cikisi.", speed: 1 });
      return {
        item: {
          status: "healthy",
          mode: voice.provider === "mock" ? "fallback" : "live",
          configured: voice.provider !== "mock",
          reason: "TTS testi tamamlandi.",
          lastCheckedAt: new Date().toISOString(),
          details: { provider: voice.provider, mimeType: voice.mimeType }
        }
      };
    })
  );

  server.get("/health/local-agent", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated], async () => {
      const status = getLocalAgentStatus();
      return {
        item: {
          service: "local-agent",
          status: status.status === "online" ? "healthy" : status.status === "safe_mode" ? "degraded" : status.status === "disabled" ? "disabled" : "error",
          mode: status.status === "disabled" ? "disabled" : status.status === "online" ? "live" : "fallback",
          configured: status.status !== "offline",
          reason: status.message,
          lastCheckedAt: status.checkedAt,
          details: status,
          runtimeStatus: status.status,
          legacy: {
            status: status.status === "online" ? "healthy" : status.status === "safe_mode" ? "warning" : "error",
            mode: status.status,
            checkedAt: status.checkedAt,
            message: status.message
          }
        }
      };
    })
  );

  server.post("/health/local-agent/test-save-dry-run", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated], async () => {
      const job = queueDocumentSave("document_1");
      return {
        item: {
          status: "healthy",
          mode: "fallback",
          configured: true,
          reason: "Save dry-run queue testi tamamlandi.",
          lastCheckedAt: new Date().toISOString(),
          details: { jobId: job.id, queueStatus: job.status }
        }
      };
    })
  );

  server.post("/health/local-agent/test-print-dry-run", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated], async () => {
      const job = queueDocumentPrint("document_1");
      return {
        item: {
          status: "healthy",
          mode: "fallback",
          configured: true,
          reason: "Print dry-run queue testi tamamlandi.",
          lastCheckedAt: new Date().toISOString(),
          details: { jobId: job.id, queueStatus: job.status }
        }
      };
    })
  );

  server.post<{ Body: { status?: LocalAgentStatus; version?: string; checkedAt?: string; message?: string } }>(
    "/local-agent/status",
    async (request, reply) =>
      withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["local_output.write"])], async () =>
        reply.status(201).send({ item: reportLocalAgentStatus(request.body ?? {}) })
      )
  );
}
