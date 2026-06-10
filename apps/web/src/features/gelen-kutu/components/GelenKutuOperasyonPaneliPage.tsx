"use client";

import { useEffect, useMemo, useState } from "react";
import type { GkopConversation, GkopOrder } from "@/features/gelen-kutu/data/gelen-kutu-operasyon-mock";
import { fetchGelenKutuMessagesForConversation } from "@/features/gelen-kutu/adapters/gelen-kutu-reference-adapter";
import type { GkopChatMessage } from "@/features/gelen-kutu/data/gelen-kutu-operasyon-mock";
import { useGelenKutuReferenceData } from "@/features/gelen-kutu/hooks/use-gelen-kutu-reference-data";
import { IconChevronDown, IconSearch } from "@/components/reference/icons";

function WaBadge() {
  return (
    <span className="gkop-wa-badge" aria-hidden>
      <svg width={10} height={10} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 2C6.477 2 2 6.145 2 11.243c0 1.897.556 3.655 1.51 5.14L2 22l5.86-1.534A9.72 9.72 0 0 0 12 20.486c5.523 0 10-4.145 10-9.243S17.523 2 12 2z" />
      </svg>
    </span>
  );
}

function ChannelTabIcon({ icon }: { icon: "whatsapp" | "mail" | "sms" }) {
  const props = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.75, "aria-hidden": true as const };
  if (icon === "mail") {
    return (
      <svg {...props}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    );
  }
  if (icon === "sms") {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }
  return (
    <svg {...props} fill="currentColor" stroke="none">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 2C6.477 2 2 6.145 2 11.243c0 1.897.556 3.655 1.51 5.14L2 22l5.86-1.534A9.72 9.72 0 0 0 12 20.486c5.523 0 10-4.145 10-9.243S17.523 2 12 2z" />
    </svg>
  );
}

function ConversationRow({ row, onSelect }: { row: GkopConversation; onSelect: () => void }) {
  const avatarClass =
    row.avatarTone === "blue"
      ? "gkop-avatar gkop-avatar--blue"
      : row.avatarTone === "slate"
        ? "gkop-avatar gkop-avatar--slate"
        : "gkop-avatar gkop-avatar--green";

  return (
    <button
      type="button"
      className={row.selected ? "gkop-conv gkop-conv--selected" : "gkop-conv"}
      aria-current={row.selected ? "true" : undefined}
      onClick={onSelect}
    >
      <span className="gkop-conv-avatar-wrap">
        <span className={avatarClass}>{row.initials}</span>
        {row.channel === "whatsapp" ? <WaBadge /> : null}
        {row.channel === "mail" ? (
          <span className="gkop-mail-badge" aria-hidden>
            <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
          </span>
        ) : null}
      </span>
      <span className="gkop-conv-body">
        <span className="gkop-conv-top">
          <strong>{row.name}</strong>
          <span className="gkop-conv-time">{row.time}</span>
        </span>
        <span className="gkop-conv-bottom">
          <span className="gkop-conv-preview">{row.preview}</span>
          {row.unread ? <span className="gkop-conv-unread">{row.unread}</span> : null}
          {row.read ? (
            <span className="gkop-conv-read" aria-label="Okundu">
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" aria-hidden>
                <path d="m4 12 4 4 8-8M11 16l4 4 9-9" />
              </svg>
            </span>
          ) : null}
        </span>
      </span>
    </button>
  );
}

function OrderCard({ order }: { order: GkopOrder }) {
  return (
    <article className="gkop-order-card">
      <div className="gkop-order-top">
        <strong>{order.id}</strong>
        <strong>{order.price}</strong>
      </div>
      <div className="gkop-order-bottom">
        <span>{order.product}</span>
        <span>{order.date}</span>
      </div>
      <span className={order.status === "Kargoda" ? "gkop-order-status gkop-order-status--muted" : "gkop-order-status"}>
        {order.status}
      </span>
    </article>
  );
}

type QuickActionKind = "order" | "offer" | "note";

function QuickActionIcon({ kind }: { kind: QuickActionKind }) {
  const props = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    "aria-hidden": true as const
  };
  if (kind === "offer") {
    return (
      <svg {...props}>
        <path d="M7 4h10v16H7z" />
        <path d="M9 8h6M9 12h4" />
      </svg>
    );
  }
  if (kind === "note") {
    return (
      <svg {...props}>
        <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H7l-4 3V11.5A8.5 8.5 0 0 1 11.5 3h1A8.5 8.5 0 0 1 21 11.5z" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function StarRating({ value }: { value: number }) {
  return (
    <span className="gkop-stars" aria-label={`${value} / 5`}>
      {Array.from({ length: 5 }, (_, i) => {
        const filled = value >= i + 1;
        const half = !filled && value > i && value < i + 1;
        return (
          <svg
            key={i}
            width={14}
            height={14}
            viewBox="0 0 24 24"
            className={filled || half ? "gkop-star gkop-star--on" : "gkop-star"}
            aria-hidden
          >
            <path
              fill={filled || half ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.5"
              d="M12 3l2.35 4.76 5.26.77-3.8 3.71.9 5.24L12 15.77l-4.71 2.47.9-5.24-3.8-3.71 5.26-.77L12 3z"
            />
          </svg>
        );
      })}
    </span>
  );
}

export function GelenKutuOperasyonPaneliPage() {
  const {
    page,
    tabs,
    conversations,
    activeChat,
    messages: referenceMessages,
    customer,
    orders,
    summary,
    quickActions,
    composer,
    demoBanner,
    isDemo
  } = useGelenKutuReferenceData();
  const [selectedId, setSelectedId] = useState(conversations[0]?.id ?? "1");
  const [demoVisible, setDemoVisible] = useState(true);
  const [displayMessages, setDisplayMessages] = useState<GkopChatMessage[]>(referenceMessages);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const listRows = useMemo(
    () => conversations.map((row) => ({ ...row, selected: row.id === selectedId })),
    [conversations, selectedId]
  );

  const selectedRow = listRows.find((row) => row.id === selectedId) ?? listRows[0];
  const chatHead = selectedRow
    ? { ...activeChat, initials: selectedRow.initials, name: selectedRow.name }
    : activeChat;

  useEffect(() => {
    if (conversations.length && !conversations.some((c) => c.id === selectedId)) {
      setSelectedId(conversations[0]!.id);
    }
  }, [conversations, selectedId]);

  useEffect(() => {
    if (isDemo) {
      setDisplayMessages(referenceMessages);
      setMessagesLoading(false);
      return;
    }

    if (!selectedId) {
      setDisplayMessages([]);
      return;
    }

    let active = true;
    setMessagesLoading(true);

    fetchGelenKutuMessagesForConversation(selectedId)
      .then((loaded) => {
        if (active) {
          setDisplayMessages(loaded);
        }
      })
      .catch(() => {
        if (active) {
          setDisplayMessages([]);
        }
      })
      .finally(() => {
        if (active) {
          setMessagesLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [isDemo, selectedId, referenceMessages]);

  return (
    <div className="gkop-home">
      <header className="gkop-page-head">
        <div className="gkop-page-titles">
          <h1>{page.title}</h1>
          <p>{page.subtitle}</p>
        </div>
        <div className="gkop-page-actions">
          <button type="button" className="gkop-select">
            {page.filterLabel}
            <IconChevronDown className="gkop-select-chevron" />
          </button>
          <button type="button" className="gkop-btn gkop-btn--ghost">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
              <path d="M4 4h7l3 7-3 7H4l3-7-3-7zM14 4h6M14 10h6M14 16h6" />
            </svg>
            Filtrele
          </button>
          <button type="button" className="gkop-btn gkop-btn--primary">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
              <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H7l-4 3V11.5A8.5 8.5 0 0 1 11.5 3h1A8.5 8.5 0 0 1 21 11.5z" />
            </svg>
            Yeni Sohbet
          </button>
        </div>
      </header>

      {demoVisible && demoBanner ? (
        <div className="gkop-demo-banner" role="status">
          <span>{demoBanner}</span>
          <button type="button" aria-label="Bildirimi kapat" onClick={() => setDemoVisible(false)}>
            ×
          </button>
        </div>
      ) : null}

      <section className="gkop-workspace" aria-label="Gelen kutusu panelleri">
        <aside className="gkop-list-panel" aria-label="Sohbet listesi">
          <header className="gkop-list-head">
            <h2>{page.listTitle}</h2>
            <div className="gkop-list-head-actions">
              <button type="button" className="gkop-icon-btn" aria-label="Geçmiş">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </button>
              <button type="button" className="gkop-icon-btn" aria-label="Menü">
                <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <circle cx="12" cy="5" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="12" cy="19" r="1.5" />
                </svg>
              </button>
            </div>
          </header>

          <nav className="gkop-tabs" aria-label="Kanal sekmeleri">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                type="button"
                className={index === 0 ? "gkop-tab gkop-tab--active" : "gkop-tab"}
              >
                {tab.icon ? <ChannelTabIcon icon={tab.icon} /> : <span>{tab.label}</span>}
                <span className="gkop-tab-count">{tab.count}</span>
              </button>
            ))}
          </nav>

          <label className="gkop-list-search">
            <IconSearch className="gkop-list-search-icon" />
            <input type="search" readOnly placeholder="Sohbet ara..." aria-label="Sohbet ara" />
            <button type="button" className="gkop-icon-btn gkop-filter-settings" aria-label="Filtre ayarları">
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                <path d="M4 6h16M6 12h12M10 18h4" />
              </svg>
            </button>
          </label>

          <div className="gkop-conv-list">
            {listRows.map((row) => (
              <ConversationRow key={row.id} row={row} onSelect={() => setSelectedId(row.id)} />
            ))}
          </div>

          <footer className="gkop-list-foot">
            <span>{page.listFooter}</span>
            <nav className="gkop-pager" aria-label="Sayfalama">
              <button type="button" className="gkop-pager-btn" aria-label="Önceki">
                ‹
              </button>
              <span>{page.pagination}</span>
              <button type="button" className="gkop-pager-btn" aria-label="Sonraki">
                ›
              </button>
            </nav>
          </footer>
        </aside>

        <article className="gkop-chat-panel" aria-label="Aktif sohbet">
          <header className="gkop-chat-head">
            <span className="gkop-avatar gkop-avatar--green gkop-avatar--lg">{chatHead.initials}</span>
            <div className="gkop-chat-head-text">
              <div className="gkop-chat-name-row">
                <strong>{chatHead.name}</strong>
                <span className="gkop-tag">{chatHead.tag}</span>
              </div>
              <span className="gkop-chat-phone">{chatHead.phone}</span>
            </div>
            <div className="gkop-chat-head-actions">
              <button type="button" className="gkop-icon-btn" aria-label="Favori">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                  <path d="M12 3l2.35 4.76 5.26.77-3.8 3.71.9 5.24L12 15.77l-4.71 2.47.9-5.24-3.8-3.71 5.26-.77L12 3z" />
                </svg>
              </button>
              <button type="button" className="gkop-icon-btn" aria-label="Bilgi">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 10v6M12 8h.01" />
                </svg>
              </button>
              <button type="button" className="gkop-icon-btn" aria-label="Menü">
                <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <circle cx="12" cy="5" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="12" cy="19" r="1.5" />
                </svg>
              </button>
            </div>
          </header>

          <div className="gkop-messages" aria-busy={messagesLoading}>
            <p className="gkop-date-sep">
              <span>{chatHead.dateLabel}</span>
            </p>
            {messagesLoading ? (
              <p className="gkop-messages-loading" role="status">
                Mesajlar yükleniyor…
              </p>
            ) : null}
            {!messagesLoading && displayMessages.length === 0 ? (
              <p className="gkop-messages-empty" role="status">
                Bu sohbette görüntülenecek mesaj yok.
              </p>
            ) : null}
            {displayMessages.map((msg) => (
              <div
                key={msg.id}
                className={msg.direction === "out" ? "gkop-bubble-row gkop-bubble-row--out" : "gkop-bubble-row"}
              >
                <div className={msg.direction === "out" ? "gkop-bubble gkop-bubble--out" : "gkop-bubble"}>
                  <p>{msg.text}</p>
                  <footer>
                    <span>{msg.time}</span>
                    {msg.read ? (
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" aria-hidden>
                        <path d="m4 12 4 4 8-8M11 16l4 4 9-9" />
                      </svg>
                    ) : null}
                  </footer>
                </div>
              </div>
            ))}
          </div>

          <footer className="gkop-composer">
            <div className="gkop-composer-tabs">
              <button type="button" className="gkop-composer-tab gkop-composer-tab--active">
                {composer.replyTab}
              </button>
              <button type="button" className="gkop-composer-tab">
                {composer.noteTab}
              </button>
            </div>
            <div className="gkop-composer-box">
              <textarea readOnly placeholder={composer.placeholder} aria-label={composer.placeholder} />
              <div className="gkop-composer-toolbar">
                <div className="gkop-composer-tools">
                  {["emoji", "attach", "image", "file", "currency", "template", "reply"].map((tool) => (
                    <button key={tool} type="button" className="gkop-icon-btn" aria-label={tool}>
                      <span className="gkop-tool-dot" />
                    </button>
                  ))}
                </div>
                <button type="button" className="gkop-send" aria-label="Gönder">
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                    <path d="m22 2-7 20-4-9-9-4 20-7z" />
                  </svg>
                  <IconChevronDown className="gkop-send-chevron" />
                </button>
              </div>
            </div>
            <p className="gkop-composer-hint">{composer.hint}</p>
          </footer>
        </article>

        <aside className="gkop-ops-panel" aria-label="Müşteri operasyon paneli">
          <header className="gkop-ops-head">
            <h2>Müşteri Bilgileri</h2>
            <button type="button" className="gkop-icon-btn" aria-label="Menü">
              <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>
          </header>

          <div className="gkop-customer-card">
            <span className="gkop-avatar gkop-avatar--green gkop-avatar--xl">{selectedRow?.initials ?? customer.initials}</span>
            <div className="gkop-customer-name">
              <strong>{selectedRow?.name ?? customer.name}</strong>
              <span className="gkop-tag">{customer.tag}</span>
            </div>
            <ul className="gkop-contact-list">
              <li>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {customer.phone}
              </li>
              <li>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
                {customer.email}
              </li>
              <li>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                  <path d="M12 21s7-4.5 7-10a7 7 0 1 0-14 0c0 5.5 7 10 7 10z" />
                  <circle cx="12" cy="11" r="2.5" />
                </svg>
                {customer.location}
              </li>
            </ul>
            <button type="button" className="gkop-btn gkop-btn--outline">
              {customer.viewProfile}
            </button>
          </div>

          <section className="gkop-ops-block">
            <header className="gkop-ops-block-head">
              <h3>Son Siparişler</h3>
              <button type="button" className="gkop-link">
                Tümü ›
              </button>
            </header>
            <div className="gkop-orders">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </section>

          <section className="gkop-ops-block">
            <h3>Müşteri Özeti</h3>
            <dl className="gkop-summary">
              <div>
                <dt>Toplam Sipariş</dt>
                <dd>{summary.totalOrders}</dd>
              </div>
              <div>
                <dt>Toplam Harcama</dt>
                <dd>{summary.totalSpend}</dd>
              </div>
              <div>
                <dt>Ortalama Sipariş</dt>
                <dd>{summary.averageOrder}</dd>
              </div>
              <div>
                <dt>Son Sipariş</dt>
                <dd>{summary.lastOrder}</dd>
              </div>
              <div className="gkop-summary-rating">
                <dt>Müşteri Puanı</dt>
                <dd>
                  <StarRating value={summary.rating} />
                </dd>
              </div>
            </dl>
          </section>

          <section className="gkop-ops-block">
            <h3>Hızlı İşlemler</h3>
            <div className="gkop-quick-actions">
              {quickActions.map((action) => (
                <button key={action.id} type="button" className="gkop-btn gkop-btn--outline gkop-btn--action">
                  <QuickActionIcon kind={action.icon} />
                  {action.label}
                </button>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}

