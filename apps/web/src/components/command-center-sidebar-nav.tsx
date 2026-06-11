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

/** Command center sidebar — günlük operasyon + tek Ayarlar hub kalemi. */
export function buildCommandCenterSidebarNavSections(): SidebarNavSection[] {
  return [
    {
      title: "GENEL",
      items: [
        item("cc-dashboard", "Gösterge Paneli", "/dashboard", "home"),
        item("cc-qop", "Hızlı İşlem", "/hizli-islem/satis-masasi", "zap")
      ]
    },
    {
      title: "TİCARİ OPERASYON",
      items: [
        item("cc-customers", "Cariler", "/cariler", "users-round"),
        item("cc-orders", "Siparişler", "/siparisler", "shopping-cart"),
        item("cc-offers", "Teklifler", "/teklifler", "file-text"),
        item("cc-payments", "Tahsilatlar", "/tahsilatlar", "circle-dollar-sign"),
        item("cc-deliveries", "Teslimatlar", "/teslimatlar", "truck"),
        item("cc-delivery-route", "Rota Planlama", "/teslimatlar/rota", "flag"),
        item("cc-invoices", "Faturalar", "/faturalar", "credit-card"),
        item("cc-returns", "İadeler", "/iadeler", "rotate-ccw")
      ]
    },
    {
      title: "STOK / DEPO / ÜRETİM",
      items: [
        item("cc-stock", "Stok", "/stok", "package"),
        item("cc-warehouse", "Depo", "/depo", "package-check"),
        item("cc-factory-orders", "Fabrikalar", "/fabrikalar/siparisler", "factory")
      ]
    },
    {
      title: "OPERASYON",
      items: [
        item("cc-documents", "Belgeler", "/belgeler", "clipboard-check"),
        item("cc-tasks", "Görevler", "/gorevler", "clipboard-list"),
        item("cc-inbox", "Gelen Kutu", "/gelen-kutu", "mail"),
        item("cc-wa", "WhatsApp", "/whatsapp", "message-circle"),
        item("cc-approvals", "Onaylar", "/onaylar", "check-circle-2"),
        item("cc-reports", "Raporlar", "/raporlar", "bar-chart-3"),
        item("cc-archive", "Arşiv", "/archive", "receipt")
      ]
    },
    {
      title: "AYARLAR",
      items: [item("cc-settings", "Ayarlar", "/ayarlar", "settings")]
    }
  ];
}
