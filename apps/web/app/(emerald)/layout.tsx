import { ReferenceEmeraldShell } from "../../src/components/reference-emerald-shell";
import { ProtectedRoute } from "../../src/components/protected-route";

export default function EmeraldLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute>
      <ReferenceEmeraldShell>{children}</ReferenceEmeraldShell>
    </ProtectedRoute>
  );
}
