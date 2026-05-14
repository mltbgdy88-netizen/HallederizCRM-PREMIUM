import type { ReactNode } from "react";

export type EmptyStateProps = {
  title?: string;
  message: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function EmptyState({ title = "Kayıt bulunamadı", message, icon, actions, className = "" }: EmptyStateProps) {
  return (
    <div className={["hz-ui-empty", className].filter(Boolean).join(" ")} role="status">
      {icon ? <div className="hz-ui-empty-icon">{icon}</div> : null}
      {title ? <h4 className="hz-ui-empty-title">{title}</h4> : null}
      <p className="hz-ui-empty-message">{message}</p>
      {actions ? <div className="hz-ui-empty-actions">{actions}</div> : null}
    </div>
  );
}
