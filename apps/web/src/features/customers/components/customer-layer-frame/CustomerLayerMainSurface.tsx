"use client";

import type { ReactNode } from "react";
import type { CustomerLayerKey } from "../../../ui-inventory/utils/cariler-subroute-command-center-data";

type Props = {
  layer: CustomerLayerKey;
  main: ReactNode;
  side: ReactNode;
  timelineFilters?: ReactNode;
};

export function CustomerLayerMainSurface({ layer, main, side, timelineFilters }: Props) {
  if (layer === "timeline") {
    return (
      <div className="ckm-workspace ckm-workspace--timeline">
        {timelineFilters}
        <section className="ckm-main ckm-main-scroll ckm-timeline-feed" aria-label="Zaman akışı">
          {main}
        </section>
        {side}
      </div>
    );
  }

  return (
    <div className="ckm-workspace">
      <div className="ckm-main ckm-main-scroll">{main}</div>
      {side}
    </div>
  );
}
