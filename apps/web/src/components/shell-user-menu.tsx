// @ts-nocheck
"use client";

function initialsFromName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return "";
  }
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

function summaryLabelFromName(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed || trimmed.length < 2) {
    return "Hesap";
  }
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const last = parts[parts.length - 1]!;
    if (last.length >= 2) {
      return last;
    }
  }
  const first = parts[0]!;
  if (first.length < 2 || /^platform$/i.test(first)) {
    return "Hesap";
  }
  return first;
}

export function ShellUserMenu({
  fullName,
  roleLabel,
  onLogout
}: {
  fullName: string;
  roleLabel: string;
  onLogout: () => void;
}) {
  const safeName = fullName.trim() || "Hesap";
  const initials = initialsFromName(safeName) || "HK";
  const summaryLabel = summaryLabelFromName(fullName);

  return (
    <details className="hz-user-menu-details hz-shell-user-menu">
      <summary className="hz-user-menu-summary" aria-label={`${safeName}, ${roleLabel}`}>
        <span className="hz-user-menu-avatar" aria-hidden>
          {initials}
        </span>
        <span className="hz-user-menu-summary-label">{summaryLabel}</span>
      </summary>
      <div className="hz-user-menu-panel hz-user-menu">
        <div>
          <p className="hz-user-menu-name">{safeName}</p>
          <p className="hz-user-menu-role">{roleLabel}</p>
        </div>
        <button type="button" onClick={onLogout} className="hz-user-menu-logout">
          Çıkış
        </button>
      </div>
    </details>
  );
}


