import type { HTMLAttributes, ReactNode } from "react";

export type UiCardPadding = "none" | "sm" | "md";

export type UiCardProps = HTMLAttributes<HTMLDivElement> & {
  padding?: UiCardPadding;
  /** Hover’da gölge yükseltmesi (tıklanabilir / vurgulu kartlar için) */
  interactive?: boolean;
  children: ReactNode;
};

export function UiCard({ padding = "md", interactive = false, className = "", children, ...rest }: UiCardProps) {
  const classes = ["hz-ui-card", `hz-ui-card--pad-${padding}`, interactive ? "hz-ui-card--interactive" : "", className]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

export type UiCardHeaderProps = {
  title: string;
  action?: ReactNode;
};

export function UiCardHeader({ title, action }: UiCardHeaderProps) {
  return (
    <div className="hz-ui-card-header">
      <h3 className="hz-ui-card-title">{title}</h3>
      {action ? <div className="hz-ui-card-header-action">{action}</div> : null}
    </div>
  );
}
