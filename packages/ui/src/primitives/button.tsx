import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type UiButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type UiButtonSize = "sm" | "md";

export type UiButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: UiButtonVariant;
  size?: UiButtonSize;
  loading?: boolean;
  children: ReactNode;
};

export const UiButton = forwardRef<HTMLButtonElement, UiButtonProps>(function UiButton(
  { variant = "secondary", size = "md", loading = false, className = "", disabled, type = "button", children, ...rest },
  ref
) {
  const classes = [
    "hz-ui-btn",
    `hz-ui-btn--${variant}`,
    `hz-ui-btn--${size}`,
    loading ? "is-loading" : "",
    disabled ? "is-disabled" : "",
    className
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button ref={ref} type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading ? <span className="hz-ui-btn-spinner" aria-hidden /> : null}
      <span className="hz-ui-btn-label">{children}</span>
    </button>
  );
});
