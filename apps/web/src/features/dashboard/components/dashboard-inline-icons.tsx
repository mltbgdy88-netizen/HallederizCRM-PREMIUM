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

/** Hızlı işlem / kısayol — tek çizgi şimşek */
export function IconZap({ size = 16, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M13 2L3 14h9l-1 8 10-12h-7l1-8z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
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

export function IconPlus({ size = 16, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconShoppingCart({ size = 18, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 20a1 1 0 100-2 1 1 0 000 2zm7 0a1 1 0 100-2 1 1 0 000 2z" stroke="currentColor" strokeWidth="2" {...S.round} />
      <path d="M3 4h2l1 12h12l2-9H6" stroke="currentColor" strokeWidth="2" {...S.round} />
    </svg>
  );
}

export function IconClock({ size = 16, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconSearch({ size = 16, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconBarcode({ size = 16, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 6v12M7 8v8M10 5v14M13 7v10M16 6v12M19 8v8M22 6v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

export function IconXCircle({ size = 16, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconPaperclip({ size = 16, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21.44 11.05l-9.19 9.19a4.5 4.5 0 01-6.36-6.36l9.2-9.19a3 3 0 014.24 4.24l-9.2 9.19a1.5 1.5 0 01-2.12-2.12l8.08-8.06"
        stroke="currentColor"
        strokeWidth="2"
        {...S.round}
      />
    </svg>
  );
}

export function IconMic({ size = 16, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" stroke="currentColor" strokeWidth="2" {...S.round} />
      <path d="M19 10v1a7 7 0 01-14 0v-1M12 19v4M8 23h8" stroke="currentColor" strokeWidth="2" {...S.round} />
    </svg>
  );
}

export function IconTruck({ size = 18, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 18V8a2 2 0 00-2-2H4a2 2 0 00-2 2v8a1 1 0 001 1h2m9-9h6l3 5v3a1 1 0 01-1 1h-1M14 18h-3m8 0h2a1 1 0 001-1v-2"
        stroke="currentColor"
        strokeWidth="2"
        {...S.round}
      />
      <circle cx="7" cy="18" r="2" stroke="currentColor" strokeWidth="2" />
      <circle cx="17" cy="18" r="2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function IconWarehouse({ size = 18, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 9l9-6 9 6v11a1 1 0 01-1 1H4a1 1 0 01-1-1V9z" stroke="currentColor" strokeWidth="2" {...S.round} />
      <path d="M9 22V12h6v10M9 22h6" stroke="currentColor" strokeWidth="2" {...S.round} />
    </svg>
  );
}

export function IconFilter({ size = 16, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M22 3H2l8 9v9l4 2v-11l8-9z" stroke="currentColor" strokeWidth="2" {...S.round} />
    </svg>
  );
}

export function IconUser({ size = 18, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" {...S.round} />
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function IconBuilding({ size = 18, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 21h18M5 21V7l8-4v18M13 11h4M13 15h4M13 7h4" stroke="currentColor" strokeWidth="2" {...S.round} />
    </svg>
  );
}

export function IconMapPin({ size = 16, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1118 0z" stroke="currentColor" strokeWidth="2" {...S.round} />
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function IconUpload({ size = 16, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" {...S.round} />
    </svg>
  );
}

export function IconExternalLink({ size = 16, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="2" {...S.round} />
    </svg>
  );
}

export function IconPhone({ size = 16, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 10.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
        stroke="currentColor"
        strokeWidth="2"
        {...S.round}
      />
    </svg>
  );
}

export function IconFileText({ size = 18, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2" {...S.round} />
      <path d="M14 2v6h6M9 13h6M9 17h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconShieldAlert({ size = 18, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" {...S.round} />
      <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconFileSearch({ size = 18, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2" {...S.round} />
      <path d="M14 2v6h6M9 13h6M9 17h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="17.5" cy="17.5" r="2.5" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21l-2.35-2.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconArrowRightCircle({ size = 18, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 16l4-4-4-4M8 12h8" stroke="currentColor" strokeWidth="2" {...S.round} />
    </svg>
  );
}

export function IconBot({ size = 18, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="9" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M9 9V7a3 3 0 016 0v2M12 15v.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 19h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="9" cy="13" r="1" fill="currentColor" />
      <circle cx="15" cy="13" r="1" fill="currentColor" />
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

export function IconDownload({ size = 18, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" {...S.round} />
    </svg>
  );
}

export function IconArchive({ size = 18, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M21 8v11a2 2 0 01-2 2H5a2 2 0 01-2-2V8" stroke="currentColor" strokeWidth="2" {...S.round} />
      <path d="M1 3h22v5H1z" stroke="currentColor" strokeWidth="2" {...S.round} />
      <path d="M10 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconDatabase({ size = 18, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <ellipse cx="12" cy="5" rx="9" ry="3" stroke="currentColor" strokeWidth="2" />
      <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" stroke="currentColor" strokeWidth="2" />
      <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function IconMail({ size = 18, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" stroke="currentColor" strokeWidth="2" {...S.round} />
    </svg>
  );
}

export function IconCalendar({ size = 18, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" {...S.round} />
    </svg>
  );
}

export function IconBarChart3({ size = 18, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 20V10M12 20V4M20 20v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconTarget({ size = 18, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

export function IconTrendingDown({ size = 22, className }: IcoProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M23 18l-9.5-9.5-5 5L1 10" stroke="currentColor" strokeWidth="2" {...S.round} />
      <path d="M17 18h6v-6" stroke="currentColor" strokeWidth="2" {...S.round} />
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
