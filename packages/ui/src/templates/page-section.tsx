import type { ReactNode } from "react";

export type PageSectionProps = {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Agent 03 — sayfa içi bölüm kabuğu (presentational). */
export function PageSection({ title, description, actions, children, className = "" }: PageSectionProps) {
  return (
    <section className={["hz-template-page-section", className].filter(Boolean).join(" ")}>
      {(title || description || actions) && (
        <header className="hz-template-page-section-head">
          <div>
            {title ? <h2 className="hz-template-page-section-title">{title}</h2> : null}
            {description ? <p className="hz-template-page-section-desc">{description}</p> : null}
          </div>
          {actions ? <div className="hz-template-page-section-actions">{actions}</div> : null}
        </header>
      )}
      <div className="hz-template-page-section-body">{children}</div>
    </section>
  );
}

