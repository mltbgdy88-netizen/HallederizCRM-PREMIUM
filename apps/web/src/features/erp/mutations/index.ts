import { sdk } from "../../../lib/data-source";
import { ERP_MUTATION_DEMO_MESSAGES, ERP_MUTATION_ERROR_MESSAGES } from "../utils/erp-mutation-messages";

export async function testErpConnectionMutation(
  connectionId: string,
  options: { useDemoData: boolean; pushToast: (message: string) => void }
) {
  if (options.useDemoData) {
    options.pushToast(ERP_MUTATION_DEMO_MESSAGES.test);
    return null;
  }
  try {
    const response = await sdk.erp.testConnection(connectionId);
    const result = response.item.lastTestResult;
    if (result === "success") {
      options.pushToast("ERP bağlantı testi başarılı.");
    } else {
      options.pushToast("ERP bağlantı testi tamamlandı; sonuç başarısız veya kısıtlı.");
    }
    return response.item;
  } catch {
    options.pushToast(ERP_MUTATION_ERROR_MESSAGES.testFailed);
    return null;
  }
}

export async function syncErpConnectionMutation(
  connectionId: string,
  options: { useDemoData: boolean; pushToast: (message: string) => void }
) {
  if (options.useDemoData) {
    options.pushToast(ERP_MUTATION_DEMO_MESSAGES.sync);
    return null;
  }
  try {
    const response = await sdk.erp.syncConnection(connectionId);
    const provider = response.item.provider ?? "mock";
    if (response.item.warning) {
      options.pushToast(`Senkron tamamlandı (fallback): ${response.item.warning}`);
    } else {
      options.pushToast(`Senkron başlatıldı (${provider}).`);
    }
    return response.item;
  } catch {
    options.pushToast(ERP_MUTATION_ERROR_MESSAGES.syncFailed);
    return null;
  }
}
