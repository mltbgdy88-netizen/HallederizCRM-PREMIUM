import type { ReactNode } from "react";

export interface SplitContentLayoutProps {
  main: ReactNode;
  side?: ReactNode;
}

export function SplitContentLayout({ main, side }: SplitContentLayoutProps) {
  return (
    <section className={`hz-split-layout ${side ? "" : "no-side"}`}>
      <div className="hz-split-main">{main}</div>
      {side ? <aside className="hz-split-side">{side}</aside> : null}
    </section>
  );
}
