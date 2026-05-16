import type { ApprovalInboxPriority } from "../../data/approval-inbox-demo";

const LABELS: Record<ApprovalInboxPriority, string> = {
  kritik: "KRİTİK",
  yuksek: "YÜKSEK",
  orta: "ORTA",
  dusuk: "DÜŞÜK",
  ai: "AI ÖNERİSİ"
};

export function PriorityBadge({ priority }: { priority: ApprovalInboxPriority }) {
  return (
    <span className={`hz-approvals-inbox-priority hz-approvals-inbox-priority--${priority}`}>
      {LABELS[priority]}
    </span>
  );
}
