import type { ReactNode } from "react";

export type DisabledNoticeProps = {
  title?: string;
  message?: string;
  /** İkon veya kısa görsel ipucu. */
  icon?: ReactNode;
  className?: string;
};

const DEFAULT_DISABLED_TITLE = "Bu işlem şu anda kullanılamıyor.";

/** Özellik kapalı / salt okunur / yetki dışı kısa bilgi bandı. */
export function DisabledNotice({ title = DEFAULT_DISABLED_TITLE, message, icon, className = "" }: DisabledNoticeProps) {
  return (
    <div className={["hz-ui-disabled-notice", className].filter(Boolean).join(" ")} role="note">
      {icon ? <div className="hz-ui-disabled-notice-icon">{icon}</div> : null}
      <div className="hz-ui-disabled-notice-text">
        <span className="hz-ui-disabled-notice-title">{title}</span>
        {message ? <span className="hz-ui-disabled-notice-message">{message}</span> : null}
      </div>
    </div>
  );
}
