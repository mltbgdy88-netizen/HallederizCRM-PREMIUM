type IconProps = {
  className?: string;
};

const base = {
  width: 14,
  height: 14,
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.75,
  "aria-hidden": true as const
};

export function IconCdmBack({ className }: IconProps) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

export function IconCdmChevronDown({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconCdmBtn({ kind }: { kind: "edit" | "more" | "plus" }) {
  if (kind === "plus") {
    return (
      <svg {...base} className="cdm-btn-icon">
        <path d="M12 5v14M5 12h14" />
      </svg>
    );
  }
  if (kind === "edit") {
    return (
      <svg {...base} className="cdm-btn-icon">
        <path d="M12 20h9M4 20h2l9.5-9.5a2.1 2.1 0 0 0-3-3L3 17v3z" />
      </svg>
    );
  }
  return (
    <svg {...base} className="cdm-btn-icon">
      <circle cx="12" cy="6" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="12" cy="18" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconCdmPerf({ icon }: { icon: "chart" | "wallet" | "cart" | "calendar" | "open" | "avg" }) {
  const props = { ...base, className: "cdm-perf-icon-svg" };
  if (icon === "wallet") {
    return (
      <svg {...props}>
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    );
  }
  if (icon === "cart") {
    return (
      <svg {...props}>
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="18" cy="20" r="1.5" />
        <path d="M2 4h2l2.4 12.4a2 2 0 0 0 2 1.6h9.2a2 2 0 0 0 2-1.6L20 8H6" />
      </svg>
    );
  }
  if (icon === "calendar") {
    return (
      <svg {...props}>
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4M16 3v4M4 10h16" />
      </svg>
    );
  }
  if (icon === "open") {
    return (
      <svg {...props}>
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
      </svg>
    );
  }
  if (icon === "avg") {
    return (
      <svg {...props}>
        <path d="M4 19h16M7 16l3-4 3 3 4-6" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <path d="M4 20V10M10 20V4M16 20v-6M22 20V8" />
    </svg>
  );
}

export function IconCdmContact({ id }: { id: string }) {
  const props = { ...base, className: "cdm-contact-icon" };
  if (id === "phone" || id === "mobile") {
    return (
      <svg {...props}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    );
  }
  if (id === "email") {
    return (
      <svg {...props}>
        <path d="M4 6h16v12H4z" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9z" />
    </svg>
  );
}

export function IconCkmKpi({ tone }: { tone: string }) {
  const resolved = tone === "bad" ? "orange" : tone === "blue" || tone === "teal" ? "teal" : tone === "purple" ? "green" : tone;
  return (
    <span className={`ckm-kpi-icon ckm-kpi-icon--${resolved}`} aria-hidden>
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
        <path d="M4 20V10M10 20V4M16 20v-6M22 20V8" />
      </svg>
    </span>
  );
}
