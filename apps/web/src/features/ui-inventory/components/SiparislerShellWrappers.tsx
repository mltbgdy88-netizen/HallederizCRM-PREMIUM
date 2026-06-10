import type { ReactNode } from "react";

export function SiparislerYeniCommandCenterShell({ children }: { children: ReactNode }) {
  return (
    <div className="hz-siparisler-yeni-center hz-entity-layer-desk" data-page="siparisler-yeni-command-center">
      {children}
    </div>
  );
}

export function SiparislerOrderidCommandCenterShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="hz-siparisler-orderid-center hz-entity-layer-desk hz-entity-layer-desk--stacked"
      data-page="siparisler-orderid-command-center"
    >
      {children}
    </div>
  );
}
