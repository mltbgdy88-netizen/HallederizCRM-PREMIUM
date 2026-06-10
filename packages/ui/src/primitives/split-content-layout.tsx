import type { ReactNode } from "react";

export type SplitSideWidth = "default" | "detail";

export interface SplitContentLayoutProps {
  main: ReactNode;
  side?: ReactNode;
  /** `detail`: sağ panel ~336px (onay önizleme / detay paneli bandı) */
  sideWidth?: SplitSideWidth;
}

export function SplitContentLayout({ main, side, sideWidth = "default" }: SplitContentLayoutProps) {
  const sideClass = side && sideWidth === "detail" ? "hz-split-layout--detail-side" : "";
  return (
    <section className={["hz-split-layout", side ? "" : "no-side", sideClass].filter(Boolean).join(" ")}>
      <div className="hz-split-main">{main}</div>
      {side ? <aside className="hz-split-side">{side}</aside> : null}
    </section>
  );
}

