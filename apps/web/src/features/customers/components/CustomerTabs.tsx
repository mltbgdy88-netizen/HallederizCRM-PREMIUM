"use client";

import { calculateCustomerRiskState, resolveCustomerDisplayType } from "@hallederiz/domain";
import { TabSwitcher } from "@hallederiz/ui";
import type { Customer, CustomerAccount, CustomerAddress, CustomerContact, CustomerLedgerEntry, Offer } from "@hallederiz/types";
import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { customerRiskLabelFromProfile } from "../utils/customer-detail-helpers";

const TABS = [
  "Genel",
  "Hesap özeti",
  "Hareketler",
  "Teklifler",
  "Siparişler",
  "Tahsilatlar",
  "Teslimatlar",
  "Belgeler",
  "Yetkili kişiler",
  "Adresler"
] as const;

function money(amount: number, currency: string): string {
  return `${amount.toLocaleString("tr-TR")} ${currency}`;
}

function TabEmptyState({ title, message, actionsHint }: { title: string; message: string; actionsHint?: ReactNode }) {
  return (
    <div className="hz-customers-detail-tab-empty hz-tab-content" role="status">
      <h4>{title}</h4>
      <p>{message}</p>
      {actionsHint ? <div className="hz-customers-detail-tab-empty-actions">{actionsHint}</div> : null}
    </div>
  );
}

export function CustomerTabs({
  customer,
  account,
  contacts,
  addresses,
  ledgerEntries,
  offers
}: {
  customer: Customer;
  account: CustomerAccount | null;
  contacts: CustomerContact[];
  addresses: CustomerAddress[];
  ledgerEntries: CustomerLedgerEntry[];
  offers: Offer[];
}) {
  const [activeTab, setActiveTab] = useState("Genel");
  const risk = useMemo(() => {
    if (account) {
      return calculateCustomerRiskState(customer, account);
    }
    return customerRiskLabelFromProfile(customer);
  }, [account, customer]);

  return (
    <section className="hz-content-card">
      <TabSwitcher items={TABS.map((tab) => ({ key: tab, label: tab }))} activeKey={activeTab} onChange={setActiveTab} />

      {activeTab === "Genel" ? (
        <div className="hz-modal-panel-grid hz-tab-content">
          <article className="hz-kv-item"><span>Cari kodu</span><strong>{customer.code}</strong></article>
          <article className="hz-kv-item"><span>Cari adı</span><strong>{customer.name}</strong></article>
          <article className="hz-kv-item"><span>Müşteri tipi</span><strong>{resolveCustomerDisplayType(customer.type)}</strong></article>
          <article className="hz-kv-item"><span>Vergi bilgileri</span><strong>{customer.taxOffice ?? "—"} / {customer.taxNumber ?? "—"}</strong></article>
          <article className="hz-kv-item"><span>Telefon</span><strong>{customer.phone}</strong></article>
          <article className="hz-kv-item"><span>E-posta</span><strong>{customer.email ?? "—"}</strong></article>
          <article className="hz-kv-item"><span>Şehir</span><strong>{customer.city}</strong></article>
          <article className="hz-kv-item"><span>Adres</span><strong>{customer.addressLine}</strong></article>
          <article className="hz-kv-item"><span>Atanmış fiyat grubu</span><strong>{customer.pricingProfile.priceSlotLabelSnapshot ?? `Slot ${customer.pricingProfile.selectedPriceSlotNo}`}</strong></article>
        </div>
      ) : null}

      {activeTab === "Hesap özeti" ? (
        account ? (
          <div className="hz-tab-content hz-page-stack">
            <div className="hz-modal-panel-grid">
              <article className="hz-kv-item"><span>Bakiye</span><strong>{money(account.balance, account.currency)}</strong></article>
              <article className="hz-kv-item"><span>Kredi limiti</span><strong>{account.creditLimit ? money(account.creditLimit, account.currency) : "—"}</strong></article>
              <article className="hz-kv-item"><span>Risk açıklaması</span><strong>{risk.description}</strong></article>
            </div>
            {ledgerEntries.length > 0 ? <MiniLedgerTable entries={ledgerEntries.slice(0, 3)} /> : <TabEmptyState title="Hareket özeti" message="Bu cari için henüz hesap hareketi kaydı yok." />}
          </div>
        ) : (
          <TabEmptyState title="Hesap özeti bağlı değil" message="Finans özeti API uçları tamamlandığında bakiye, limit ve hareket özeti burada görünecek." />
        )
      ) : null}

      {activeTab === "Hareketler" ? (
        ledgerEntries.length > 0 ? <MiniLedgerTable entries={ledgerEntries} /> : <TabEmptyState title="Hareket yok" message="Bu cari için kayıtlı hesap hareketi bulunmuyor." />
      ) : null}

      {activeTab === "Teklifler" ? (
        offers.length > 0 ? (
          <div className="table-wrap hz-table-wrap hz-tab-content">
            <table className="table hz-table">
              <thead><tr><th>Teklif no</th><th>Durum</th><th>Toplam</th><th>Geçerlilik</th></tr></thead>
              <tbody>
                {offers.map((offer) => (
                  <tr key={offer.id}>
                    <td>{offer.offerNo}</td>
                    <td>{offer.status}</td>
                    <td>{money(offer.grandTotal, offer.currency)}</td>
                    <td>{new Date(offer.validUntil).toLocaleDateString("tr-TR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <TabEmptyState title="Teklif kaydı yok" message="Bu cariye bağlı teklif bulunmuyor." actionsHint={<Link href={`/teklifler/yeni?customer=${customer.id}`} className="hz-btn hz-btn-secondary hz-toolbar-btn">Teklif oluştur</Link>} />
        )
      ) : null}

      {activeTab === "Siparişler" ? (
        <TabEmptyState title="Siparişler" message="Bu cariye bağlı sipariş listesi modül API bağlantısı ile doldurulacak." actionsHint={<Link href={`/siparisler/yeni?customer=${customer.id}`} className="hz-btn hz-btn-secondary hz-toolbar-btn">Sipariş oluştur</Link>} />
      ) : null}

      {activeTab === "Tahsilatlar" ? (
        <TabEmptyState title="Tahsilatlar" message="Bu cariye bağlı tahsilat kayıtları modül API bağlantısı ile doldurulacak." actionsHint={<Link href={`/tahsilatlar/yeni?customer=${customer.id}`} className="hz-btn hz-btn-secondary hz-toolbar-btn">Tahsilat gir</Link>} />
      ) : null}

      {activeTab === "Teslimatlar" ? <TabEmptyState title="Teslimatlar" message="Bu cariye bağlı teslimat kayıtları modül API bağlantısı ile doldurulacak." /> : null}

      {activeTab === "Belgeler" ? (
        <TabEmptyState title="Belgeler" message="Ekstre ve belge geçmişi belgeler modülünden görüntülenir." actionsHint={<Link href={`/belgeler?customer=${customer.id}&type=statement_pdf`} className="hz-btn hz-btn-secondary hz-toolbar-btn">Ekstre taslağı</Link>} />
      ) : null}

      {activeTab === "Yetkili kişiler" ? (
        contacts.length > 0 ? (
          <div className="table-wrap hz-table-wrap hz-tab-content">
            <table className="table hz-table">
              <thead><tr><th>İsim</th><th>Telefon</th><th>Ünvan</th><th>Birincil</th></tr></thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id}>
                    <td>{contact.fullName}</td>
                    <td>{contact.phone}</td>
                    <td>{contact.title ?? "—"}</td>
                    <td>{contact.isPrimary ? "Evet" : "Hayır"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <TabEmptyState title="Yetkili kişi yok" message="Bu cari için kayıtlı yetkili kişi bulunmuyor; iletişim API bağlandığında listelenecek." />
        )
      ) : null}

      {activeTab === "Adresler" ? (
        addresses.length > 0 ? (
          <div className="hz-modal-panel-grid hz-tab-content">
            {addresses.map((address) => (
              <article key={address.id} className="hz-kv-item">
                <span>{address.title}</span>
                <strong>{address.city} / {address.district ?? "—"} — {address.line}</strong>
              </article>
            ))}
          </div>
        ) : (
          <TabEmptyState title="Adres kaydı yok" message="Kart üzerindeki ana adres gösterilir; ek adresler API bağlandığında listelenecek." />
        )
      ) : null}
    </section>
  );
}

function MiniLedgerTable({ entries }: { entries: CustomerLedgerEntry[] }) {
  return (
    <div className="table-wrap hz-table-wrap hz-tab-content">
      <table className="table hz-table">
        <thead><tr><th>Tarih</th><th>Tip</th><th>Açıklama</th><th>Tutar</th></tr></thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td>{new Date(entry.occurredAt).toLocaleDateString("tr-TR")}</td>
              <td>{entry.direction === "debit" ? "Borç" : "Alacak"}</td>
              <td>{entry.description}</td>
              <td>{money(entry.amount, entry.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
