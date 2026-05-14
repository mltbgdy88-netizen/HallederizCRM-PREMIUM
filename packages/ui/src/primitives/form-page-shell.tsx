import type { ReactNode } from "react";

export type FormPageShellProps = {
  children: ReactNode;
  stickyActions?: ReactNode;
  /** Örn. `hz-tahsilatlar-form` — sayfa kökü spacing / shell :has ile eşleştirilebilir. */
  className?: string;
};

/** Task 17 — form sayfası: gövde + altta yapışkan aksiyon bandı yuvası. */
export function FormPageShell({ children, stickyActions, className = "" }: FormPageShellProps) {
  return (
    <div className={["hz-form-page-shell", className].filter(Boolean).join(" ")}>
      <div className="hz-form-page-shell-body">{children}</div>
      {stickyActions ? <div className="hz-form-page-shell-sticky">{stickyActions}</div> : null}
    </div>
  );
}
