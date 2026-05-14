import type { HTMLAttributes, ReactNode } from "react";

export type UiBadgeTone = "neutral" | "info" | "success" | "warning" | "danger";

export type UiBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: UiBadgeTone;
  children: ReactNode;
};

export function UiBadge({ tone = "neutral", className = "", children, ...rest }: UiBadgeProps) {
  const classes = ["hz-ui-badge", `hz-ui-badge--${tone}`, className].filter(Boolean).join(" ");
  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  );
}
