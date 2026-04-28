import { PlatformShell } from "../../src/components/platform-shell";
import { ProtectedRoute } from "../../src/components/protected-route";

export default function PlatformLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute>
      <PlatformShell>{children}</PlatformShell>
    </ProtectedRoute>
  );
}
