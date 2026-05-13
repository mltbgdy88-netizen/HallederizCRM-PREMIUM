export type RouteStatus = "implemented" | "shell" | "needs-api" | "planned";

export type OwnerAgent = "cursor" | "codex" | "both";

export type ProductModuleGroup =
  | "Panel"
  | "Omnichannel"
  | "AI Operator"
  | "Core CRM"
  | "Operations"
  | "Field & WMS"
  | "Approvals"
  | "Tasks"
  | "Workflows"
  | "Integrations"
  | "Analytics"
  | "Compliance"
  | "Setup"
  | "Settings";

export interface ProductRouteNode {
  id: string;
  label: string;
  /** Path segment only (no slashes). Empty string = module root. */
  segment: string;
  href: string;
  moduleGroup: ProductModuleGroup;
  packageGroup: string;
  status: RouteStatus;
  ownerAgent: OwnerAgent;
  description: string;
  relatedApi?: string;
  /** Mevcut feature bileşeni veya redirect hedefi */
  existingFeature?: string;
  /** Shell üst bandını gizle (sayfa kendi başlığını çizer) */
  suppressHeader?: boolean;
  children?: ProductRouteNode[];
}
