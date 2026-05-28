import type { ReactNode } from "react";

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, breadcrumb, actions }: PageHeaderProps) {
  return (
    <section className="hz-page-header">
      <div className="hz-page-header-main">
        {breadcrumb ? <p className="hz-page-breadcrumb">{breadcrumb}</p> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="hz-page-header-actions">{actions}</div> : null}
    </section>
  );
}
