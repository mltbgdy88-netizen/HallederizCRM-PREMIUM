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

export function QuickActionIcon({ kind, size = 26 }: { kind: QuickBubbleKind; size?: number }) {
  const c = "hz-dash-quick-svg";
  switch (kind) {
    case "order":
      return (
        <svg className={c} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 6h18M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "price":
      return <IconTag size={size} className={c} />;
    case "stock":
      return <IconPackage size={size} className={c} />;
    case "pay":
      return <IconCreditCard size={size} className={c} />;
    case "return":
      return <IconRotateCcw size={size} className={c} />;
    case "doc":
      return <IconSend size={size} className={c} />;
    default:
      return null;
  }
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
