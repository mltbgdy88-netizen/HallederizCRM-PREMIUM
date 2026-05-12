import type { ApprovalClientError, ApprovalInboxItem, ApprovalInboxStatusFilter } from "../types";

export type ApprovalInboxSortMode = "newest" | "oldest" | "actionKey";

export interface ApprovalInboxStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export function filterInboxItems(items: ApprovalInboxItem[], filter: ApprovalInboxStatusFilter): ApprovalInboxItem[] {
  if (filter === "all") {
    return items;
  }
  return items.filter((item) => item.status === filter);
}

export function searchInboxItems(items: ApprovalInboxItem[], query: string): ApprovalInboxItem[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return items;
  }
  return items.filter((item) => {
    const haystack = [
      item.approvalRequestId,
      item.actionKey,
      item.actorId,
      item.idempotencyKey,
      ...item.reasons,
      item.rejectReason ?? ""
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalized);
  });
}

export function sortInboxItems(items: ApprovalInboxItem[], sort: ApprovalInboxSortMode): ApprovalInboxItem[] {
  const next = [...items];
  if (sort === "actionKey") {
    return next.sort((left, right) => left.actionKey.localeCompare(right.actionKey, "tr"));
  }
  return next.sort((left, right) => {
    const leftTime = Date.parse(left.requestedAt || left.createdAt);
    const rightTime = Date.parse(right.requestedAt || right.createdAt);
    return sort === "newest" ? rightTime - leftTime : leftTime - rightTime;
  });
}

export function computeInboxStats(items: ApprovalInboxItem[]): ApprovalInboxStats {
  return {
    total: items.length,
    pending: items.filter((item) => item.status === "pending").length,
    approved: items.filter((item) => item.status === "approved").length,
    rejected: items.filter((item) => item.status === "rejected").length
  };
}

export function buildActiveFilterSummary(input: {
  filter: ApprovalInboxStatusFilter;
  query: string;
  sort: ApprovalInboxSortMode;
  visibleCount: number;
  totalCount: number;
}): string {
  const parts: string[] = [];
  if (input.filter !== "all") {
    parts.push(`Durum: ${input.filter}`);
  }
  if (input.query.trim()) {
    parts.push(`Arama: "${input.query.trim()}"`);
  }
  parts.push(`Siralama: ${input.sort}`);
  parts.push(`${input.visibleCount}/${input.totalCount} kayit`);
  return parts.join(" · ");
}

export function isApprovalActionAvailable(item: ApprovalInboxItem | null | undefined): boolean {
  return item?.status === "pending";
}

export function validateRejectReason(reason: string): string | null {
  if (!reason.trim()) {
    return "Reddetme nedeni yazin.";
  }
  return null;
}

export function mapApprovalUiErrorMessage(error: ApprovalClientError): string {
  if (error.kind === "unauthorized") {
    return "Oturum gerekli. Lutfen tekrar giris yapin.";
  }
  if (error.kind === "forbidden") {
    return "Bu onay aksiyonu icin yetkiniz yok.";
  }
  if (error.kind === "unsupported") {
    return error.message || "Foundation/runtime modu su an kullanilamiyor.";
  }
  if (error.kind === "not_found") {
    return error.message || "Approval inbox endpoint bu ortamda yayinlanmiyor.";
  }
  if (error.kind === "network") {
    return "Approval API baglantisi kurulamadi.";
  }
  return error.message;
}
