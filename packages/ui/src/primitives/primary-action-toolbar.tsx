import type { ReactNode } from "react";

export function PrimaryActionToolbar({ children }: { children: ReactNode }) {
  return <section className="hz-action-toolbar">{children}</section>;
}
