import type { FeatureRegistryEntry } from "@hallederiz/types";

export const featureRegistry: readonly FeatureRegistryEntry[] = [
  { featureKey: "core.customer", package: "core", moduleKey: "core", enabledByDefault: true },
  { featureKey: "core.qop", package: "core", moduleKey: "core", enabledByDefault: true },
  { featureKey: "core.approval", package: "core", moduleKey: "core", enabledByDefault: true },
  { featureKey: "premium.ai.operator", package: "premium", moduleKey: "ai", enabledByDefault: false },
  { featureKey: "premium.whatsapp", package: "premium", moduleKey: "whatsapp", enabledByDefault: false },
  { featureKey: "premium.erp", package: "premium", moduleKey: "erp", enabledByDefault: false },
  { featureKey: "enterprise.compliance.export", package: "enterprise", moduleKey: "compliance", enabledByDefault: false }
] as const;

export function isFeatureEnabled(featureKey: string, enabledFeatures?: string[]): boolean {
  const feature = featureRegistry.find((item) => item.featureKey === featureKey);
  if (!feature) {
    return false;
  }
  if (feature.enabledByDefault) {
    return true;
  }
  return Boolean(enabledFeatures?.includes(featureKey));
}
