"use client";

import { useCallback, useState } from "react";
import type { ApprovalClient } from "../api/approval-client";
import { mapApprovalUiErrorMessage } from "../utils/inbox-helpers";
import { formatSandboxSeedOutcome } from "../utils/operator-smoke";

export function ApprovalSandboxToolbar({
  client,
  visible,
  availabilityHelp,
  onAfterSeed,
  onSeedCounts
}: {
  client: ApprovalClient;
  visible: boolean;
  availabilityHelp?: string | null;
  onAfterSeed: () => Promise<void>;
  /** Successful seed only; parent may drive smoke checklist */
  onSeedCounts?: (counts: { created: number; skipped: number }) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"error" | "info">("info");

  const runSeed = useCallback(async () => {
    setBusy(true);
    setLocalMessage(null);
    setMessageTone("info");
    const result = await client.seedSandboxApprovals();
    setBusy(false);
    if (!result.ok) {
      setMessageTone("error");
      setLocalMessage(mapApprovalUiErrorMessage(result.error));
      return;
    }
    const created = result.data.created?.length ?? 0;
    const skipped = result.data.skipped?.length ?? 0;
    const { message } = formatSandboxSeedOutcome(created, skipped);
    setLocalMessage(message);
    onSeedCounts?.({ created, skipped });
    await onAfterSeed();
  }, [client, onAfterSeed, onSeedCounts]);

  if (!visible) {
    return null;
  }

  return (
    <section className="hz-approvals-sandbox-toolbar" aria-label="Demo sandbox onay araclari">
      <p>
        <strong>Demo onay kaydi olustur</strong> — yalnizca local/demo API; production derlemesinde bu arac gosterilmez.
        Liste uydurulmaz; kayitlar API uzerinden repository&apos;e yazilir. Seed tekrarinda tum sablonlar mevcutsa yeni
        kayit olmayabilir; bu idempotent davranistir, hata degildir.
      </p>
      <button type="button" disabled={busy} onClick={() => void runSeed()}>
        {busy ? "Olusturuluyor..." : "Demo onay kaydi olustur"}
      </button>
      {availabilityHelp ? (
        <p className="hz-approvals-sandbox-toolbar-help" role="status">
          {availabilityHelp}
        </p>
      ) : null}
      {localMessage ? (
        <p className={messageTone === "error" ? "hz-approvals-sandbox-toolbar-msg hz-approvals-sandbox-toolbar-msg--error" : "hz-approvals-sandbox-toolbar-msg"} role="status">
          {localMessage}
        </p>
      ) : null}
    </section>
  );
}

