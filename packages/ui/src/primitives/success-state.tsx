import type { ReactNode } from "react";

export type SuccessStateProps = {
  title?: string;
  message: string;
  actions?: ReactNode;
  className?: string;
};

/** Satır içi başarı özeti (toast yerine blok alanlarda). */
export function SuccessState({ title = "İşlem tamamlandı", message, actions, className = "" }: SuccessStateProps) {
  return (
    <div className={["hz-ui-success", className].filter(Boolean).join(" ")} role="status">
      {title ? <h4 className="hz-ui-success-title">{title}</h4> : null}
      <p className="hz-ui-success-message">{message}</p>
      {actions ? <div className="hz-ui-success-actions">{actions}</div> : null}
    </div>
  );
}
