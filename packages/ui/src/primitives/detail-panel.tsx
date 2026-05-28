import type { HTMLAttributes, ReactNode } from "react";

export type DetailPanelState = "default" | "loading" | "empty" | "error";

export type DetailPanelProps = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  subtitle?: string;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  emptyState?: ReactNode;
  loadingState?: ReactNode;
  errorState?: ReactNode;
  state?: DetailPanelState;
  bodyScrollable?: boolean;
};

function resolvePanelBody(props: DetailPanelProps): ReactNode {
  const { state = "default", loadingState, emptyState, errorState, children } = props;
  if (state === "loading" && loadingState) return loadingState;
  if (state === "error" && errorState) return errorState;
  if (state === "empty" && emptyState) return emptyState;
  return children ?? null;
}

/** Sağ detay / önizleme paneli — genişlik üst sınırı `SplitContentLayout` + `--hz-detail-panel-width` ile uyumlu. */
export function DetailPanel({
  title,
  subtitle,
  eyebrow,
  actions,
  children,
  footer,
  emptyState,
  loadingState,
  errorState,
  state = "default",
  bodyScrollable = false,
  className = "",
  ...rest
}: DetailPanelProps) {
  const body = resolvePanelBody({
    children,
    emptyState,
    loadingState,
    errorState,
    state
  });
  const isStatePanel = state !== "default" && Boolean(loadingState || emptyState || errorState);
  const hasHead = Boolean(title || subtitle || eyebrow || actions);

  return (
    <aside
      className={["hz-ui-detail-panel", "hz-layout-detail-panel", className].filter(Boolean).join(" ")}
      aria-busy={state === "loading" ? true : undefined}
      {...rest}
    >
      {hasHead ? (
        <header className="hz-ui-detail-panel-head hz-layout-detail-panel-head">
          <div className="hz-layout-detail-panel-head-row">
            <div>
              {eyebrow ? <div className="hz-layout-detail-panel-eyebrow">{eyebrow}</div> : null}
              {title ? (
                <h3 className="hz-ui-detail-panel-title hz-layout-detail-panel-title" id={rest.id ? `${rest.id}-title` : undefined}>
                  {title}
                </h3>
              ) : null}
              {subtitle ? <p className="hz-layout-detail-panel-subtitle">{subtitle}</p> : null}
            </div>
            {actions ? <div className="hz-layout-detail-panel-actions">{actions}</div> : null}
          </div>
        </header>
      ) : null}
      <div
        className={[
          "hz-ui-detail-panel-body",
          "hz-layout-detail-panel-body",
          bodyScrollable ? "hz-layout-detail-panel-body--scroll" : "",
          isStatePanel ? "hz-layout-detail-panel-state" : ""
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {body}
      </div>
      {footer ? <footer className="hz-ui-detail-panel-foot hz-layout-detail-panel-foot">{footer}</footer> : null}
    </aside>
  );
}
