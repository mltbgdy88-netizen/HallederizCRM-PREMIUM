import type { ReactNode } from "react";

export function TekliflerYeniCommandCenterShell({ children }: { children: ReactNode }) {
  return (
    <div className="hz-teklifler-yeni-center hz-entity-layer-desk" data-page="teklifler-yeni-command-center">
      {children}
    </div>
  );
}

export function TekliflerOfferidCommandCenterShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="hz-teklifler-offerid-center hz-entity-layer-desk hz-entity-layer-desk--stacked"
      data-page="teklifler-offerid-command-center"
    >
      {children}
    </div>
  );
}
