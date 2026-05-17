import type { HTMLAttributes, ReactNode } from "react";

export type DetailPanelProps = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
};

/** Sağ detay / önizleme paneli — genişlik üst sınırı `SplitContentLayout` + `--hz-detail-panel-width` ile uyumlu. */
export function DetailPanel({ title, children, footer, className = "", ...rest }: DetailPanelProps) {
  return (
    <div className={["hz-ui-detail-panel", className].filter(Boolean).join(" ")} {...rest}>
      {title ? (
        <header className="hz-ui-detail-panel-head">
          <h3 className="hz-ui-detail-panel-title">{title}</h3>
        </header>
      ) : null}
      <div className="hz-ui-detail-panel-body">{children}</div>
      {footer ? <footer className="hz-ui-detail-panel-foot">{footer}</footer> : null}
    </div>
  );
}
