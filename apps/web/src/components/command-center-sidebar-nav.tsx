"use client";

import type { AppShellNavItem, SidebarNavSection } from "@hallederiz/ui";
import { LucideIcon, type LucideIconName } from "./icons/lucide-icons";

function NavIcon({ name }: { name: LucideIconName }) {
  return (
    <span className="hz-sidebar-item-icon hz-cc-nav-icon" aria-hidden>
      <LucideIcon name={name} size={18} strokeWidth={2.25} />
    </span>
  );
}

function item(key: string, label: string, href: string, icon: LucideIconName): AppShellNavItem {
  return { key, label, href, icon: <NavIcon name={icon} /> };
}

/** Command center sidebar — route list contract (14 items). */
export function buildCommandCenterSidebarNavSections(): SidebarNavSection[] {
  return [
    {
      title: "MENÜ",
      items: [
        item("cc-home", "Ana Sayfa", "/dashboard", "home"),
        item("cc-qop", "Hızlı İşlem", "/hizli-islem", "zap"),
        item("cc-approvals", "Onaylar", "/onaylar", "check-circle-2"),
        item("cc-orders", "Siparişler", "/siparisler", "shopping-cart"),
        item("cc-payments", "Tahsilatlar", "/tahsilatlar", "circle-dollar-sign"),
        item("cc-offers", "Teklifler", "/teklifler", "file-text"),
        item("cc-customers", "Cariler", "/cariler", "users-round"),
        item("cc-stock", "Stok & Depo", "/stok", "package"),
        item("cc-factory", "Üretim", "/fabrikalar/stoklar", "factory"),
        item("cc-tasks", "Görevler", "/gorevler", "clipboard-list"),
        item("cc-wa", "WhatsApp", "/whatsapp", "message-circle"),
        item("cc-reports", "Raporlar", "/raporlar", "bar-chart-3"),
        item("cc-ai", "Yapay Zeka", "/ai", "bot"),
        item("cc-settings", "Ayarlar", "/ayarlar", "settings")
      ]
    }
  ];
}
