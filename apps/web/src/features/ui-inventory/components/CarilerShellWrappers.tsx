import type { ReactNode } from "react";

export function CarilerYeniCommandCenterShell({ children }: { children: ReactNode }) {
  return (
    <div className="hz-cariler-yeni-center hz-entity-layer-desk" data-page="cariler-yeni-command-center">
      {children}
    </div>
  );
}

export function CarilerCustomeridCommandCenterShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="hz-cariler-customerid-center hz-entity-layer-desk hz-entity-layer-desk--stacked"
      data-page="cariler-customerid-command-center"
    >
      {children}
    </div>
  );
}
