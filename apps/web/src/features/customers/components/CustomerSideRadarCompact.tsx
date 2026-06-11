"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  IconExternalLink,
  IconFileText,
  IconMessageCircle,
  IconSend,
  IconShieldCheck,
  IconSparkles,
  IconTag,
  IconWallet,
  QuickActionIcon
} from "../../dashboard/components/dashboard-inline-icons";

export type CustomerSideIdentityField = { label: string; value: string };
export type CustomerSideFinanceField = { label: string; value: string; tone?: "pos" | "neg" | "normal" };
export type CustomerSideOpsField = { label: string; value: string };
export type CustomerSideAction = {
  id: string;
  label: string;
  icon: ReactNode;
  primary?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

export type CustomerSideRadarView = {
  mode: "empty" | "filled";
  name?: string;
  statusLabel?: string;
  statusTone?: "ok" | "off" | "preview";
  identity?: CustomerSideIdentityField[];
  finance?: CustomerSideFinanceField[];
  riskBadge?: string;
  overdueHint?: string | null;
  ops?: CustomerSideOpsField[];
  riskNote?: string;
  actions?: CustomerSideAction[];
};

export function CustomerSideRadarCompact({ view }: { view: CustomerSideRadarView }) {
  if (view.mode === "empty") {
    return (
      <div className="hz-customers-side-radar" aria-label="Cari radarı">
        <header className="hz-customers-side-radar-head">
          <h2 className="hz-customers-side-radar-title">Cari Radarı</h2>
        </header>
        <div className="hz-customers-side-radar-body hz-customers-side-radar-body--empty">
          <p className="hz-customers-side-radar-empty-title">Listeden bir cari seçin</p>
          <p className="hz-customers-side-radar-empty-lead">Özet, soldaki listeden satır seçildiğinde görünür.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hz-customers-side-radar" aria-label="Cari radarı">
      <header className="hz-customers-side-radar-head">
        <h2 className="hz-customers-side-radar-title">Cari Radarı</h2>
        {view.statusLabel ? (
          <span className={`hz-customers-side-radar-status hz-customers-side-radar-status--${view.statusTone ?? "ok"}`}>
            {view.statusLabel}
          </span>
        ) : null}
      </header>

      <div className="hz-customers-side-radar-body">
        <section className="hz-customers-side-radar-block hz-customers-side-radar-block--hero">
          <p className="hz-customers-side-radar-name" title={view.name}>
            {view.name}
          </p>
        </section>

        {view.identity && view.identity.length > 0 ? (
          <section className="hz-customers-side-radar-block">
            <h3 className="hz-customers-side-radar-label">Kimlik</h3>
            <dl className="hz-customers-side-radar-kv">
              {view.identity.map((field) => (
                <div key={field.label}>
                  <dt>{field.label}</dt>
                  <dd title={field.value}>{field.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {view.finance && view.finance.length > 0 ? (
          <section className="hz-customers-side-radar-block">
            <h3 className="hz-customers-side-radar-label">Finans</h3>
            <div className="hz-customers-side-radar-metrics">
              {view.finance.map((field) => (
                <div key={field.label} className="hz-customers-side-radar-metric">
                  <span className="hz-customers-side-radar-metric-k">{field.label}</span>
                  <strong
                    className={
                      field.tone === "pos"
                        ? "is-pos"
                        : field.tone === "neg"
                          ? "is-neg"
                          : undefined
                    }
                  >
                    {field.value}
                  </strong>
                </div>
              ))}
            </div>
            {view.riskBadge ? (
              <p className="hz-customers-side-radar-risk-badge">
                <IconShieldCheck size={12} aria-hidden />
                {view.riskBadge}
              </p>
            ) : null}
            {view.overdueHint ? <p className="hz-customers-side-radar-warn">{view.overdueHint}</p> : null}
          </section>
        ) : null}

        {view.ops && view.ops.length > 0 ? (
          <section className="hz-customers-side-radar-block">
            <h3 className="hz-customers-side-radar-label">Operasyon</h3>
            <div className="hz-customers-side-radar-ops">
              {view.ops.map((op) => (
                <div key={op.label} className="hz-customers-side-radar-op">
                  <span>{op.label}</span>
                  <strong>{op.value}</strong>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {view.actions && view.actions.length > 0 ? (
          <section className="hz-customers-side-radar-block hz-customers-side-radar-block--actions">
            <h3 className="hz-customers-side-radar-label">Aksiyon</h3>
            <div className="hz-customers-side-radar-actions">
              {view.actions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  className={`hz-customers-side-radar-act${action.primary ? " is-primary" : ""}`}
                  disabled={action.disabled}
                  onClick={action.onClick}
                >
                  {action.icon}
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {view.riskNote ? (
          <footer className="hz-customers-side-radar-foot">
            <IconSparkles size={12} aria-hidden />
            <p>{view.riskNote}</p>
          </footer>
        ) : null}
      </div>
    </div>
  );
}

export function buildDemoSideActions(
  demoDone: Record<string, boolean>,
  fireDemo: (key: string, message: string) => void
): CustomerSideAction[] {
  return [
    {
      id: "open",
      label: "Detay",
      icon: <IconExternalLink size={14} />,
      primary: true,
      disabled: Boolean(demoDone.open),
      onClick: () => fireDemo("open", "Önizleme kaydı: cari detayı açılmaz.")
    },
    {
      id: "offer",
      label: "Teklif",
      icon: <IconTag size={14} />,
      disabled: Boolean(demoDone.offer),
      onClick: () => fireDemo("offer", "Önizleme kaydı: teklif oluşturulmaz.")
    },
    {
      id: "order",
      label: "Sipariş",
      icon: <QuickActionIcon kind="order" size={14} />,
      disabled: Boolean(demoDone.order),
      onClick: () => fireDemo("order", "Önizleme kaydı: sipariş oluşturulmaz.")
    },
    {
      id: "pay",
      label: "Tahsilat",
      icon: <QuickActionIcon kind="pay" size={14} />,
      disabled: Boolean(demoDone.pay),
      onClick: () => fireDemo("pay", "Önizleme kaydı: tahsilat kaydı oluşturulmaz.")
    },
    {
      id: "stmt",
      label: "Ekstre",
      icon: <IconSend size={14} />,
      disabled: Boolean(demoDone.stmt),
      onClick: () => fireDemo("stmt", "Önizleme kaydı: ekstre taslağı oluşturulmaz.")
    },
    {
      id: "wa",
      label: "WhatsApp",
      icon: <IconMessageCircle size={14} />,
      disabled: Boolean(demoDone.wa),
      onClick: () => fireDemo("wa", "Önizleme kaydı: WhatsApp geçmişi açılmaz.")
    }
  ];
}

export function buildLiveSideActions(router: ReturnType<typeof useRouter>, customerId: string): CustomerSideAction[] {
  return [
    {
      id: "open",
      label: "Detay",
      icon: <IconExternalLink size={14} />,
      primary: true,
      onClick: () => router.push(`/cariler/${customerId}`)
    },
    {
      id: "offer",
      label: "Teklif",
      icon: <IconTag size={14} />,
      onClick: () => router.push(`/teklifler/yeni?customer=${customerId}`)
    },
    {
      id: "order",
      label: "Sipariş",
      icon: <QuickActionIcon kind="order" size={14} />,
      onClick: () => router.push(`/siparisler/yeni?customer=${customerId}`)
    },
    {
      id: "pay",
      label: "Tahsilat",
      icon: <QuickActionIcon kind="pay" size={14} />,
      onClick: () => router.push(`/tahsilatlar/yeni?customer=${customerId}`)
    },
    {
      id: "stmt",
      label: "Ekstre",
      icon: <IconSend size={14} />,
      onClick: () => router.push(`/belgeler?customer=${customerId}&type=statement_pdf`)
    },
    {
      id: "wa",
      label: "WhatsApp",
      icon: <IconMessageCircle size={14} />,
      onClick: () => router.push(`/whatsapp?customer=${customerId}`)
    }
  ];
}
