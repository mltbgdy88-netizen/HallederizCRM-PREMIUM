export interface UserMenuProps {
  fullName: string;
  roleLabel: string;
  onLogout: () => void;
}

function initialsFromName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

export function UserMenu({ fullName, roleLabel, onLogout }: UserMenuProps) {
  const initials = initialsFromName(fullName);

  return (
    <details className="hz-user-menu-details">
      <summary className="hz-user-menu-summary" aria-label={`${fullName}, ${roleLabel}`}>
        <span className="hz-user-menu-avatar" aria-hidden>
          {initials}
        </span>
        <span className="hz-user-menu-summary-label">Profil</span>
      </summary>
      <div className="hz-user-menu-panel hz-user-menu">
        <div>
          <p className="hz-user-menu-name">{fullName}</p>
          <p className="hz-user-menu-role">{roleLabel}</p>
        </div>
        <button type="button" onClick={onLogout} className="hz-user-menu-logout">
          Çıkış
        </button>
      </div>
    </details>
  );
}
