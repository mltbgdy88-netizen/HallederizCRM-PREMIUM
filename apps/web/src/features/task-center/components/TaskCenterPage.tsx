"use client";

import { FilterBar, PageHeader, TabSwitcher } from "@hallederiz/ui";
import { useMemo, useState } from "react";
import { CRMIcon, type CRMIconName } from "../../../components/icons";

type TaskView = "Sistem" | "Yapay Zeka" | "Tumu";

interface TaskCardItem {
  key: string;
  title: string;
  value: number;
  detail: string;
  tone: "info" | "warning" | "danger" | "success";
  pulse?: boolean;
  channel: "system" | "ai";
  icon: CRMIconName;
  tasks: Array<{
    title: string;
    customer: string;
    reference: string;
    dueDate: string;
    priority: "Kritik" | "Yuksek" | "Normal";
  }>;
}

const TASK_CARDS: TaskCardItem[] = [
  {
    key: "new-orders",
    title: "Yeni Siparisler",
    value: 14,
    detail: "Acil kaynak plani gerekiyor",
    tone: "info",
    channel: "system",
    icon: "orders",
    tasks: [
      {
        title: "Siparis kaynak plani tamamlanmadi",
        customer: "Aydin Dekor",
        reference: "SO-2481",
        dueDate: "Bugun 16:30",
        priority: "Yuksek"
      }
    ]
  },
  {
    key: "pending-payments",
    title: "Odeme Bekleyenler",
    value: 21,
    detail: "Tahsilat takibi gerekli",
    tone: "warning",
    channel: "system",
    icon: "payments",
    tasks: [
      {
        title: "Vadesi gecen tahsilat",
        customer: "Mira Yapi",
        reference: "PAY-930",
        dueDate: "Bugun 15:00",
        priority: "Kritik"
      }
    ]
  },
  {
    key: "warehouse-ready",
    title: "Depoda Hazirlanacaklar",
    value: 9,
    detail: "Toplama listeleri bekliyor",
    tone: "info",
    channel: "system",
    icon: "warehouse",
    tasks: [
      {
        title: "Depo toplama emri olustur",
        customer: "Nehir Dizayn",
        reference: "WO-114",
        dueDate: "Yarin 10:00",
        priority: "Normal"
      }
    ]
  },
  {
    key: "factory-inbound",
    title: "Fabrikadan Gelecekler",
    value: 6,
    detail: "Senkron gecikmesi var",
    tone: "warning",
    channel: "system",
    icon: "factories",
    tasks: [
      {
        title: "Fabrika sevk teyidi bekleniyor",
        customer: "Atlas Home",
        reference: "FO-221",
        dueDate: "Yarin 12:00",
        priority: "Yuksek"
      }
    ]
  },
  {
    key: "critical-stock",
    title: "Kritik Stoklar",
    value: 7,
    detail: "Stok seviyesi esigin altinda",
    tone: "danger",
    pulse: true,
    channel: "system",
    icon: "stock",
    tasks: [
      {
        title: "Kritik urun icin tedarik istegi",
        customer: "-",
        reference: "PRD-DK-2022",
        dueDate: "Bugun 18:00",
        priority: "Kritik"
      }
    ]
  },
  {
    key: "high-risk-customers",
    title: "Yuksek Risk Cariler",
    value: 5,
    detail: "Limit asimi riski",
    tone: "danger",
    channel: "system",
    icon: "customers",
    tasks: [
      {
        title: "Riskli cari icin yonetici onayi",
        customer: "Mavi Konsept",
        reference: "CUS-88",
        dueDate: "Bugun 14:00",
        priority: "Kritik"
      }
    ]
  },
  {
    key: "late-payers",
    title: "Uzun Suredir Odeme Yapmayanlar",
    value: 4,
    detail: "Iletisim ve takip onerilir",
    tone: "warning",
    channel: "system",
    icon: "payments",
    tasks: [
      {
        title: "Tahsilat follow-up mesaji",
        customer: "Sahin Yapi",
        reference: "CUS-114",
        dueDate: "Yarin 09:30",
        priority: "Yuksek"
      }
    ]
  },
  {
    key: "ai-risks",
    title: "AI Risk Kartlari",
    value: 3,
    detail: "Onay bekleyen oneriler",
    tone: "danger",
    channel: "ai",
    icon: "ai",
    tasks: [
      {
        title: "AI odeme riski sinyali",
        customer: "Lima Duvar",
        reference: "AI-401",
        dueDate: "Bugun 17:00",
        priority: "Yuksek"
      }
    ]
  },
  {
    key: "ai-opportunities",
    title: "AI Firsat Kartlari",
    value: 8,
    detail: "Gelir artisi firsatlari",
    tone: "success",
    channel: "ai",
    icon: "reports",
    tasks: [
      {
        title: "Capraz satis onerisi",
        customer: "Pera Mimarlik",
        reference: "AI-524",
        dueDate: "Yarin 11:15",
        priority: "Normal"
      }
    ]
  }
];

function toneBadgeClass(tone: TaskCardItem["tone"]) {
  switch (tone) {
    case "danger":
      return "hz-badge hz-badge-danger";
    case "warning":
      return "hz-badge hz-badge-warning";
    case "success":
      return "hz-badge hz-badge-success";
    default:
      return "hz-badge hz-badge-info";
  }
}

export function TaskCenterPage() {
  const [view, setView] = useState<TaskView>("Sistem");
  const [selectedCardKey, setSelectedCardKey] = useState<string | null>(null);

  const visibleCards = useMemo(() => {
    if (view === "Tumu") {
      return TASK_CARDS;
    }

    if (view === "Yapay Zeka") {
      return TASK_CARDS.filter((item) => item.channel === "ai");
    }

    return TASK_CARDS.filter((item) => item.channel === "system");
  }, [view]);

  const selectedCard = useMemo(
    () => TASK_CARDS.find((item) => item.key === selectedCardKey) ?? null,
    [selectedCardKey]
  );

  return (
    <div className="hz-page-stack">
      <PageHeader
        title="Gorev Merkezi"
        description="Sistem ve AI kaynakli operasyon kartlarini tek panelden izleyin, gorevleri kayda baglayin."
      />

      <TabSwitcher
        items={["Sistem", "Yapay Zeka", "Tumu"].map((item) => ({ key: item, label: item }))}
        activeKey={view}
        onChange={(nextView) => setView(nextView as TaskView)}
      />

      <FilterBar>
        <div className="task-center-filter-grid">
          <label>
            Rol
            <select defaultValue="">
              <option value="">Tum roller</option>
              <option value="sales">Satis</option>
              <option value="finance">Muhasebe</option>
              <option value="warehouse">Depo</option>
              <option value="manager">Yonetici</option>
            </select>
          </label>

          <label>
            Oncelik
            <select defaultValue="">
              <option value="">Tum oncelikler</option>
              <option value="critical">Kritik</option>
              <option value="high">Yuksek</option>
              <option value="normal">Normal</option>
            </select>
          </label>

          <label>
            Gorev Tipi
            <select defaultValue="">
              <option value="">Tum tipler</option>
              <option value="order">Siparis</option>
              <option value="stock">Stok</option>
              <option value="payment">Tahsilat</option>
            </select>
          </label>

          <label>
            Depo
            <select defaultValue="">
              <option value="">Tum depolar</option>
              <option value="merkez">Merkez</option>
              <option value="avrupa">Avrupa</option>
              <option value="anadolu">Anadolu</option>
            </select>
          </label>

          <label>
            Fabrika
            <select defaultValue="">
              <option value="">Tum fabrikalar</option>
              <option value="ankara">Ankara</option>
              <option value="izmir">Izmir</option>
            </select>
          </label>

          <label className="hz-toggle">
            <input type="checkbox" />
            Sadece kritikler
          </label>
        </div>
      </FilterBar>

      <section className="hz-task-card-grid">
        {visibleCards.map((card) => (
          <button
            key={card.key}
            type="button"
            className={`hz-task-card ${card.pulse ? "is-pulse" : ""}`}
            onClick={() => setSelectedCardKey(card.key)}
          >
            <div className="hz-task-card-header">
              <span className={toneBadgeClass(card.tone)}>{card.title}</span>
              <CRMIcon name={card.icon} />
            </div>
            <p className="hz-task-card-value">{card.value}</p>
            <p className="hz-task-card-sub">{card.detail}</p>
          </button>
        ))}
      </section>

      {selectedCard ? (
        <div className="hz-modal-overlay" onClick={() => setSelectedCardKey(null)} role="presentation">
          <section className="hz-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
            <header className="hz-modal-header">
              <div>
                <p className="drawer-eyebrow">Gorev Listesi</p>
                <h3>{selectedCard.title}</h3>
                <p className="muted">Bu karta bagli operasyon kayitlari listelenir.</p>
              </div>

              <div className="hz-modal-actions">
                <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn" onClick={() => setSelectedCardKey(null)}>
                  Kapat
                </button>
              </div>
            </header>

            <div className="hz-modal-content hz-tab-content">
              <div className="table-wrap hz-table-wrap">
                <table className="table hz-table">
                  <thead>
                    <tr>
                      <th>Gorev Basligi</th>
                      <th>Cari</th>
                      <th>Siparis / Urun</th>
                      <th>Son Tarih</th>
                      <th>Oncelik</th>
                      <th>Kayit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCard.tasks.map((task) => (
                      <tr key={`${task.reference}-${task.title}`}>
                        <td>{task.title}</td>
                        <td>{task.customer}</td>
                        <td>{task.reference}</td>
                        <td>{task.dueDate}</td>
                        <td>
                          <span
                            className={`hz-badge ${
                              task.priority === "Kritik"
                                ? "hz-badge-danger"
                                : task.priority === "Yuksek"
                                  ? "hz-badge-warning"
                                  : "hz-badge-info"
                            }`}
                          >
                            {task.priority}
                          </span>
                        </td>
                        <td>
                          <button type="button" className="hz-btn hz-btn-secondary">
                            Kayda Git
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
