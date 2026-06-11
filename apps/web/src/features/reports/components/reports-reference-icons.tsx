import type { RomKpiIcon } from "../utils/map-reports-to-reference-desk";

type IconProps = { className?: string };

export function IconInfo({ className }: IconProps) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6M12 7h.01" />
    </svg>
  );
}

export function IconRefresh({ className }: IconProps) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M21 12a9 9 0 1 1-2.6-6.3" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

export function IconClose({ className }: IconProps) {
  return (
    <svg className={className} width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function IconMore({ className }: IconProps) {
  return (
    <svg className={className} width={14} height={14} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  );
}

export function RomKpiIconSvg({ icon }: { icon: RomKpiIcon }) {
  const props = {
    className: "rom-kpi-icon-svg",
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    "aria-hidden": true as const
  };

  switch (icon) {
    case "collection":
      return (
        <svg {...props}>
          <path d="M4 7h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" />
          <path d="M18 12h2" />
        </svg>
      );
    case "balance":
      return (
        <svg {...props}>
          <path d="M12 3v18M8 7l4-4 4 4M16 17l-4 4-4-4" />
        </svg>
      );
    case "stock":
      return (
        <svg {...props}>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg {...props}>
          <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H7l-4 3V11.5A8.5 8.5 0 0 1 11.5 3h1A8.5 8.5 0 0 1 21 11.5z" />
        </svg>
      );
    case "ai":
      return (
        <svg {...props}>
          <path d="M12 3 2 12l10 9 10-9L12 3z" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <path d="M4 20V4" />
          <path d="M4 20h16" />
          <rect x="8" y="10" width="3" height="7" />
          <rect x="13" y="7" width="3" height="10" />
        </svg>
      );
  }
}

export function RomSparkline({ points, tone }: { points: number[]; tone: string }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const coords = points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * 56;
      const y = 22 - ((point - min) / range) * 18;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg className={`rom-spark rom-spark--${tone}`} viewBox="0 0 56 24" aria-hidden>
      <polyline points={coords} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MetricIcon({ icon }: { icon: RomKpiIcon }) {
  return (
    <span className="rom-metric-icon" aria-hidden>
      <RomKpiIconSvg icon={icon} />
    </span>
  );
}
