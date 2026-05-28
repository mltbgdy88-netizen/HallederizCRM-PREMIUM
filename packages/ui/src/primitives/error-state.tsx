import type { ReactNode } from "react";

export type ErrorStateProps = {
  title?: string;
  message?: string;
  /** Ek içerik (ör. madde listesi). Teknik hata metni sızdırmayın. */
  details?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

const DEFAULT_ERROR_MESSAGE = "İşlem şu anda tamamlanamadı. Lütfen tekrar deneyin.";

export function ErrorState({
  title = "Bilgi alınamadı",
  message = DEFAULT_ERROR_MESSAGE,
  details,
  actions,
  className = ""
}: ErrorStateProps) {
  return (
    <div className={["hz-ui-error", className].filter(Boolean).join(" ")} role="alert">
      {title ? <h4 className="hz-ui-error-title">{title}</h4> : null}
      <p className="hz-ui-error-message">{message}</p>
      {details ? <div className="hz-ui-error-details">{details}</div> : null}
      {actions ? <div className="hz-ui-error-actions">{actions}</div> : null}
    </div>
  );
}

