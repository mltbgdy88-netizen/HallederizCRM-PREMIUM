import type { HTMLAttributes, ReactNode } from "react";

export type DataTableDensity = "default" | "compact";

export type DataTableShellProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  toolbar?: ReactNode;
  emptyState?: ReactNode;
  loadingState?: ReactNode;
  errorState?: ReactNode;
  mobileView?: ReactNode;
  footer?: ReactNode;
  density?: DataTableDensity;
  /** `loading` | `empty` | `error` verildiğinde ilgili slot önceliklidir. */
  state?: "default" | "loading" | "empty" | "error";
};

function resolveTableBody(props: Pick<DataTableShellProps, "state" | "loadingState" | "emptyState" | "errorState" | "children">): ReactNode {
  const { state = "default", loadingState, emptyState, errorState, children } = props;
  if (state === "loading" && loadingState) return loadingState;
  if (state === "error" && errorState) return errorState;
  if (state === "empty" && emptyState) return emptyState;
  return children ?? null;
}

/** Kompakt tablo kabuğu: taşan gövde, sticky thead için `table` + `thead` kullanın. */
export function DataTableShell({
  children,
  toolbar,
  emptyState,
  loadingState,
  errorState,
  mobileView,
  footer,
  density = "default",
  state = "default",
  className = "",
  ...rest
}: DataTableShellProps) {
  const body = resolveTableBody({
    children,
    emptyState,
    loadingState,
    errorState,
    state
  });
  const isStatePanel = state !== "default" && Boolean(loadingState || emptyState || errorState);
  const mobileClass = mobileView ? "hz-layout-data-table--mobile-cards" : "";

  return (
    <div
      className={[
        "hz-ui-data-table",
        "hz-layout-data-table",
        density === "compact" ? "hz-layout-data-table--compact" : "",
        mobileClass,
        className
      ]
        .filter(Boolean)
        .join(" ")}
      role="region"
      aria-label={rest["aria-label"] ?? "Veri tablosu"}
      aria-busy={state === "loading" ? true : undefined}
      {...rest}
    >
      {toolbar ? <div className="hz-layout-data-table-toolbar">{toolbar}</div> : null}
      <div className={isStatePanel ? "hz-layout-data-table-state" : "hz-layout-data-table-body"}>{body}</div>
      {mobileView ? <div className="hz-layout-data-table-mobile">{mobileView}</div> : null}
      {footer ? <div className="hz-layout-data-table-footer">{footer}</div> : null}
    </div>
  );
}

export function DataTableFooter({ children }: { children: ReactNode }) {
  return <div className="hz-ui-data-table-footer">{children}</div>;
}

