import type { ReactNode } from "react";

export type EmptyStateProps = {
  title?: string;
  /** Ana açıklama metni (`description` ile aynı). */
  message?: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

const DEFAULT_EMPTY_MESSAGE = "Bu alanda gösterilecek canlı veri henüz yok.";

export function EmptyState({
  title = "Kayıt bulunamadı",
  message,
  description,
  icon,
  actions,
  className = ""
}: EmptyStateProps) {
  const body = message ?? description ?? DEFAULT_EMPTY_MESSAGE;
  return (
    <div className={["hz-ui-empty", className].filter(Boolean).join(" ")} role="status">
      {icon ? <div className="hz-ui-empty-icon">{icon}</div> : null}
      {title ? <h4 className="hz-ui-empty-title">{title}</h4> : null}
      <p className="hz-ui-empty-message">{body}</p>
      {actions ? <div className="hz-ui-empty-actions">{actions}</div> : null}
    </div>
  );
}

