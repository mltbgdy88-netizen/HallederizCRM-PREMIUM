// @ts-nocheck
"use client";

import type { WhatsAppConversation } from "@hallederiz/types";
import { LoadingState, Pagination } from "@hallederiz/ui";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LucideIcon } from "../../../components/icons/lucide-icons";
import { dataSourceConfig } from "../../../lib/data-source";
import { useToast } from "../../../providers/toast-provider";
import { useWhatsAppInbox } from "../hooks/use-whatsapp-inbox";
import { WA_QUEUE_META } from "../queries/whatsapp-mock-data";
import { getCustomerById } from "../../customers/queries/customer-mock-data";
import { WhatsAppDeskPreview } from "./WhatsAppDeskPreview";

type DeskStatusFilter = "all" | "pending" | "approval" | "active";

function deskStatus(conversation: WhatsAppConversation): { label: string; tone: "approval" | "pending" | "ok" | "sla" } {
  if (conversation.pendingActionCount > 0) {
    return { label: "Onay Bekliyor", tone: "approval" };
  }
  if (conversation.unreadCount > 0) {
    return { label: "Beklemede", tone: "pending" };
  }
  const risk = WA_QUEUE_META[conversation.id]?.risk;
  if (risk === "kritik") {
    return { label: "SLA AÅŸÄ±mÄ±", tone: "sla" };
  }
  return { label: "Aktif", tone: "ok" };
}

function slaLabel(conversation: WhatsAppConversation): { text: string; tone: "ok" | "warn" | "bad" } {
  const risk = WA_QUEUE_META[conversation.id]?.risk;
  if (risk === "kritik") return { text: "AÅŸÄ±ldÄ±", tone: "bad" };
  if (risk === "orta") return { text: "2s 14dk", tone: "warn" };
  return { text: "Normal", tone: "ok" };
}

export function WhatsAppOperationsDesk({ initialCustomerId }: { initialCustomerId?: string | null }) {
  const router = useRouter();
  const { pushToast } = useToast();
  const { conversations, listLoading, listError, selectedId, setSelectedId, reloadList } = useWhatsAppInbox(initialCustomerId);
  const useDemo = dataSourceConfig.useDemoData;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DeskStatusFilter>("all");
  const [channel, setChannel] = useState("all");
  const [agent, setAgent] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return conversations.filter((c) => {
      const st = deskStatus(c);
      if (statusFilter === "approval" && st.tone !== "approval") return false;
      if (statusFilter === "pending" && st.tone !== "pending") return false;
      if (statusFilter === "active" && st.tone !== "ok") return false;
      if (channel !== "all" && channel !== "whatsapp") return false;
      if (agent !== "all" && agent !== "emre") return false;
      if (!q) return true;
      const customer = c.relatedCustomerId ? getCustomerById(c.relatedCustomerId) : null;
      const blob = `${c.title} ${c.lastMessagePreview} ${customer?.name ?? ""} ${c.id}`.toLowerCase();
      return blob.includes(q);
    });
  }, [conversations, search, statusFilter, channel, agent]);

  const paged = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, channel, agent]);

  useEffect(() => {
    if (!filtered.length) {
      return;
    }
    if (!selectedId || !filtered.some((c) => c.id === selectedId)) {
      setSelectedId(filtered[0]!.id);
    }
  }, [filtered, selectedId, setSelectedId]);

  const selected = useMemo(
    () => filtered.find((c) => c.id === selectedId) ?? conversations.find((c) => c.id === selectedId) ?? null,
    [filtered, selectedId, conversations]
  );

  const unreadTotal = conversations.reduce((a, c) => a + c.unreadCount, 0);
  const approvalTotal = conversations.reduce((a, c) => a + c.pendingActionCount, 0);
  const slaBreaches = conversations.filter((c) => WA_QUEUE_META[c.id]?.risk === "kritik").length;

  return (
    <main className="hz-wa-page hz-wa-page--desk">
      <header className="hz-wa-desk-head">
        <div className="hz-wa-desk-head__text">
          <h1>WhatsApp Operasyon Paneli</h1>
          <p>Kanal mesajlarÄ±, onay bekleyenler ve SLA takibini tek ekranda yÃ¶netin.</p>
        </div>
        <div className="hz-wa-desk-head__actions">
          <button type="button" className="hz-wa-desk-btn hz-wa-desk-btn--primary" onClick={() => pushToast("Yeni konuÅŸma henÃ¼z canlÄ±ya baÄŸlÄ± deÄŸil.")}>
            <LucideIcon name="plus-square" size={14} />
            Yeni KonuÅŸma
          </button>
          <button type="button" className="hz-wa-desk-btn" onClick={() => pushToast("Åablon gÃ¶nderimi onay zincirinden geÃ§er.")}>
            <LucideIcon name="send" size={14} />
            Åablon GÃ¶nder
          </button>
          <button type="button" className="hz-wa-desk-btn" onClick={() => pushToast("DÄ±ÅŸa aktarÄ±m taslaÄŸÄ± hazÄ±rlandÄ±.")}>
            <LucideIcon name="file-text" size={14} />
            DÄ±ÅŸa Aktar
          </button>
        </div>
      </header>

      <section className="hz-wa-desk-stats" aria-label="WhatsApp Ã¶zetleri">
        <article>
          <span className="hz-wa-desk-stat-ico" aria-hidden>
            <LucideIcon name="message-circle" size={16} />
          </span>
          <div>
            <span>Bekleyen Mesaj</span>
            <strong>{unreadTotal || (useDemo ? 24 : 0)}</strong>
            <small>â†‘ {useDemo ? "12%" : "â€”"} dÃ¼nden</small>
          </div>
        </article>
        <article>
          <span className="hz-wa-desk-stat-ico" aria-hidden>
            <LucideIcon name="send" size={16} />
          </span>
          <div>
            <span>BugÃ¼n Giden</span>
            <strong>{useDemo ? 128 : 0}</strong>
            <small>â†‘ {useDemo ? "8%" : "â€”"} dÃ¼nden</small>
          </div>
        </article>
        <article>
          <span className="hz-wa-desk-stat-ico" aria-hidden>
            <LucideIcon name="message-circle" size={16} />
          </span>
          <div>
            <span>OkunmamÄ±ÅŸ</span>
            <strong>{unreadTotal || (useDemo ? 4 : 0)}</strong>
            <small>{useDemo ? "4 sohbet" : "â€”"}</small>
          </div>
        </article>
        <article>
          <span className="hz-wa-desk-stat-ico hz-wa-desk-stat-ico--gold" aria-hidden>
            <LucideIcon name="clock" size={16} />
          </span>
          <div>
            <span>Onay Bekleyen</span>
            <strong>{approvalTotal || (useDemo ? 7 : 0)}</strong>
            <small>{useDemo ? "2 kritik" : "â€”"}</small>
          </div>
        </article>
        <article>
          <span className="hz-wa-desk-stat-ico hz-wa-desk-stat-ico--warn" aria-hidden>
            <LucideIcon name="alert-triangle" size={16} />
          </span>
          <div>
            <span>SLA AÅŸÄ±mÄ±</span>
            <strong>{slaBreaches || (useDemo ? 2 : 0)}</strong>
            <small>{useDemo ? "Acil mÃ¼dahale" : "â€”"}</small>
          </div>
        </article>
        <article>
          <span className="hz-wa-desk-stat-ico" aria-hidden>
            <LucideIcon name="shopping-cart" size={16} />
          </span>
          <div>
            <span>DÃ¶nÃ¼ÅŸÃ¼m OranÄ±</span>
            <strong>{useDemo ? "%38" : "â€”"}</strong>
            <small>â†‘ {useDemo ? "3 puan" : "â€”"}</small>
          </div>
        </article>
      </section>

      {useDemo ? (
        <p className="hz-wa-desk-preview-band" role="status">
          Ã–nizleme modu: konuÅŸma listesi demo amaÃ§lÄ±dÄ±r; canlÄ± gÃ¶nderim onay zincirinden geÃ§er.
        </p>
      ) : listError ? (
        <p className="hz-wa-desk-preview-band hz-wa-desk-preview-band--error" role="alert">
          {listError}
          <button type="button" onClick={() => reloadList()}>
            Tekrar dene
          </button>
        </p>
      ) : null}

      <div className="hz-wa-desk-grid">
        <section className="hz-wa-desk-main">
          <div className="hz-wa-desk-filter-bar" role="search">
            <label className="hz-wa-desk-filter-field hz-wa-desk-filter-field--search">
              <span>Arama</span>
              <span className="hz-wa-desk-filter-search">
                <LucideIcon name="search" size={14} />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="KonuÅŸma, cari veya mesaj ara" aria-label="Arama" />
              </span>
            </label>
            <label className="hz-wa-desk-filter-field">
              <span>Durum</span>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as DeskStatusFilter)} aria-label="Durum">
                <option value="all">TÃ¼mÃ¼</option>
                <option value="pending">Beklemede</option>
                <option value="approval">Onay Bekliyor</option>
                <option value="active">Aktif</option>
              </select>
            </label>
            <label className="hz-wa-desk-filter-field">
              <span>Kanal</span>
              <select value={channel} onChange={(e) => setChannel(e.target.value)} aria-label="Kanal">
                <option value="all">TÃ¼mÃ¼</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </label>
            <label className="hz-wa-desk-filter-field">
              <span>Temsilci</span>
              <select value={agent} onChange={(e) => setAgent(e.target.value)} aria-label="Temsilci">
                <option value="all">TÃ¼mÃ¼</option>
                <option value="emre">Emre AydÄ±n</option>
              </select>
            </label>
            <label className="hz-wa-desk-filter-field">
              <span>Tarih</span>
              <select aria-label="Tarih" defaultValue="today">
                <option value="today">BugÃ¼n</option>
                <option value="week">Bu hafta</option>
                <option value="month">Bu ay</option>
              </select>
            </label>
            <button
              type="button"
              className="hz-wa-desk-filter-reset"
              title="Filtreleri sÄ±fÄ±rla"
              aria-label="Filtreleri sÄ±fÄ±rla"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setChannel("all");
                setAgent("all");
                pushToast("Filtreler sÄ±fÄ±rlandÄ±.");
              }}
            >
              <LucideIcon name="x" size={13} />
            </button>
          </div>

          {listLoading ? (
            <LoadingState title="KonuÅŸmalar yÃ¼kleniyor" message="WhatsApp kuyruÄŸu hazÄ±rlanÄ±yor." />
          ) : (
            <>
              <section className="hz-wa-desk-table-card">
                <div className="hz-wa-desk-table-wrap">
                  <table className="hz-wa-desk-table">
                    <thead>
                      <tr>
                        <th>KonuÅŸma</th>
                        <th>Cari</th>
                        <th>Son Mesaj</th>
                        <th>Durum</th>
                        <th>SLA</th>
                        <th>Aksiyon</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paged.map((row) => {
                        const meta = WA_QUEUE_META[row.id];
                        const customer = row.relatedCustomerId ? getCustomerById(row.relatedCustomerId) : null;
                        const status = deskStatus(row);
                        const sla = slaLabel(row);
                        return (
                          <tr
                            key={row.id}
                            className={`hz-wa-desk-row${selectedId === row.id ? " is-selected" : ""}`}
                            onClick={() => setSelectedId(row.id)}
                          >
                            <td>
                              <div className="hz-wa-desk-conv">
                                <span className="hz-wa-desk-conv-ico" aria-hidden>
                                  <LucideIcon name="message-circle" size={14} />
                                </span>
                                <div>
                                  <span className="hz-wa-desk-conv-title">{row.title}</span>
                                  <span className="hz-wa-desk-conv-id">{row.id.replace("wa_op_", "WA-").toUpperCase()}</span>
                                </div>
                              </div>
                            </td>
                            <td>{customer?.name ?? "â€”"}</td>
                            <td>
                              <span className="hz-wa-desk-msg">{row.lastMessagePreview || meta?.subtitle}</span>
                              <span className="hz-wa-desk-msg-time">{meta?.timeLabel ?? "â€”"}</span>
                            </td>
                            <td>
                              <span className={`hz-wa-desk-badge hz-wa-desk-badge--${status.tone}`}>{status.label}</span>
                            </td>
                            <td>
                              <span className={`hz-wa-desk-sla hz-wa-desk-sla--${sla.tone}`}>
                                <span className="hz-wa-desk-sla-dot" aria-hidden />
                                {sla.text}
                              </span>
                            </td>
                            <td className="hz-wa-desk-row-actions" onClick={(e) => e.stopPropagation()}>
                              <button type="button" className="hz-wa-desk-row-action" title="Detay" onClick={() => setSelectedId(row.id)}>
                                <LucideIcon name="eye" size={13} />
                              </button>
                              <button type="button" className="hz-wa-desk-row-action" title="Mesaj akÄ±ÅŸÄ±" onClick={() => router.push(`/gelen-kutu?channel=whatsapp&conversation=${row.id}`)}>
                                <LucideIcon name="message-circle" size={13} />
                              </button>
                              <button type="button" className="hz-wa-desk-row-action" title="Onaylar" onClick={() => router.push("/onaylar")}>
                                <LucideIcon name="check-circle-2" size={13} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {paged.length === 0 ? (
                        <tr>
                          <td colSpan={6}>
                            <div className="table-empty">Filtrelere uygun konuÅŸma bulunamadÄ±.</div>
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </section>
              <div className="hz-wa-desk-pagination">
                <Pagination totalItems={filtered.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} />
              </div>
            </>
          )}
        </section>

        <WhatsAppDeskPreview
          conversation={selected}
          onOpenApprovals={() => router.push("/onaylar")}
          onSelectTemplate={() => pushToast("Åablon seÃ§imi onay sonrasÄ± uygulanÄ±r.")}
          onSelectFile={() => pushToast("Belge gÃ¶nderimi onay zincirinden geÃ§er.")}
        />
      </div>
    </main>
  );
}

