"use client";

import type { ReactNode } from "react";

export function CkmBadge({
  children,
  tone = "ok"
}: {
  children: ReactNode;
  tone?: "ok" | "warn" | "bad" | "info" | "blue" | "neutral" | "green" | "purple" | "orange" | "teal";
}) {
  const resolved = tone === "green" ? "ok" : tone === "orange" ? "warn" : tone;
  return <span className={`ckm-badge ckm-badge--${resolved}`}>{children}</span>;
}
