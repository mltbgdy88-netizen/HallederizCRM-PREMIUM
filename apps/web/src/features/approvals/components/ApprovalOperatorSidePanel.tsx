"use client";

import { useCallback, useState } from "react";
import type { ApprovalClient } from "../api/approval-client";
import type { ApprovalInboxItem, ApprovalSandboxAvailabilityResponse, WorkerHealthResponse } from "../types";
import type { ApprovalAdvancedFilterState } from "../utils/approval-card-helpers";
import { DEFAULT_APPROVAL_ADVANCED_FILTERS } from "../utils/approval-card-helpers";
import { mapApprovalUiErrorMessage } from "../utils/inbox-helpers";
import type { OperatorSmokeSummary } from "../utils/operator-smoke";
import { formatSandboxSeedOutcome, readSafetyBoolean } from "../utils/operator-smoke";

function boolLabel(v: boolean | undefined, yes: string, no: string, unknown: string): string {
  if (v === true) return yes;
  if (v === false) return no;
  return unknown;
}

export function ApprovalOperatorSidePanel({
  production,
  workerHealth,
  workerSafety,
  sandboxAvailability,
  operatorSmokeSummary,
  stats,
  completedToday,
  advancedFilters,
  onAdvancedFiltersChange,
  client,
  sandboxToolbarVisible,
  availabilityHelp,
  onSystemRefresh,
  onWorkerHealthRefresh,
  onSandboxAvailabilityRefresh,
  onAfterSeed,
  onSeedComplete
}: {
  production: boolean;
  workerHealth: WorkerHealthResponse | null;
  workerSafety: WorkerHealthResponse | null;
  sandboxAvailability: ApprovalSandboxAvailabilityResponse | null;
  operatorSmokeSummary: OperatorSmokeSummary;
  stats: { total: number; pending: number; approved: number; rejected: number };
  completedToday: number;
  advancedFilters: ApprovalAdvancedFilterState;
  onAdvancedFiltersChange: (next: ApprovalAdvancedFilterState) => void;
  client: ApprovalClient;
  sandboxToolbarVisible: boolean;
  availabilityHelp?: string | null;
  onSystemRefresh: () => Promise<void>;
  onWorkerHealthRefresh: () => Promise<void>;
  onSandboxAvailabilityRefresh: () => Promise<void>;
  onAfterSeed: () => Promise<void>;
  onSeedComplete?: (created: number, skipped: number) => void;
}) {
  const [seedBusy, setSeedBusy] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);

  const providerWrites = readSafetyBoolean(workerSafety, "providerWritesEnabled") ?? readSafetyBoolean(workerHealth, "providerWritesEnabled");
  const realExec = readSafetyBoolean(workerSafety, "realExecutionEnabled") ?? readSafetyBoolean(workerHealth, "realExecutionEnabled");

  const runSeed = useCallback(async () => {
    setSeedBusy(true);
    setSeedMsg(null);
    const result = await client.seedSandboxApprovals();
    setSeedBusy(false);
    if (!result.ok) {
      setSeedMsg(mapApprovalUiErrorMessage(result.error));
      return;
    }
    const created = result.data.created?.length ?? 0;
    const skipped = result.data.skipped?.length ?? 0;
    setSeedMsg(formatSandboxSeedOutcome(created, skipped).message);
    onSeedComplete?.(created, skipped);
    await onAfterSeed();
  }, [client, onAfterSeed, onSeedComplete]);

  const clearFilters = () => onAdvancedFiltersChange({ ...DEFAULT_APPROVAL_ADVANCED_FILTERS });

  return (
    <aside className="hz-approvals-inbox-side-panel" aria-label="Operatör paneli">
      <section className="hz-approvals-inbox-side-block">
        <h3 className="hz-approvals-inbox-side-title">Operatör doğrulama</h3>
        <ul className="hz-approvals-inbox-side-list hz-approvals-inbox-muted">
          <li>
            <strong>Worker:</strong> {workerHealth?.ok ? "Yanıt alındı" : "Yanıt yok / hata"}
          </li>
          <li>
            <strong>Sandbox mod:</strong>{" "}
            {production ? "Production derlemesi" : sandboxAvailability?.sandboxSeedAvailable ? "Kullanılabilir" : "Kapalı veya bilinmiyor"}
          </li>
          <li>
            <strong>Provider writes:</strong> {boolLabel(providerWrites, "Açık sinyal", "Kapalı / kontrollü", "Bilinmiyor")}
          </li>
          <li>
            <strong>Gerçek execution:</strong> {boolLabel(realExec, "Açık sinyal", "Kapalı / foundation", "Bilinmiyor")}
          </li>
          <li>
            <strong>Son senkron:</strong> Worker ve güvenlik uçları manuel veya otomatik yenileme ile güncellenir.
          </li>
        </ul>
        {!production ? (
          <p className="hz-approvals-inbox-muted hz-approvals-inbox-side-smoke">
            Smoke özeti: <strong>{operatorSmokeSummary.overall}</strong> · OK {operatorSmokeSummary.okCount} · Uyarı {operatorSmokeSummary.warningCount} · Hata{" "}
            {operatorSmokeSummary.failCount}
          </p>
        ) : (
          <p className="hz-approvals-inbox-muted">Production ortamında sandbox smoke listesi gösterilmez.</p>
        )}
        {availabilityHelp ? (
          <p className="hz-approvals-inbox-muted" role="status">
            {availabilityHelp}
          </p>
        ) : null}
      </section>

      <section className="hz-approvals-inbox-side-block">
        <h3 className="hz-approvals-inbox-side-title">Filtreler</h3>
        <div className="hz-approvals-inbox-side-fields">
          <label className="hz-approvals-inbox-side-field">
            <span>Onay türü</span>
            <select
              className="hz-approvals-inbox-input"
              value={advancedFilters.actionCategory}
              onChange={(e) =>
                onAdvancedFiltersChange({
                  ...advancedFilters,
                  actionCategory: e.target.value as ApprovalAdvancedFilterState["actionCategory"]
                })
              }
            >
              <option value="all">Tümü</option>
              <option value="order">Sipariş</option>
              <option value="payment">Tahsilat</option>
              <option value="settings">Ayarlar</option>
              <option value="users">Kullanıcı</option>
              <option value="delivery">Teslimat</option>
              <option value="invoice">Fatura</option>
              <option value="return">İade</option>
              <option value="document">Belge / kanal</option>
              <option value="ai">AI</option>
              <option value="other">Diğer</option>
            </select>
          </label>
          <label className="hz-approvals-inbox-side-field">
            <span>Risk</span>
            <select
              className="hz-approvals-inbox-input"
              value={advancedFilters.risk}
              onChange={(e) => onAdvancedFiltersChange({ ...advancedFilters, risk: e.target.value as ApprovalAdvancedFilterState["risk"] })}
            >
              <option value="all">Tümü</option>
              <option value="high">Yüksek</option>
              <option value="medium">Orta</option>
              <option value="low">Düşük</option>
              <option value="neutral">Nötr</option>
            </select>
          </label>
          <label className="hz-approvals-inbox-side-field">
            <span>Kaynak</span>
            <select
              className="hz-approvals-inbox-input"
              value={advancedFilters.source}
              onChange={(e) => onAdvancedFiltersChange({ ...advancedFilters, source: e.target.value as ApprovalAdvancedFilterState["source"] })}
            >
              <option value="all">Tümü</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="web">Web</option>
              <option value="ai">AI</option>
              <option value="platform">Platform</option>
            </select>
          </label>
          <label className="hz-approvals-inbox-side-field">
            <span>Oluşma zamanı</span>
            <select
              className="hz-approvals-inbox-input"
              value={advancedFilters.timePreset}
              onChange={(e) => onAdvancedFiltersChange({ ...advancedFilters, timePreset: e.target.value as ApprovalAdvancedFilterState["timePreset"] })}
            >
              <option value="all">Tümü</option>
              <option value="24h">Son 24 saat</option>
              <option value="7d">Son 7 gün</option>
            </select>
          </label>
        </div>
        <div className="hz-approvals-inbox-side-actions">
          <button type="button" className="hz-approvals-inbox-btn hz-approvals-inbox-btn--primary" onClick={() => clearFilters()}>
            Temizle
          </button>
        </div>
      </section>

      <section className="hz-approvals-inbox-side-block">
        <h3 className="hz-approvals-inbox-side-title">Özet</h3>
        <dl className="hz-approvals-inbox-side-dl">
          <div>
            <dt>Bekleyen</dt>
            <dd>{stats.pending}</dd>
          </div>
          <div>
            <dt>Onaylanan</dt>
            <dd>{stats.approved}</dd>
          </div>
          <div>
            <dt>Reddedilen</dt>
            <dd>{stats.rejected}</dd>
          </div>
          <div>
            <dt>Bugün tamamlanan</dt>
            <dd>{completedToday}</dd>
          </div>
        </dl>
      </section>

      <section className="hz-approvals-inbox-side-block">
        <h3 className="hz-approvals-inbox-side-title">Hızlı işlemler</h3>
        <div className="hz-approvals-inbox-side-actions hz-approvals-inbox-side-actions--stack">
          <button type="button" className="hz-approvals-inbox-btn hz-approvals-inbox-btn--primary" onClick={() => void onSystemRefresh()}>
            Sistemi yenile
          </button>
          <button type="button" className="hz-approvals-inbox-btn" onClick={() => void onWorkerHealthRefresh()}>
            Worker / güvenlik yenile
          </button>
          <button type="button" className="hz-approvals-inbox-btn" onClick={() => void onSandboxAvailabilityRefresh()}>
            Sandbox durumu yenile
          </button>
          {sandboxToolbarVisible && !production ? (
            <button type="button" className="hz-approvals-inbox-btn hz-approvals-inbox-btn--primary" disabled={seedBusy} onClick={() => void runSeed()}>
              {seedBusy ? "Oluşturuluyor..." : "Sandbox seed"}
            </button>
          ) : null}
        </div>
        {seedMsg ? (
          <p className="hz-approvals-inbox-muted" role="status">
            {seedMsg}
          </p>
        ) : null}
      </section>
    </aside>
  );
}
