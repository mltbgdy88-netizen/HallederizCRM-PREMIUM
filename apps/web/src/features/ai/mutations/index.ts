import type { AiInsight } from "@hallederiz/types";
import { confirmAiProposal, rejectAiProposal, runAiInsights } from "../queries";

export async function runAiInsightsMutation(options: {
  useDemoData: boolean;
  pushToast: (message: string) => void;
}): Promise<AiInsight[] | null> {
  try {
    const response = await runAiInsights();
    const items = Array.isArray((response.item as { items?: AiInsight[] } | undefined)?.items)
      ? ((response.item as { items: AiInsight[] }).items ?? [])
      : [];
    if (options.useDemoData) {
      options.pushToast(`Demo içgörü seti yüklendi (${items.length} kayıt).`);
    } else {
      options.pushToast(`İçgörü üretildi (${items.length} kayıt).`);
    }
    return items;
  } catch {
    options.pushToast("İçgörü üretilemedi. Yerel yapay zekâ bağlantısını kontrol edin.");
    return null;
  }
}

export async function confirmAiProposalMutation(
  id: string,
  options: { useDemoData: boolean; pushToast: (message: string) => void }
) {
  if (options.useDemoData) {
    options.pushToast("Onay işlemi demo modda simüle edildi; merkezi onay ekranından yürütülür.");
    return null;
  }
  try {
    const response = await confirmAiProposal(id);
    options.pushToast("Öneri onay akışına alındı.");
    return response.item;
  } catch {
    options.pushToast("Öneri onaylanamadı.");
    return null;
  }
}

export async function rejectAiProposalMutation(
  id: string,
  options: { useDemoData: boolean; pushToast: (message: string) => void }
) {
  if (options.useDemoData) {
    options.pushToast("Red işlemi demo modda simüle edildi.");
    return null;
  }
  try {
    const response = await rejectAiProposal(id);
    options.pushToast("Öneri reddedildi.");
    return response.item;
  } catch {
    options.pushToast("Öneri reddedilemedi.");
    return null;
  }
}
