import type { PriceSlotConfig } from "@hallederiz/types";
import type { HallederizSdk } from "@hallederiz/sdk";
import { sdk } from "../../../lib/data-source";
import { isOfflineLikeError } from "../../../lib/user-facing-data-error";

function resolveClient(client?: HallederizSdk): HallederizSdk {
  return client ?? sdk;
}

function mapPricingConfigError(error: unknown): string {
  if (isOfflineLikeError(error)) {
    return "Fiyat ayarları şu anda güncellenemiyor.";
  }

  if (typeof error === "object" && error !== null) {
    const candidate = error as { status?: unknown; message?: unknown };
    if (candidate.status === 403) {
      return "Bu işlem için yetkiniz bulunmuyor.";
    }
  }

  return "Fiyat ayarı kaydedilemedi.";
}

export async function updatePricingConfig(
  params: {
    slots: PriceSlotConfig[];
  },
  options?: { client?: HallederizSdk }
): Promise<{ success: boolean; updatedCount: number; message?: string }> {
  if (!params.slots.length) {
    return { success: false, updatedCount: 0, message: "Kaydedilecek fiyat alanı bulunamadı." };
  }

  try {
    const client = resolveClient(options?.client);
    const response = await client.stock.patchPriceSlots(params.slots);
    const updatedCount = response.items?.length ?? 0;
    if (updatedCount <= 0) {
      return { success: false, updatedCount: 0, message: "Fiyat ayarı kaydedilemedi." };
    }
    return { success: true, updatedCount };
  } catch (error) {
    return { success: false, updatedCount: 0, message: mapPricingConfigError(error) };
  }
}

