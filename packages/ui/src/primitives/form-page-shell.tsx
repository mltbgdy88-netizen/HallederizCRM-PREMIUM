import type { ReactNode } from "react";

export type FormPageShellProps = {
  title?: string;
  subtitle?: string;
  intro?: ReactNode;
  validationSummary?: ReactNode;
  children: ReactNode;
  stickyActions?: ReactNode;
  footer?: ReactNode;
  isSubmitting?: boolean;
  isDisabled?: boolean;
  /** Örn. `hz-tahsilatlar-form` — sayfa kökü spacing / shell :has ile eşleştirilebilir. */
  className?: string;
};

/** Task 17 / Agent 03 — form sayfası: gövde + doğrulama özeti + yapışkan aksiyon bandı. */
export function FormPageShell({
  title,
  subtitle,
  intro,
  validationSummary,
  children,
  stickyActions,
  footer,
  isSubmitting = false,
  isDisabled = false,
  className = ""
}: FormPageShellProps) {
  const rootClass = [
    "hz-form-page-shell",
    "hz-form-template-shell",
    isSubmitting ? "hz-form-template-shell--submitting" : "",
    isDisabled ? "hz-form-template-shell--disabled" : "",
    className
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass} aria-busy={isSubmitting || undefined}>
      {(title || subtitle) && (
        <header className="hz-form-template-header">
          {title ? <h1 className="hz-form-template-title">{title}</h1> : null}
          {subtitle ? <p className="hz-form-template-subtitle">{subtitle}</p> : null}
        </header>
      )}
      {intro ? <div className="hz-form-template-intro">{intro}</div> : null}
      {validationSummary ?? null}
      <div className="hz-form-page-shell-body hz-form-template-body">{children}</div>
      {stickyActions ? <div className="hz-form-page-shell-sticky hz-form-template-sticky">{stickyActions}</div> : null}
      {footer ? <div className="hz-form-template-footer">{footer}</div> : null}
    </div>
  );
}
