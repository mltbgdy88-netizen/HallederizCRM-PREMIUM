import type { HTMLAttributes, ReactNode } from "react";

export type DataTableShellProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

/** Kompakt tablo kabuğu: taşan gövde, sticky thead için `table` + `thead` kullanın. */
export function DataTableShell({ children, className = "", ...rest }: DataTableShellProps) {
  return (
    <div className={["hz-ui-data-table", className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </div>
  );
}

export function DataTableFooter({ children }: { children: ReactNode }) {
  return <div className="hz-ui-data-table-footer">{children}</div>;
}
