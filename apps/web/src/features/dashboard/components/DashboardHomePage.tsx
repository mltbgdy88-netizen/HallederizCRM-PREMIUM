"use client";

import { useState } from "react";
import { SplitContentLayout } from "@hallederiz/ui";
import { DashboardAiAssistantPanel } from "./DashboardAiAssistantPanel";
import {
  QuickActionIcon,
  type QuickBubbleKind,
  type RowListIcon,
  RowListIconSvg
} from "./dashboard-inline-icons";

/** Tek sıra: kullanıcı burada sadece “sıradaki iş” görür; ayrıntı tıklanınca. */
const FOCUS_QUEUE: Array<{
  id: string;
  title: string;
  subject: string;
  ref: string;
  icon: RowListIcon;
  amount?: string;
  due?: string;
  spotlight?: boolean;
}> = [
  { id: "1", title: "Teslimat onayı", subject: "Nova Gıda A.Ş.", ref: "SLA 14:00", icon: "clipboard", amount: "₺ 84.200", due: "Bugün", spotlight: true },
  { id: "2", title: "Satış onayı", subject: "Delta A.Ş.", ref: "SO-2026-0148", icon: "tag", amount: "₺ 485.750", due: "Bugün" },
  { id: "3", title: "Tahsilat", subject: "Caner Demir", ref: "TA-2026-0097", icon: "wallet", amount: "₺ 48.750", due: "2 gün" },
  { id: "4", title: "Teslimat", subject: "Yıldız İnşaat", ref: "TS-2026-0063", icon: "alert", amount: "₺ 25.600", due: "Kritik", spotlight: true },
  { id: "5", title: "İade", subject: "GHI Mobilya", ref: "IA-2026-0031", icon: "rotate", amount: "₺ 6.450" },
  { id: "6", title: "Belge gönderimi", subject: "Liman Gıda", ref: "Teklif PDF", icon: "fileCheck" }
];

const QUICK_ACTIONS: Array<{ key: string; label: string; bubble: QuickBubbleKind }> = [
  { key: "order", label: "Sipariş", bubble: "order" },
  { key: "price", label: "Fiyat", bubble: "price" },
  { key: "pay", label: "Tahsilat", bubble: "pay" },
  { key: "doc", label: "Belge", bubble: "doc" }
];

function rowIconClass(icon: RowListIcon): string {
  if (icon === "alert") return "hz-dash-focus-ico hz-dash-focus-ico--alert";
  return "hz-dash-focus-ico";
}

export function DashboardHomePage() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="hz-dashboard-page hz-dashboard-page--fit hz-dashboard-page--v2">
      <SplitContentLayout
        main={
          <div className="hz-dash-main-column hz-dash-main-column--v2">
            <div className="hz-dash-scroll-region hz-dash-scroll-region--v2">
              <section className="hz-dash-quick-section hz-dash-quick-section--primary" aria-label="Hızlı işlemler">
                <div className="hz-dash-quick-head hz-dash-quick-head--minimal">
                  <h2 className="hz-dash-quick-title">İşlem</h2>
                </div>
                <div className="hz-dash-quick-grid hz-dash-quick-grid--four hz-dash-quick-grid--calm">
                  {QUICK_ACTIONS.map((q) => (
                    <button key={q.key} type="button" className="hz-dash-quick-card hz-dash-quick-card--calm">
                      <span className={`hz-dash-quick-bubble hz-dash-quick-bubble--${q.bubble} hz-dash-quick-bubble--calm`}>
                        <QuickActionIcon kind={q.bubble} size={24} />
                      </span>
                      <span className="hz-dash-quick-label">{q.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              <p className="hz-dash-context-bar" role="status">
                <span>₺ 485.750 bugün</span>
                <span className="hz-dash-context-dot" aria-hidden>
                  ·
                </span>
                <span>12 açık iş</span>
              </p>

              <section className="hz-dash-focus" aria-label="Bugünün işi">
                <header className="hz-dash-focus-head">
                  <h2 className="hz-dash-focus-title">Sıradaki</h2>
                </header>
                <ul className="hz-dash-focus-list">
                  {FOCUS_QUEUE.map((row) => {
                    const open = openId === row.id;
                    return (
                      <li key={row.id} className={`hz-dash-focus-item${row.spotlight ? " hz-dash-focus-item--spot" : ""}`}>
                        <button
                          type="button"
                          className="hz-dash-focus-row"
                          aria-expanded={open}
                          onClick={() => setOpenId((v) => (v === row.id ? null : row.id))}
                        >
                          <span className={rowIconClass(row.icon)} aria-hidden>
                            <RowListIconSvg kind={row.icon} size={15} />
                          </span>
                          <span className="hz-dash-focus-main">
                            <span className="hz-dash-focus-line">{row.title}</span>
                            <span className="hz-dash-focus-sub">{row.subject}</span>
                          </span>
                          <span className="hz-dash-focus-ref">{row.ref}</span>
                          <span className="hz-dash-focus-chev" aria-hidden>
                            {open ? "▴" : "▾"}
                          </span>
                        </button>
                        {open ? (
                          <div className="hz-dash-focus-detail" role="region">
                            {row.amount ? (
                              <p className="hz-dash-focus-detail-row">
                                <span className="hz-dash-focus-dk">Tutar</span>
                                {row.amount}
                              </p>
                            ) : null}
                            {row.due ? (
                              <p className="hz-dash-focus-detail-row">
                                <span className="hz-dash-focus-dk">Vade / öncelik</span>
                                {row.due}
                              </p>
                            ) : null}
                            <p className="hz-dash-focus-detail-note">Tam kayıt ilgili modülde açılır.</p>
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </section>
            </div>
          </div>
        }
        side={<DashboardAiAssistantPanel compact />}
      />
    </div>
  );
}
