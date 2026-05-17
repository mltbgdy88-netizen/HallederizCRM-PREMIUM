export interface UserMenuProps {
  fullName: string;
  roleLabel: string;
  onLogout: () => void;
}

export function UserMenu({ fullName, roleLabel, onLogout }: UserMenuProps) {
  return (
    <div className="hz-user-menu">
      <div>
        <p className="hz-user-menu-name">{fullName}</p>
        <p className="hz-user-menu-role">{roleLabel}</p>
      </div>
      <button type="button" onClick={onLogout} className="hz-user-menu-logout">
        Çıkış
      </button>
    </div>
  );
}
