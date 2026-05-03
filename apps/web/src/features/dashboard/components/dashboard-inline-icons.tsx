/** Stroke icons for dashboard — no extra dependencies (Lucide-style paths). */

type IcoProps = { size?: number; className?: string };

const S = {
  round: { strokeLinecap: "round" as const, strokeLinejoin: "round" as const }
};

export function IconTrendingUp({ size = 22, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M22 7l-8.5 8.5-5-5L2 17" stroke="currentColor" strokeWidth="2" {...S.round} />
      <path d="M16 7h6v6" stroke="currentColor" strokeWidth="2" {...S.round} />
    </svg>
  );
}

export function IconWallet({ size = 22, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M19 7V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-1" stroke="currentColor" strokeWidth="2" {...S.round} />
      <path d="M3 10h14a2 2 0 012 2v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-7z" stroke="currentColor" strokeWidth="2" {...S.round} />
      <path d="M17 14h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function IconMessageCircle({ size = 22, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
        stroke="currentColor"
        strokeWidth="2"
        {...S.round}
      />
    </svg>
  );
}

export function IconShieldCheck({ size = 22, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" {...S.round} />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" {...S.round} />
    </svg>
  );
}

export function IconPackage({ size = 22, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M16.5 9.4 7.55 4.24M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" strokeWidth="2" {...S.round} />
      <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke="currentColor" strokeWidth="2" {...S.round} />
    </svg>
  );
}

export function IconClipboardCheck({ size = 18, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="currentColor" strokeWidth="2" {...S.round} />
      <path d="M9 5a2 2 0 012-2h2a2 2 0 012 2v0a2 2 0 01-2 2h-2a2 2 0 01-2-2v0z" stroke="currentColor" strokeWidth="2" {...S.round} />
      <path d="M9 14l2 2 4-4" stroke="currentColor" strokeWidth="2" {...S.round} />
    </svg>
  );
}

export function IconTag({ size = 18, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 2H2v10l9.29 9.29a1 1 0 001.41 0l6.59-6.59a1 1 0 000-1.41L12 2z" stroke="currentColor" strokeWidth="2" {...S.round} />
      <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function IconAlertTriangle({ size = 18, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" {...S.round} />
      <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconFileCheck({ size = 18, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2" {...S.round} />
      <path d="M14 2v6h6M9 15l2 2 4-4" stroke="currentColor" strokeWidth="2" {...S.round} />
    </svg>
  );
}

export function IconCreditCard({ size = 18, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M2 10h20" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function IconBanknote({ size = 18, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="2" />
      <path d="M6 12h.01M18 12h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconRotateCcw({ size = 18, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" stroke="currentColor" strokeWidth="2" {...S.round} />
      <path d="M3 3v5h5" stroke="currentColor" strokeWidth="2" {...S.round} />
    </svg>
  );
}

export function IconSend({ size = 18, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" {...S.round} />
    </svg>
  );
}

export function IconReceipt({ size = 18, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z" stroke="currentColor" strokeWidth="2" {...S.round} />
      <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export type RowListIcon =
  | "clipboard"
  | "tag"
  | "package"
  | "alert"
  | "fileCheck"
  | "wallet"
  | "card"
  | "banknote"
  | "rotate";

export function RowListIconSvg({ kind, size = 17 }: { kind: RowListIcon; size?: number }) {
  switch (kind) {
    case "clipboard":
      return <IconClipboardCheck size={size} />;
    case "tag":
      return <IconTag size={size} />;
    case "package":
      return <IconPackage size={size} />;
    case "alert":
      return <IconAlertTriangle size={size} />;
    case "fileCheck":
      return <IconFileCheck size={size} />;
    case "wallet":
      return <IconWallet size={size} />;
    case "card":
      return <IconCreditCard size={size} />;
    case "banknote":
      return <IconBanknote size={size} />;
    case "rotate":
      return <IconRotateCcw size={size} />;
    default:
      return <IconClipboardCheck size={size} />;
  }
}

export type KpiBubbleKind = "revenue" | "wallet" | "whatsapp" | "shield" | "box";

export function KpiBubbleIcon({ kind, size = 22 }: { kind: KpiBubbleKind; size?: number }) {
  const c = "hz-dash-kpi-ico";
  switch (kind) {
    case "revenue":
      return <IconTrendingUp size={size} className={c} />;
    case "wallet":
      return <IconWallet size={size} className={c} />;
    case "whatsapp":
      return <IconMessageCircle size={size} className={c} />;
    case "shield":
      return <IconShieldCheck size={size} className={c} />;
    case "box":
      return <IconPackage size={size} className={c} />;
    default:
      return null;
  }
}

export type QuickBubbleKind = "order" | "price" | "stock" | "pay" | "return" | "doc";

/** Dashboard quick bubbles & quick-op workflow tabs */
export function QuickActionIcon({
  kind,
  size = 26,
  className = "hz-dash-quick-svg"
}: {
  kind: QuickBubbleKind;
  size?: number;
  /** Dashboard: default hz-dash-quick-svg; quick-op tabs pass hz-qop-tab-svg */
  className?: string;
}) {
  const c = className;
  switch (kind) {
    case "order":
      return (
        <svg className={c} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="9" cy="20" r="1.5" fill="currentColor" />
          <circle cx="18" cy="20" r="1.5" fill="currentColor" />
          <path
            d="M2 3h2l.4 2M4 5h15l-1.5 9.5a2 2 0 01-2 1.7H7.7a2 2 0 01-2-1.4L4 7M4 7 6 3"
            stroke="currentColor"
            strokeWidth="2"
            {...S.round}
          />
        </svg>
      );
    case "price":
      return <IconTag size={size} className={c} />;
    case "stock":
      return <IconPackage size={size} className={c} />;
    case "pay":
      return <IconBanknote size={size} className={c} />;
    case "return":
      return <IconRotateCcw size={size} className={c} />;
    case "doc":
      return (
        <svg className={c} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2" {...S.round} />
          <path d="M14 2v6h6M12 18l-2-2 2-2M16 14h-6" stroke="currentColor" strokeWidth="2" {...S.round} />
        </svg>
      );
    default:
      return null;
  }
}

/** Lucide-style trash-2 — quick-op row delete */
export function IconTrash2({ size = 16, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"
        stroke="currentColor"
        strokeWidth="2"
        {...S.round}
      />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconPlusCircle({ size = 16, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconListRows({ size = 15, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 6h11M9 12h11M9 18h11M5 6h.01M5 12h.01M5 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconClipboardList({ size = 15, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="currentColor" strokeWidth="2" {...S.round} />
      <path d="M9 5a2 2 0 012-2h2a2 2 0 012 2v0a2 2 0 01-2 2h-2a2 2 0 01-2-2v0z" stroke="currentColor" strokeWidth="2" {...S.round} />
      <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconCalculator({ size = 15, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 7h8M8 11h2M12 11h2M16 11h2M8 15h2M12 15h2M16 15h2M8 19h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconSparkles({ size = 15, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3v3M12 18v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M3 12h3M18 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconMessageSquare({ size = 15, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M21 15a2 2 0 01-2 2H8l-5 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="2" {...S.round} />
    </svg>
  );
}

export function IconSave({ size = 16, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" {...S.round} />
      <path d="M17 21v-8H7v8M7 3v5h8" stroke="currentColor" strokeWidth="2" {...S.round} />
    </svg>
  );
}

export function IconPrinter({ size = 16, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 9V3h12v6M6 14H4a2 2 0 01-2-2v-3a2 2 0 012-2h16a2 2 0 012 2v3a2 2 0 01-2 2h-2M6 14v6h12v-6" stroke="currentColor" strokeWidth="2" {...S.round} />
      <path d="M6 18h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconEraser({ size = 16, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M8 21h12M5.4 16.6L16 6l4 4-10.6 10.6a2 2 0 01-2.83 0L5.4 19.43a2 2 0 010-2.83z" stroke="currentColor" strokeWidth="2" {...S.round} />
    </svg>
  );
}

export function IconCheckCircle({ size = 16, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" {...S.round} />
    </svg>
  );
}

export function IconArrowDownLeft({ size = 14, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M17 7L7 17M17 17H7V7" stroke="currentColor" strokeWidth="2" {...S.round} />
    </svg>
  );
}

export function IconArrowUpRight({ size = 14, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M7 17L17 7M17 17V7H7" stroke="currentColor" strokeWidth="2" {...S.round} />
    </svg>
  );
}

export type ActivityIconKind = "order" | "pay" | "invoice" | "wa" | "stock" | "doc";

export function ActivityFeedIcon({ kind, size = 17 }: { kind: ActivityIconKind; size?: number }) {
  const c = "hz-dash-feed-svg";
  switch (kind) {
    case "order":
      return <IconClipboardCheck size={size} className={c} />;
    case "pay":
      return <IconWallet size={size} className={c} />;
    case "invoice":
      return <IconReceipt size={size} className={c} />;
    case "wa":
      return <IconMessageCircle size={size} className={c} />;
    case "stock":
      return <IconPackage size={size} className={c} />;
    case "doc":
      return <IconSend size={size} className={c} />;
    default:
      return <IconClipboardCheck size={size} className={c} />;
  }
}
