"use client";

import { calculateCustomerRiskState, resolveCustomerDisplayType } from "@hallederiz/domain";
import type { Customer, CustomerAccount } from "@hallederiz/types";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import {
  IconBuilding,
  IconExternalLink,
  IconFileText,
  IconMapPin,
  IconMessageCircle,
  IconPhone,
  IconSend,
  IconShieldCheck,
  IconSparkles,
  IconTag,
  IconUser,
  IconWallet,
  QuickActionIcon
} from "../../dashboard/components/dashboard-inline-icons";
import { useToast } from "../../../providers/toast-provider";
import type { CustomerRow } from "../mappers/map-customer-row";
import { isCustomersDemoRowId } from "../data/customers-demo-rows";

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

function buildRiskNoteWithoutAccount(customer: Customer): string {
  const parts: string[] = ["Finans özeti henüz bağlı değil; bakiye ve vade bilgisi gösterilmez."];
  if (customer.whatsappMatched) {
    parts.push("WhatsApp eşleşmesi aktif; belge gönderiminde onay zinciri kullanılmalı.");
  }
  if (customer.riskLevel === "high" || customer.riskLevel === "blocked") {
    parts.push("Cari risk profili yüksek veya blokeli; işlemlerde ek onay gerekebilir.");
  }
  if (parts.length === 1) {
    return parts[0]!;
  }
  return parts.join(" ");
}

function buildRiskNote(customer: Customer, account: CustomerAccount): string {
  const risk = calculateCustomerRiskState(customer, account);
  const parts: string[] = [];
  if (account.balance > 50000) {
    parts.push("Bu cari için açık bakiye yüksek. Yeni sipariş öncesi tahsilat kontrolü önerilir.");
  } else if (account.overdueAmount > 0) {
    parts.push("Vadesi geçen tutar bulunuyor; tahsilat planı veya ekstre onayı değerlendirin.");
  }
  if (customer.whatsappMatched) {
    parts.push("WhatsApp eşleşmesi aktif; belge gönderiminde onay zinciri kullanılmalı.");
  }
  if (risk.level === "high" || risk.level === "blocked") {
    parts.push("Risk seviyesi yüksek veya blokeli; işlemlerde ek onay gerekebilir.");
  }
  if (parts.length === 0) {
    return "Profil stabil görünüyor. Rutin operasyon ve teklif akışına devam edebilirsiniz.";
  }
  return parts.join(" ");
}

function CustomerRadarChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="hz-customers-side-head">
        <h2 className="hz-customers-side-title">Cari Radarı</h2>
        <p className="hz-customers-side-lead">Seçili carinin risk, bakiye ve operasyon özetleri.</p>
      </header>
      <div className="hz-customers-side-scroll">{children}</div>
    </>
  );
}

function buildDemoRiskNote(row: CustomerRow): string {
  if (row.riskTone === "danger") {
    return "Yüksek risk profili; limit ve tahsilat sıkı takip önerilir (taslak özet, kayıt değiştirmez).";
  }
  if (row.riskTone === "warning") {
    return "Orta risk; sipariş öncesi bakiye kontrolü faydalıdır (taslak özet).";
  }
  return "Risk profili dengeli; rutin operasyon akışına uygun (taslak özet).";
}

export function CustomerQuickPreviewPanel({
  customer,
  account,
  previewRow
}: {
  customer: Customer | null;
  account: CustomerAccount | null;
  previewRow?: CustomerRow | null;
}) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [demoDone, setDemoDone] = useState<Record<string, boolean>>({});

  const fireDemo = (key: string, message: string) => {
    if (demoDone[key]) {
      return;
    }
    pushToast(message);
    setDemoDone((d) => ({ ...d, [key]: true }));
  };

  const emptyShell = (
    <CustomerRadarChrome>
      <section className="hz-customers-side-card">
        <div className="hz-customers-side-empty-visual" aria-hidden>
          <IconUser size={20} />
        </div>
        <p className="hz-customers-side-empty-title">Listeden bir cari seçin</p>
        <p className="hz-customers-side-empty-lead">Özet panosu, soldaki listeden bir satır seçildiğinde dolar.</p>
      </section>
    </CustomerRadarChrome>
  );

  if (previewRow && isCustomersDemoRowId(previewRow.customerId)) {
    return (
      <CustomerRadarChrome>
        <section className="hz-customers-side-card">
          <h3 className="hz-customers-side-card-title">Cari kimliği</h3>
          <p className="hz-customers-side-name">{previewRow.name}</p>
          <dl className="hz-customers-dl">
            <div>
              <dt>Kod</dt>
              <dd>{previewRow.code}</dd>
            </div>
            <div>
              <dt>Tip</dt>
              <dd>{previewRow.typeLabel}</dd>
            </div>
            <div>
              <dt>
                <IconMapPin size={12} className="hz-customers-dl-ico" /> Şehir
              </dt>
              <dd>{previewRow.city}</dd>
            </div>
            <div>
              <dt>
                <IconPhone size={12} className="hz-customers-dl-ico" /> Telefon
              </dt>
              <dd>{previewRow.phone}</dd>
            </div>
            <div>
              <dt>Vergi</dt>
              <dd>—</dd>
            </div>
            <div>
              <dt>
                <IconTag size={12} className="hz-customers-dl-ico" /> Fiyat grubu
              </dt>
              <dd>{previewRow.priceGroupLabel}</dd>
            </div>
          </dl>
          <span className="hz-customers-status hz-customers-status--ok">Önizleme</span>
        </section>

        <section className="hz-customers-side-card">
          <h3 className="hz-customers-side-card-title">Finans özeti</h3>
          <dl className="hz-customers-dl hz-customers-dl--fin">
            <div>
              <dt>Alacak</dt>
              <dd className="hz-customers-dd-pos">{previewRow.balanceCreditLine === "—" ? "—" : previewRow.balanceCreditLine}</dd>
            </div>
            <div>
              <dt>Verecek</dt>
              <dd className="hz-customers-dd-neg">{previewRow.balanceDebitLine === "—" ? "—" : previewRow.balanceDebitLine}</dd>
            </div>
            <div>
              <dt>Net bakiye</dt>
              <dd>{previewRow.balanceLabel}</dd>
            </div>
            <div>
              <dt>Kredi limiti</dt>
              <dd>—</dd>
            </div>
          </dl>
          <p className="hz-customers-risk-line">
            <IconShieldCheck size={14} /> {previewRow.riskLabel}
          </p>
          <p className="hz-customers-muted-small">Vade uyarısı: önizleme verisi (—).</p>
        </section>

        <section className="hz-customers-side-card">
          <h3 className="hz-customers-side-card-title">Operasyon bağlantıları</h3>
          <ul className="hz-customers-op-list">
            <li>
              <IconBuilding size={14} /> Açık sipariş: <strong>—</strong>
            </li>
            <li>
              <IconWallet size={14} /> Bekleyen tahsilat: <strong>—</strong>
            </li>
            <li>
              <IconFileText size={14} /> Son teklif / belge: <strong>—</strong>
            </li>
            <li>
              <IconMessageCircle size={14} /> WhatsApp: <strong>{previewRow.whatsappMatched ? "Eşleşti" : "Eşleşmedi"}</strong>
            </li>
          </ul>
        </section>

        <section className="hz-customers-side-card">
          <h3 className="hz-customers-side-card-title">Hızlı aksiyonlar</h3>
          <div className="hz-customers-side-actions">
            <button
              type="button"
              className="hz-customers-side-btn hz-customers-side-btn--primary"
              disabled={Boolean(demoDone.open)}
              onClick={() => fireDemo("open", "Önizleme: cari detayı gerçek kayıt olmadan açılmaz (demo).")}
            >
              <IconExternalLink size={15} />
              Cariyi aç
            </button>
            <button type="button" className="hz-customers-side-btn" disabled={Boolean(demoDone.offer)} onClick={() => fireDemo("offer", "Teklif oluşturma demo; kayıt oluşturulmaz.")}>
              <IconTag size={15} />
              Teklif oluştur
            </button>
            <button type="button" className="hz-customers-side-btn" disabled={Boolean(demoDone.order)} onClick={() => fireDemo("order", "Sipariş oluşturma demo; kayıt oluşturulmaz.")}>
              <QuickActionIcon kind="order" size={16} className="hz-customers-side-svg" />
              Sipariş oluştur
            </button>
            <button type="button" className="hz-customers-side-btn" disabled={Boolean(demoDone.pay)} onClick={() => fireDemo("pay", "Tahsilat girişi demo; kayıt oluşturulmaz.")}>
              <QuickActionIcon kind="pay" size={16} className="hz-customers-side-svg" />
              Tahsilat gir
            </button>
            <button type="button" className="hz-customers-side-btn" disabled={Boolean(demoDone.stmt)} onClick={() => fireDemo("stmt", "Ekstre taslağı demo; gönderim yapılmaz.")}>
              <IconSend size={15} />
              Ekstre taslağı
            </button>
            <button type="button" className="hz-customers-side-btn" disabled={Boolean(demoDone.wa)} onClick={() => fireDemo("wa", "WhatsApp geçmişi demo; yönlendirme yok.")}>
              <IconMessageCircle size={15} />
              WhatsApp geçmişi
            </button>
          </div>
        </section>

        <section className="hz-customers-side-card hz-customers-risk-note">
          <h3 className="hz-customers-side-card-title">
            <IconSparkles size={14} /> Risk notu
          </h3>
          <p className="hz-customers-risk-note-text">{buildDemoRiskNote(previewRow)}</p>
          <p className="hz-customers-ai-disclaimer">Özet bilgi; kayıt değiştirmez.</p>
        </section>
    </CustomerRadarChrome>
    );
  }

  if (!customer) {
    return emptyShell;
  }

  if (!account) {
    return (
      <CustomerRadarChrome>
        <section className="hz-customers-side-card">
          <h3 className="hz-customers-side-card-title">Cari kimliği</h3>
          <p className="hz-customers-side-name">{customer.name}</p>
          <dl className="hz-customers-dl">
            <div>
              <dt>Kod</dt>
              <dd>{customer.code}</dd>
            </div>
            <div>
              <dt>Tip</dt>
              <dd>{resolveCustomerDisplayType(customer.type)}</dd>
            </div>
            <div>
              <dt>
                <IconMapPin size={12} className="hz-customers-dl-ico" /> Şehir
              </dt>
              <dd>{customer.city}</dd>
            </div>
            <div>
              <dt>
                <IconPhone size={12} className="hz-customers-dl-ico" /> Telefon
              </dt>
              <dd>{customer.phone}</dd>
            </div>
            <div>
              <dt>Vergi</dt>
              <dd>
                {customer.taxOffice ?? "—"} {customer.taxNumber ? `· ${customer.taxNumber}` : ""}
              </dd>
            </div>
            <div>
              <dt>
                <IconTag size={12} className="hz-customers-dl-ico" /> Fiyat grubu
              </dt>
              <dd>{customer.pricingProfile.priceSlotLabelSnapshot ?? `Slot ${customer.pricingProfile.selectedPriceSlotNo}`}</dd>
            </div>
          </dl>
          <span className={`hz-customers-status ${customer.active ? "hz-customers-status--ok" : "hz-customers-status--off"}`}>
            {customer.active ? "Aktif cari" : "Pasif cari"}
          </span>
        </section>

        <section className="hz-customers-side-card">
          <h3 className="hz-customers-side-card-title">Finans özeti</h3>
          <p className="hz-customers-muted-small">Finans özeti henüz bağlı değil. Hesap özeti API bağlantısı tamamlanınca burada görünür.</p>
        </section>

        <section className="hz-customers-side-card">
          <h3 className="hz-customers-side-card-title">Operasyon bağlantıları</h3>
          <ul className="hz-customers-op-list">
            <li>
              <IconBuilding size={14} /> Açık sipariş: <strong>—</strong>
            </li>
            <li>
              <IconWallet size={14} /> Bekleyen tahsilat bağlamı: <strong>—</strong>
            </li>
            <li>
              <IconFileText size={14} /> Son ödeme: <strong>—</strong>
            </li>
            <li>
              <IconMessageCircle size={14} /> WhatsApp: <strong>{customer.whatsappMatched ? "Eşleşti" : "Eşleşmedi"}</strong>
            </li>
          </ul>
        </section>

        <section className="hz-customers-side-card">
          <h3 className="hz-customers-side-card-title">Hızlı aksiyonlar</h3>
          <div className="hz-customers-side-actions">
            <button type="button" className="hz-customers-side-btn hz-customers-side-btn--primary" onClick={() => router.push(`/cariler/${customer.id}`)}>
              <IconExternalLink size={15} />
              Cariyi aç
            </button>
            <button type="button" className="hz-customers-side-btn" onClick={() => router.push(`/teklifler/yeni?customer=${customer.id}`)}>
              <IconTag size={15} />
              Teklif oluştur
            </button>
            <button type="button" className="hz-customers-side-btn" onClick={() => router.push(`/siparisler/yeni?customer=${customer.id}`)}>
              <QuickActionIcon kind="order" size={16} className="hz-customers-side-svg" />
              Sipariş oluştur
            </button>
            <button type="button" className="hz-customers-side-btn" onClick={() => router.push(`/tahsilatlar/yeni?customer=${customer.id}`)}>
              <QuickActionIcon kind="pay" size={16} className="hz-customers-side-svg" />
              Tahsilat gir
            </button>
            <button type="button" className="hz-customers-side-btn" onClick={() => router.push(`/belgeler?customer=${customer.id}&type=statement_pdf`)}>
              <IconSend size={15} />
              Ekstre taslağı
            </button>
            <button type="button" className="hz-customers-side-btn" onClick={() => router.push(`/whatsapp?customer=${customer.id}`)}>
              <IconMessageCircle size={15} />
              WhatsApp geçmişi
            </button>
          </div>
        </section>

        <section className="hz-customers-side-card hz-customers-risk-note">
          <h3 className="hz-customers-side-card-title">
            <IconSparkles size={14} /> Risk notu
          </h3>
          <p className="hz-customers-risk-note-text">{buildRiskNoteWithoutAccount(customer)}</p>
          <p className="hz-customers-ai-disclaimer">Özet öneridir; kayıt değiştirmez.</p>
        </section>
      </CustomerRadarChrome>
    );
  }

  const risk = calculateCustomerRiskState(customer, account);
  const bal = account.balance;
  const rec = bal > 0 ? formatMoney(bal, account.currency) : "—";
  const pay = bal < 0 ? formatMoney(-bal, account.currency) : "—";
  const net = formatMoney(bal, account.currency);

  return (
    <CustomerRadarChrome>

      <section className="hz-customers-side-card">
        <h3 className="hz-customers-side-card-title">Cari kimliği</h3>
        <p className="hz-customers-side-name">{customer.name}</p>
        <dl className="hz-customers-dl">
          <div>
            <dt>Kod</dt>
            <dd>{customer.code}</dd>
          </div>
          <div>
            <dt>Tip</dt>
            <dd>{resolveCustomerDisplayType(customer.type)}</dd>
          </div>
          <div>
            <dt>
              <IconMapPin size={12} className="hz-customers-dl-ico" /> Şehir
            </dt>
            <dd>{customer.city}</dd>
          </div>
          <div>
            <dt>
              <IconPhone size={12} className="hz-customers-dl-ico" /> Telefon
            </dt>
            <dd>{customer.phone}</dd>
          </div>
          <div>
            <dt>Vergi</dt>
            <dd>
              {customer.taxOffice ?? "—"} {customer.taxNumber ? `· ${customer.taxNumber}` : ""}
            </dd>
          </div>
          <div>
            <dt>
              <IconTag size={12} className="hz-customers-dl-ico" /> Fiyat grubu
            </dt>
            <dd>{customer.pricingProfile.priceSlotLabelSnapshot ?? `Slot ${customer.pricingProfile.selectedPriceSlotNo}`}</dd>
          </div>
        </dl>
        <span className={`hz-customers-status ${customer.active ? "hz-customers-status--ok" : "hz-customers-status--off"}`}>
          {customer.active ? "Aktif cari" : "Pasif cari"}
        </span>
      </section>

      <section className="hz-customers-side-card">
        <h3 className="hz-customers-side-card-title">Finans özeti</h3>
        <dl className="hz-customers-dl hz-customers-dl--fin">
          <div>
            <dt>Alacak</dt>
            <dd className="hz-customers-dd-pos">{rec}</dd>
          </div>
          <div>
            <dt>Verecek</dt>
            <dd className="hz-customers-dd-neg">{pay}</dd>
          </div>
          <div>
            <dt>Net bakiye</dt>
            <dd>{net}</dd>
          </div>
          <div>
            <dt>Kredi limiti</dt>
            <dd>{account.creditLimit != null ? formatMoney(account.creditLimit, account.currency) : "—"}</dd>
          </div>
        </dl>
        <p className="hz-customers-risk-line">
          <IconShieldCheck size={14} /> {risk.label}
        </p>
        {account.overdueAmount > 0 ? (
          <p className="hz-customers-warn-line">Vade uyarısı: {formatMoney(account.overdueAmount, account.currency)} gecikmiş.</p>
        ) : (
          <p className="hz-customers-muted-small">Vadesi geçen bakiye yok.</p>
        )}
      </section>

      <section className="hz-customers-side-card">
        <h3 className="hz-customers-side-card-title">Operasyon bağlantıları</h3>
        <ul className="hz-customers-op-list">
          <li>
            <IconBuilding size={14} /> Açık sipariş: <strong>{account.openOrderCount}</strong>
          </li>
          <li>
            <IconWallet size={14} /> Bekleyen tahsilat bağlamı: <strong>{account.openOfferCount} teklif</strong>
          </li>
          <li>
            <IconFileText size={14} /> Son ödeme:{" "}
            <strong>{account.lastPaymentAt ? new Date(account.lastPaymentAt).toLocaleDateString("tr-TR") : "—"}</strong>
          </li>
          <li>
            <IconMessageCircle size={14} /> WhatsApp: <strong>{customer.whatsappMatched ? "Eşleşti" : "Eşleşmedi"}</strong>
          </li>
        </ul>
      </section>

      <section className="hz-customers-side-card">
        <h3 className="hz-customers-side-card-title">Hızlı aksiyonlar</h3>
        <div className="hz-customers-side-actions">
          <button type="button" className="hz-customers-side-btn hz-customers-side-btn--primary" onClick={() => router.push(`/cariler/${customer.id}`)}>
            <IconExternalLink size={15} />
            Cariyi aç
          </button>
          <button type="button" className="hz-customers-side-btn" onClick={() => router.push(`/teklifler/yeni?customer=${customer.id}`)}>
            <IconTag size={15} />
            Teklif oluştur
          </button>
          <button type="button" className="hz-customers-side-btn" onClick={() => router.push(`/siparisler/yeni?customer=${customer.id}`)}>
            <QuickActionIcon kind="order" size={16} className="hz-customers-side-svg" />
            Sipariş oluştur
          </button>
          <button type="button" className="hz-customers-side-btn" onClick={() => router.push(`/tahsilatlar/yeni?customer=${customer.id}`)}>
            <QuickActionIcon kind="pay" size={16} className="hz-customers-side-svg" />
            Tahsilat gir
          </button>
          <button type="button" className="hz-customers-side-btn" onClick={() => router.push(`/belgeler?customer=${customer.id}&type=statement_pdf`)}>
            <IconSend size={15} />
            Ekstre taslağı
          </button>
          <button type="button" className="hz-customers-side-btn" onClick={() => router.push(`/whatsapp?customer=${customer.id}`)}>
            <IconMessageCircle size={15} />
            WhatsApp geçmişi
          </button>
        </div>
      </section>

      <section className="hz-customers-side-card hz-customers-risk-note">
        <h3 className="hz-customers-side-card-title">
          <IconSparkles size={14} /> Risk notu
        </h3>
        <p className="hz-customers-risk-note-text">{buildRiskNote(customer, account)}</p>
        <p className="hz-customers-ai-disclaimer">Özet öneridir; kayıt değiştirmez. İşlemler onay ve politika zincirinden geçer.</p>
      </section>
    </CustomerRadarChrome>
  );
}
