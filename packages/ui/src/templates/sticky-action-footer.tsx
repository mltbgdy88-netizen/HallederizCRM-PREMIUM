import type { ReactNode } from "react";

export type StickyActionFooterProps = {
  children: ReactNode;
  className?: string;
};

/** Agent 03 — form / detay altı yapışkan aksiyon bandı. */
export function StickyActionFooter({ children, className = "" }: StickyActionFooterProps) {
  return (
    <div className={["hz-template-sticky-footer", className].filter(Boolean).join(" ")} role="group" aria-label="Sayfa aksiyonları">
      {children}
    </div>
  );
}
