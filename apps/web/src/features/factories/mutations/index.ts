import { sdk } from "../../../lib/data-source";
import { FACTORY_MUTATION_DEMO_MESSAGES, FACTORY_MUTATION_ERROR_MESSAGES } from "../utils/factory-mutation-messages";

export async function testFactoryChannelSyncMutation(
  factoryId: string | undefined,
  options: { useDemoData: boolean; pushToast: (message: string) => void }
) {
  if (options.useDemoData) {
    options.pushToast(FACTORY_MUTATION_DEMO_MESSAGES.testChannel);
    return null;
  }
  try {
    const response = await sdk.factory.testChannelSync(factoryId);
    if (response.item.ok) {
      options.pushToast("Fabrika bağlantı testi başarılı.");
    } else {
      options.pushToast(response.item.reason || "Fabrika bağlantı testi tamamlandı; sonuç kısıtlı.");
    }
    return response.item;
  } catch {
    options.pushToast(FACTORY_MUTATION_ERROR_MESSAGES.testChannelFailed);
    return null;
  }
}

export async function syncFactoryStockMutation(
  factoryId: string,
  options: { useDemoData: boolean; pushToast: (message: string) => void }
) {
  if (options.useDemoData) {
    options.pushToast(FACTORY_MUTATION_DEMO_MESSAGES.syncStock);
    return null;
  }
  try {
    const response = await sdk.factory.syncStock(factoryId);
    const provider = response.item.provider ?? "mock";
    if (response.item.warning) {
      options.pushToast(`Stok senkronu tamamlandı (fallback): ${response.item.warning}`);
    } else {
      options.pushToast(`Fabrika stok senkronu başlatıldı (${provider}).`);
    }
    return response.item;
  } catch {
    options.pushToast(FACTORY_MUTATION_ERROR_MESSAGES.syncStockFailed);
    return null;
  }
}

export async function sendFactoryOrderMutation(
  orderId: string,
  options: { useDemoData: boolean; pushToast: (message: string) => void }
) {
  if (options.useDemoData) {
    options.pushToast(FACTORY_MUTATION_DEMO_MESSAGES.sendOrder);
    return null;
  }
  try {
    const response = await sdk.factory.sendOrder(orderId);
    const provider = response.item.provider ?? "mock";
    if (response.item.warning) {
      options.pushToast(`Sipariş iletildi (fallback): ${response.item.warning}`);
    } else {
      options.pushToast(`Fabrika sipariş iletimi başlatıldı (${provider}).`);
    }
    return response.item;
  } catch {
    options.pushToast(FACTORY_MUTATION_ERROR_MESSAGES.sendOrderFailed);
    return null;
  }
}
