import { PlatformShell } from "../../src/components/platform-shell";
import { ProtectedRoute } from "../../src/components/protected-route";
import { PrintExportCommandCenterLayer } from "../../src/shell/print-export";

export default function PlatformLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute>
      <PlatformShell>
        {children}
        <PrintExportCommandCenterLayer />
      </PlatformShell>
    </ProtectedRoute>
  );
}
