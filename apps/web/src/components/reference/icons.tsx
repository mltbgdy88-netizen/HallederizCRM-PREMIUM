import type { ReactNode } from "react";

type IconProps = { className?: string };

export function IconDashboard({ className }: IconProps) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="5" rx="1.5" />
      <rect x="13" y="10" width="8" height="11" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}

export function IconZap({ className }: IconProps) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M13 2 3 14h8l-1 8 10-12h-8l1-8z" strokeLinejoin="round" />
    </svg>
  );
}

export function IconShield({ className }: IconProps) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 3 4 7v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V7l-8-4z" />
    </svg>
  );
}

export function IconMessage({ className }: IconProps) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H7l-4 3V11.5A8.5 8.5 0 0 1 11.5 3h1A8.5 8.5 0 0 1 21 11.5z" />
    </svg>
  );
}

export function IconUsers({ className }: IconProps) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M15 20c.3-2.4 2-4 4-4 1.2 0 2.3.5 3 1.3" />
    </svg>
  );
}

export function IconWallet({ className }: IconProps) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M3 7h15a3 3 0 0 1 3 3v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
      <path d="M3 7V5a2 2 0 0 1 2-2h14v4M17 14h.01" />
    </svg>
  );
}

export function IconTruck({ className }: IconProps) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M1 3h12v11H1zM13 7h5l3 4v3h-8V7z" />
      <circle cx="6" cy="17" r="2" />
      <circle cx="18" cy="17" r="2" />
    </svg>
  );
}

export function IconBox({ className }: IconProps) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 3 3 7.5 12 12l9-4.5L12 3z" />
      <path d="M3 12.5 12 17l9-4.5" />
      <path d="M3 17.5 12 22l9-4.5" />
    </svg>
  );
}

export function IconFile({ className }: IconProps) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}

export function IconCart({ className }: IconProps) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M6 6h15l-1.5 9h-12L6 6z" />
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
    </svg>
  );
}

export function IconFactory({ className }: IconProps) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M3 21V9l6-3v6l6-3v12" />
      <path d="M3 21h18" />
      <path d="M9 9v2M15 12v2" />
    </svg>
  );
}

export function IconPuzzle({ className }: IconProps) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 2v6M12 16v6M4.9 4.9l4.2 4.2M14.9 14.9l4.2 4.2M2 12h6M16 12h6M4.9 19.1l4.2-4.2M14.9 9.1l4.2-4.2" />
    </svg>
  );
}

export function IconArchive({ className }: IconProps) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="3" y="4" width="18" height="4" rx="1" />
      <path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
      <path d="M10 12h4" />
    </svg>
  );
}

export function IconInvoice({ className }: IconProps) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
      <path d="M14 2v6h6M8 13h8M8 17h5" />
    </svg>
  );
}

export function IconReturn({ className }: IconProps) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M7 16V4M7 4 3 8l4 4M17 8v12M17 20l4-4-4-4" />
    </svg>
  );
}

export function IconChart({ className }: IconProps) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <rect x="7" y="11" width="3" height="7" rx="0.5" />
      <rect x="12" y="8" width="3" height="10" rx="0.5" />
      <rect x="17" y="5" width="3" height="13" rx="0.5" />
    </svg>
  );
}

export function IconSettings({ className }: IconProps) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </svg>
  );
}

export function IconSearch({ className }: IconProps) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function IconSun({ className }: IconProps) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </svg>
  );
}

export function IconBell({ className }: IconProps) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M18 16H6l1.5-2V10a4.5 4.5 0 0 1 9 0v4L18 16z" />
      <path d="M10 18a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function IconChevronDown({ className }: IconProps) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconRefresh({ className }: IconProps) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M21 12a9 9 0 1 1-2.6-6.3" />
      <path d="M21 3v5h-5" />
    </svg>
  );
}

export function IconSparkle({ className }: IconProps) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 3l1.2 4.2L17 8.5l-3.8 1.3L12 14l-1.2-4.2L7 8.5l3.8-1.3L12 3z" />
      <path d="M19 14l.7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7L19 14z" />
    </svg>
  );
}

export function IconArrowRight({ className }: IconProps) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconChat({ className }: IconProps) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H7l-4 3V11.5A8.5 8.5 0 0 1 11.5 3h1A8.5 8.5 0 0 1 21 11.5z" />
    </svg>
  );
}

export function IconInfo({ className }: IconProps) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6M12 7h.01" />
    </svg>
  );
}

export function IconPlay({ className }: IconProps) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export function IconMenu({ className }: IconProps) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconTasks({ className }: IconProps) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 10h8M8 14h5M8 7h.01" />
    </svg>
  );
}

export const NAV_ICON_MAP = {
  dashboard: IconDashboard,
  quick: IconZap,
  approvals: IconShield,
  whatsapp: IconMessage,
  customers: IconUsers,
  payments: IconWallet,
  deliveries: IconTruck,
  offers: IconFile,
  stock: IconBox,
  invoices: IconInvoice,
  returns: IconReturn,
  warehouse: IconBox,
  documents: IconFile,
  tasks: IconTasks,
  factory: IconFactory,
  integration: IconPuzzle,
  orders: IconCart,
  archive: IconArchive,
  reports: IconChart,
  settings: IconSettings,
  accounting: IconWallet,
  ai: IconSparkle
} as const;

export function NavIcon({ id, className }: { id: keyof typeof NAV_ICON_MAP; className?: string }) {
  const Icon = NAV_ICON_MAP[id];
  return <Icon className={className} />;
}

export function FlowIcon({ kind }: { kind: string }) {
  const cls = "ref-flow-icon-svg";
  switch (kind) {
    case "plus":
      return (
        <svg className={cls} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      );
    case "alert":
      return (
        <svg className={cls} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path d="M12 3 2 20h20L12 3z" />
          <path d="M12 10v4M12 17h.01" />
        </svg>
      );
    case "transfer":
      return (
        <svg className={cls} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path d="M7 7h11M14 4l4 3-4 3M17 17H6M10 20l-4-3 4-3" />
        </svg>
      );
    case "price":
      return (
        <svg className={cls} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path d="M7 7h10a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h10" />
          <path d="M12 4v16" />
        </svg>
      );
    case "shelf":
      return (
        <svg className={cls} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path d="M4 6h16M4 12h16M4 18h16" />
          <path d="M7 6v12M17 6v12" />
        </svg>
      );
    default:
      return (
        <svg className={cls} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      );
  }
}

export function KpiIcon({ tone }: { tone: string }) {
  const cls = "ref-kpi-icon-svg";
  const props = { className: cls, width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.75, "aria-hidden": true as const };
  if (tone === "gold") {
    return (
      <svg {...props}>
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <path d="M7 7h.01" />
      </svg>
    );
  }
  if (tone === "orange") {
    return (
      <svg {...props}>
        <path d="M12 3 2 20h20L12 3z" />
        <path d="M12 10v4" />
      </svg>
    );
  }
  if (tone === "blue") {
    return (
      <svg {...props}>
        <path d="M3 21h18" />
        <path d="M5 21V7l7-4 7 4v14" />
        <path d="M9 21v-6h6v6" />
      </svg>
    );
  }
  if (tone === "slate") {
    return (
      <svg {...props}>
        <path d="M4 7h16v14H4z" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M8 11h8M8 15h8" />
      </svg>
    );
  }
  if (tone === "teal") {
    return (
      <svg {...props}>
        <path d="M3 9l9-6 9 6v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <path d="M9 22V12h6v10" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.3 7.3 12 12l8.7-4.7M12 22V12" />
    </svg>
  );
}

export function ChevronRightSmall() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export function ShieldLogo({ children }: { children?: ReactNode }) {
  return (
    <span className="ref-sidebar-logo-mark" aria-hidden>
      {children ?? "P"}
    </span>
  );
}
