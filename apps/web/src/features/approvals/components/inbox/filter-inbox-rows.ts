import type { ApprovalInboxRecord, ApprovalInboxViewId } from "./types";
import type { ApprovalInboxFilterState } from "./ApprovalSidebar";

const ASSIGNEE_LABELS: Record<string, string> = {
  taner: "Taner Yılmaz",
  fuat: "Fuat Yılmaz",
  kubra: "Kübra Yıldız",
  merve: "Merve Yılmaz"
};

const BRANCH_LABELS: Record<string, string> = {
  merkez: "Merkez",
  izmir: "İzmir",
  bursa: "Bursa",
  ankara: "Ankara"
};

export function filterApprovalInboxRows(
  rows: ApprovalInboxRecord[],
  options: {
    activeView: ApprovalInboxViewId;
    onlyCritical: boolean;
    searchQuery: string;
    filters: ApprovalInboxFilterState;
  }
): ApprovalInboxRecord[] {
  const q = options.searchQuery.trim().toLowerCase();

  return rows.filter((row) => {
    if (options.onlyCritical && row.priority !== "kritik") {
      return false;
    }

    if (options.activeView === "yakin_sonuclanan") {
      if (!row.recentlyResolved) return false;
    } else if (options.activeView === "bana_atanan") {
      if (!row.assignedToMe) return false;
    } else if (options.activeView !== "tum" && !row.viewTags.includes(options.activeView)) {
      return false;
    }

    if (options.filters.status !== "tumu" && row.status !== options.filters.status) {
      return false;
    }

    if (options.filters.priority !== "tumu" && row.priority !== options.filters.priority) {
      return false;
    }

    if (options.filters.approvalType !== "tumu") {
      const typeOk = matchesApprovalType(row, options.filters.approvalType);
      if (!typeOk) return false;
    }

    if (options.filters.assignee !== "tumu") {
      const label = ASSIGNEE_LABELS[options.filters.assignee];
      if (label && row.assigneeName !== label) return false;
    }

    if (options.filters.tenantBranch !== "tumu") {
      const branch = BRANCH_LABELS[options.filters.tenantBranch];
      if (branch && row.meta.branch !== branch) return false;
    }

    if (q) {
      const haystack = [
        row.title,
        row.approvalNo,
        row.customerName,
        row.entityLabel,
        row.amountLabel,
        row.assigneeName
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}

function matchesApprovalType(row: ApprovalInboxRecord, filterType: string): boolean {
  switch (filterType) {
    case "iade":
      return row.title.toLowerCase().includes("iade");
    case "tahsilat":
      return row.category === "finans" && row.title.toLowerCase().includes("ödeme");
    case "satis":
      return row.category === "satis";
    case "finans":
      return row.category === "finans";
    case "belge":
      return row.category === "belge";
    case "siparis":
      return row.title.toLowerCase().includes("sipariş");
    case "ai":
      return row.category === "ai";
    default:
      return true;
  }
}
