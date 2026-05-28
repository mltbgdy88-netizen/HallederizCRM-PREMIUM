import type { ReactNode } from "react";

export interface PlaceholderCardProps {
  title: string;
  description: string;
  children?: ReactNode;
}

export function PlaceholderCard({ title, description, children }: PlaceholderCardProps) {
  return (
    <article
      style={{
        border: "1px solid #d9dbe1",
        borderRadius: 16,
        background: "#ffffff",
        padding: 24
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: 8 }}>{title}</h2>
      <p style={{ marginTop: 0, marginBottom: children ? 16 : 0, color: "#4d5766" }}>{description}</p>
      {children}
    </article>
  );
}
