"use client";

import type { AppShellNavItem, SidebarNavSection } from "@hallederiz/ui";
import { CRMIcon, type CRMIconName } from "./icons";
import { PRODUCT_ROUTE_FOREST } from "../navigation/product-route-manifest";

const PACKAGE_ICON: Record<string, CRMIconName> = {
  panel: "dashboard",
  inbox: "whatsapp",
  "ai-operator": "ai",
  crm: "customers",
  offers: "offers",
  orders: "orders",
  quick: "orders",
  payments: "payments",
  invoices: "invoices",
  returns: "returns",
  products: "stock",
  stock: "stock",
  wms: "warehouse",
  delivery: "delivery",
  documents: "documents",
  approvals: "roles",
  tasks: "orders",
  workflows: "ai",
  integrations: "erp",
  reports: "reports",
  compliance: "roles",
  setup: "settings",
  settings: "settings"
};

function iconFor(packageGroup: string): CRMIconName {
  return PACKAGE_ICON[packageGroup] ?? "dashboard";
}

export function buildProductSidebarNavSections(): SidebarNavSection[] {
  const modules: AppShellNavItem[] = PRODUCT_ROUTE_FOREST.map((m) => ({
    key: m.id,
    label: m.label,
    href: m.href,
    icon: <CRMIcon name={iconFor(m.packageGroup)} />
  }));

  const shortcuts: AppShellNavItem[] = [
    { key: "legacy-dashboard", label: "Gösterge Paneli", href: "/dashboard", icon: <CRMIcon name="dashboard" /> },
    { key: "legacy-whatsapp", label: "WhatsApp (eski URL)", href: "/whatsapp", icon: <CRMIcon name="whatsapp" /> },
    { key: "archive", label: "Arşiv", href: "/archive", icon: <CRMIcon name="documents" /> }
  ];

  return [
    { title: "ÜRÜN MODÜLLERİ", items: modules },
    { title: "KISA ERİ�?İM", items: shortcuts }
  ];
}

