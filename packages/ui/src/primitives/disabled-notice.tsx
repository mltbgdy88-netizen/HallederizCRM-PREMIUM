import type { ReactNode } from "react";

export type DisabledNoticeProps = {
  title?: string;
  message: string;
  /** İkon veya kısa görsel ipucu. */
  icon?: ReactNode;
  className?: string;
};

/** Özellik kapalı / salt okunur / yetki dışı kısa bilgi bandı. */
export function DisabledNotice({ title = "Bu işlem kullanılamıyor", message, icon, className = "" }: DisabledNoticeProps) {
  return (
    <div className={["hz-ui-disabled-notice", className].filter(Boolean).join(" ")} role="note">
      {icon ? <div className="hz-ui-disabled-notice-icon">{icon}</div> : null}
      <div className="hz-ui-disabled-notice-text">
        <span className="hz-ui-disabled-notice-title">{title}</span>
        <span className="hz-ui-disabled-notice-message">{message}</span>
      </div>
    </div>
  );
}
