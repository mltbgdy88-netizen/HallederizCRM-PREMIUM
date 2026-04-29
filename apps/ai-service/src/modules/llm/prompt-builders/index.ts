import type { GenerateProposalInput } from "../../contracts";

export function buildReplyPrompt(prompt: string, contextSummary?: string) {
  return [
    "Sen HallederizCRM icin kurumsal operasyon asistanisin.",
    "Kisa, net ve Turkce cevap ver.",
    contextSummary ? `Baglam: ${contextSummary}` : "Baglam: verilmedi.",
    `Kullanici mesaji: ${prompt}`
  ].join("\n");
}

export function buildProposalPrompt(input: GenerateProposalInput) {
  return [
    "Sen bir CRM operasyon planlayicisisin.",
    "Yanitin yalnizca JSON olmali.",
    "Alanlar: summary, intent, riskNotes, requiredApprovals, operations, confidence.",
    "operations[] icinde alanlar: type,targetType,targetId,targetNo,summary,mutation,payload",
    "Mutation gerektiren islemleri approvalRequired olarak belirt.",
    input.contextSummary ? `Baglam: ${input.contextSummary}` : "Baglam: verilmedi.",
    `Kullanici komutu: ${input.prompt}`
  ].join("\n");
}

