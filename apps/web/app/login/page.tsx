// @ts-nocheck
import { Suspense } from "react";
import { LoginSplitPage } from "../../src/features/auth/components/LoginSplitPage";

export default function LoginSplitRoute() {
  return (
    <Suspense
      fallback={
        <main className="lgn-split" role="status" aria-busy="true">
          <p className="lgn-form-head">GiriÅŸ ekranÄ± yÃ¼kleniyorâ€¦</p>
        </main>
      }
    >
      <LoginSplitPage />
    </Suspense>
  );
}

