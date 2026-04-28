"use client";

import { calculateCustomerRiskState, resolveCustomerDisplayType } from "@hallederiz/domain";
import { TabSwitcher } from "@hallederiz/ui";
import type { Customer, CustomerAccount, CustomerAddress, CustomerContact, CustomerLedgerEntry, Offer } from "@hallederiz/types";
import { useMemo, useState } from "react";

const TABS = [
  "Genel",
  "Hesap Ozeti",
  "Hareketler",
  "Teklifler",
  "Siparisler",
  "Tahsilatlar",
  "Teslimatlar",
  "Belgeler",
  "Yetkili Kisiler",
  "Adresler"
];

function money(amount: number, currency: string): string {
  return `${amount.toLocaleString("tr-TR")} ${currency}`;
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
  account: CustomerAccount;
  contacts: CustomerContact[];
  addresses: CustomerAddress[];
  ledgerEntries: CustomerLedgerEntry[];
  offers: Offer[];
}) {
  const [activeTab, setActiveTab] = useState("Genel");
  const risk = useMemo(() => calculateCustomerRiskState(customer, account), [account, customer]);

  return (
    <section className="hz-content-card">
      <TabSwitcher items={TABS.map((tab) => ({ key: tab, label: tab }))} activeKey={activeTab} onChange={setActiveTab} />

      {activeTab === "Genel" ? (
        <div className="hz-modal-panel-grid hz-tab-content">
          <article className="hz-kv-item"><span>Cari Kodu</span><strong>{customer.code}</strong></article>
          <article className="hz-kv-item"><span>Cari Adi</span><strong>{customer.name}</strong></article>
          <article className="hz-kv-item"><span>Musteri Tipi</span><strong>{resolveCustomerDisplayType(customer.type)}</strong></article>
          <article className="hz-kv-item"><span>Vergi Bilgileri</span><strong>{customer.taxOffice ?? "-"} / {customer.taxNumber ?? "-"}</strong></article>
          <article className="hz-kv-item"><span>Telefon</span><strong>{customer.phone}</strong></article>
          <article className="hz-kv-item"><span>E-posta</span><strong>{customer.email ?? "-"}</strong></article>
          <article className="hz-kv-item"><span>Sehir</span><strong>{customer.city}</strong></article>
          <article className="hz-kv-item"><span>Adres</span><strong>{customer.addressLine}</strong></article>
          <article className="hz-kv-item"><span>Atanmis Fiyat Grubu</span><strong>{customer.pricingProfile.priceSlotLabelSnapshot ?? `Slot ${customer.pricingProfile.selectedPriceSlotNo}`}</strong></article>
        </div>
      ) : null}

      {activeTab === "Hesap Ozeti" ? (
        <div className="hz-tab-content hz-page-stack">
          <div className="hz-modal-panel-grid">
            <article className="hz-kv-item"><span>Bakiye</span><strong>{money(account.balance, account.currency)}</strong></article>
            <article className="hz-kv-item"><span>Kredi Limiti</span><strong>{account.creditLimit ? money(account.creditLimit, account.currency) : "Placeholder"}</strong></article>
            <article className="hz-kv-item"><span>Risk Aciklamasi</span><strong>{risk.description}</strong></article>
          </div>
          <MiniLedgerTable entries={ledgerEntries.slice(0, 3)} />
        </div>
      ) : null}

      {activeTab === "Hareketler" ? <MiniLedgerTable entries={ledgerEntries} /> : null}

      {activeTab === "Teklifler" ? (
        <div className="table-wrap hz-table-wrap hz-tab-content">
          <table className="table hz-table">
            <thead><tr><th>Teklif No</th><th>Durum</th><th>Toplam</th><th>Gecerlilik</th></tr></thead>
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
      ) : null}

      {["Siparisler", "Tahsilatlar", "Teslimatlar", "Belgeler"].includes(activeTab) ? (
        <div className="hz-state-card hz-tab-content">
          <h4>{activeTab}</h4>
          <p>Bu cariyle iliskili {activeTab.toLocaleLowerCase("tr-TR")} kayitlari ilgili modul baglantisi ile doldurulacak.</p>
        </div>
      ) : null}

      {activeTab === "Yetkili Kisiler" ? (
        <div className="table-wrap hz-table-wrap hz-tab-content">
          <table className="table hz-table">
            <thead><tr><th>Isim</th><th>Telefon</th><th>Unvan</th><th>Primary</th></tr></thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id}>
                  <td>{contact.fullName}</td>
                  <td>{contact.phone}</td>
                  <td>{contact.title ?? "-"}</td>
                  <td>{contact.isPrimary ? "Evet" : "Hayir"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {activeTab === "Adresler" ? (
        <div className="hz-modal-panel-grid hz-tab-content">
          {addresses.map((address) => (
            <article key={address.id} className="hz-kv-item">
              <span>{address.title}</span>
              <strong>{address.city} / {address.district ?? "-"} - {address.line}</strong>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function MiniLedgerTable({ entries }: { entries: CustomerLedgerEntry[] }) {
  return (
    <div className="table-wrap hz-table-wrap hz-tab-content">
      <table className="table hz-table">
        <thead><tr><th>Tarih</th><th>Tip</th><th>Aciklama</th><th>Tutar</th></tr></thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td>{new Date(entry.occurredAt).toLocaleDateString("tr-TR")}</td>
              <td>{entry.direction === "debit" ? "Borc" : "Alacak"}</td>
              <td>{entry.description}</td>
              <td>{money(entry.amount, entry.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
