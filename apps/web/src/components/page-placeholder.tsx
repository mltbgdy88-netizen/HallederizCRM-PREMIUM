import type { ReactNode } from "react";

interface PagePlaceholderProps {
  title: string;
  description: string;
  children?: ReactNode;
}

export function PagePlaceholder({ title, description, children }: PagePlaceholderProps) {
  return (
    <section className="card">
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </section>
  );
}
