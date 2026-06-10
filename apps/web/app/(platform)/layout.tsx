// @ts-nocheck
import { ReferenceAppShell } from "../../src/components/reference-app-shell";
import { ProtectedRoute } from "../../src/components/protected-route";
import { PrintExportCommandCenterLayer } from "../../src/shell/print-export";

export default function PlatformLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute>
      <ReferenceAppShell>
        {children}
        <PrintExportCommandCenterLayer />
      </ReferenceAppShell>
    </ProtectedRoute>
  );
}

