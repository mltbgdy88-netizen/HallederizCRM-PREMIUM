import type { ReactNode } from "react";

export interface ContentSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
}

export function ContentSection({ title, description, children }: ContentSectionProps) {
  return (
    <section className="hz-content-card">
      {title ? <h3>{title}</h3> : null}
      {description ? <p className="hz-content-card-description">{description}</p> : null}
      {children}
    </section>
  );
}
