"use client";

import { useCallback, useState } from "react";
import type { ApprovalClient } from "../api/approval-client";
import { mapApprovalUiErrorMessage } from "../utils/inbox-helpers";

export function ApprovalSandboxToolbar({
  client,
  visible,
  availabilityHelp,
  onAfterSeed
}: {
  client: ApprovalClient;
  visible: boolean;
  availabilityHelp?: string | null;
  onAfterSeed: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [localMessage, setLocalMessage] = useState<string | null>(null);

  const runSeed = useCallback(async () => {
    setBusy(true);
    setLocalMessage(null);
    const result = await client.seedSandboxApprovals();
    setBusy(false);
    if (!result.ok) {
      setLocalMessage(mapApprovalUiErrorMessage(result.error));
      return;
    }
    const created = result.data.created?.length ?? 0;
    const skipped = result.data.skipped?.length ?? 0;
    setLocalMessage(`Sandbox: ${created} yeni kayit, ${skipped} idempotent atlandi.`);
    await onAfterSeed();
  }, [client, onAfterSeed]);

  if (!visible) {
    return null;
  }

  return (
    <section className="hz-approvals-sandbox-toolbar" aria-label="Demo sandbox onay araclari">
      <p>
        <strong>Demo onay kaydi olustur</strong> — yalnizca local/demo API; production&apos;da kapalidir. Sahte liste
        uretmez; API uzerinden repository&apos;e yazar.
      </p>
      <button type="button" disabled={busy} onClick={() => void runSeed()}>
        {busy ? "Olusturuluyor..." : "Demo onay kaydi olustur"}
      </button>
      {availabilityHelp ? <p role="status">{availabilityHelp}</p> : null}
      {localMessage ? <p role="status">{localMessage}</p> : null}
    </section>
  );
}
