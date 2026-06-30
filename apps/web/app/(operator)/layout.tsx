import { OperatorProtectedRoute } from "../../src/components/operator-protected-route";
import { OperatorShell } from "../../src/components/operator-shell";

export default function OperatorLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <OperatorProtectedRoute>
      <OperatorShell>{children}</OperatorShell>
    </OperatorProtectedRoute>
  );
}
