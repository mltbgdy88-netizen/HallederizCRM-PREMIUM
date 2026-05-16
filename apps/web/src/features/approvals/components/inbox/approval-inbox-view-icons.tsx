import type { ReactNode } from "react";
import type { ApprovalInboxViewId } from "../../data/approval-inbox-demo";
import {
  IconAlertTriangle,
  IconBanknote,
  IconBot,
  IconCheckCircle,
  IconClipboardList,
  IconPackage,
  IconSparkles,
  IconUser
} from "../../../dashboard/components/dashboard-inline-icons";

const VIEW_ICONS: Record<ApprovalInboxViewId, (props: { size?: number }) => ReactNode> = {
  kritik: (p) => <IconAlertTriangle size={p.size ?? 15} />,
  bana_atanan: (p) => <IconUser size={p.size ?? 15} />,
  finans: (p) => <IconBanknote size={p.size ?? 15} />,
  operasyon: (p) => <IconPackage size={p.size ?? 15} />,
  ai_onerileri: (p) => <IconSparkles size={p.size ?? 15} />,
  tum: (p) => <IconClipboardList size={p.size ?? 15} />,
  yakin_sonuclanan: (p) => <IconCheckCircle size={p.size ?? 15} />
};

export function ApprovalInboxViewIcon({ viewId }: { viewId: ApprovalInboxViewId }) {
  const Icon = VIEW_ICONS[viewId] ?? IconBot;
  return (
    <span className="hz-approvals-inbox-desk-view-ico" aria-hidden>
      <Icon size={12} />
    </span>
  );
}
