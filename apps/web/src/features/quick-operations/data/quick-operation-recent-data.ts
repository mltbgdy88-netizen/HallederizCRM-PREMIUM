import type { DashboardActivityRow, DashboardHomeSnapshot } from "../../dashboard/utils/build-dashboard-home-snapshot";
import type { QuickOperationHubIcon } from "./quick-operation-hub-data";

export type QuickOperationRecentItem = {
  id: string;
  type: string;
  ref: string;
  customer: string;
  timeAgo: string;
  status: "Tamamlandı" | "Beklemede";
  icon: QuickOperationHubIcon;
  iconTone: "green" | "gold";
  href: string;
};

export type QuickOperationSalesRecentItem = {
  id: string;
  amount: string;
  customer: string;
  status: string;
  time: string;
  href: string;
};

function inferHubIcon(channel: string): QuickOperationHubIcon {
  const normalized = channel.toLowerCase();
  if (normalized.includes("onay")) return "impact";
  if (normalized.includes("tahsilat") || normalized.includes("ödeme")) return "collection";
  if (normalized.includes("teslim") || normalized.includes("depo")) return "delivery";
  if (normalized.includes("teklif")) return "offer";
  if (normalized.includes("iade")) return "return";
  return "order";
}

function inferStatus(text: string): QuickOperationRecentItem["status"] {
  const normalized = text.toLowerCase();
  if (normalized.includes("bekle") || normalized.includes("onay")) return "Beklemede";
  return "Tamamlandı";
}

function splitActivityText(text: string): { ref: string; detail: string } {
  const colon = text.indexOf(":");
  if (colon === -1) return { ref: text.slice(0, 24), detail: text };
  return { ref: text.slice(0, colon).trim(), detail: text.slice(colon + 1).trim() };
}

function activityHref(row: DashboardActivityRow): string {
  const channel = row.channel?.toLowerCase() ?? "";
  if (channel.includes("onay")) return "/onaylar";
  if (channel.includes("tahsilat")) return "/hizli-islem/satis-masasi?tab=payment";
  if (channel.includes("teslim") || channel.includes("depo")) return "/hizli-islem/satis-masasi?tab=delivery";
  if (channel.includes("teklif")) return "/hizli-islem/satis-masasi?tab=offer";
  if (channel.includes("iade")) return "/hizli-islem/satis-masasi?tab=return";
  if (row.id.startsWith("ap_")) return "/onaylar";
  return "/hizli-islem/satis-masasi?tab=order";
}

export function mapSnapshotToHubRecent(snapshot: DashboardHomeSnapshot, limit = 5): QuickOperationRecentItem[] {
  return snapshot.activity.slice(0, limit).map((row) => {
    const parts = splitActivityText(row.text);
    const status = inferStatus(row.text);
    return {
      id: row.id,
      type: row.channel?.trim() || "Operasyon",
      ref: parts.ref,
      customer: parts.detail || parts.ref,
      timeAgo: row.time,
      status,
      icon: inferHubIcon(row.channel ?? ""),
      iconTone: status === "Beklemede" ? "gold" : "green",
      href: activityHref(row)
    };
  });
}

export function mapSnapshotToSalesRecent(snapshot: DashboardHomeSnapshot, limit = 5): QuickOperationSalesRecentItem[] {
  return snapshot.activity.slice(0, limit).map((row) => {
    const parts = splitActivityText(row.text);
    const status = inferStatus(row.text) === "Beklemede" ? "Onayda" : "Taslak";
    return {
      id: parts.ref,
      amount: "—",
      customer: parts.detail || row.channel || "Operasyon",
      status,
      time: row.time,
      href: activityHref(row)
    };
  });
}
