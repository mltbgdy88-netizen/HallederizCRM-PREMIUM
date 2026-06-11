"use client";

import type { ReactNode } from "react";

type Props = {
  title?: string;
  ariaLabel: string;
  variant?: "default" | "filter" | "whatsapp" | "summary";
  children: ReactNode;
};

export function CustomerLayerContextPanel({ title, ariaLabel, variant = "default", children }: Props) {
  const variantClass =
    variant === "filter"
      ? " ckm-context--filter"
      : variant === "whatsapp"
        ? " ckm-context--whatsapp"
        : variant === "summary"
          ? " ckm-context--summary"
          : "";

  return (
    <aside className={`ckm-context${variantClass}`} aria-label={ariaLabel}>
      {title ? (
        <header className="ckm-context-head">
          <h2>{title}</h2>
        </header>
      ) : null}
      {children}
    </aside>
  );
}
