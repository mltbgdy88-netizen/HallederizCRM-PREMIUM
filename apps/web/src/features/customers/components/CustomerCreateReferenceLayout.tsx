"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Customer } from "@hallederiz/types";
import { dataSourceConfig, sdk } from "../../../lib/data-source";
import { isOfflineLikeError } from "../../../lib/user-facing-data-error";

function mapCreateError(error: unknown): string {
  if (isOfflineLikeError(error)) {
    return "Kayıt şu anda oluşturulamıyor.";
  }
  if (typeof error === "object" && error !== null) {
    const candidate = error as { status?: unknown; message?: unknown };
    if (candidate.status === 403) {
      return "Bu işlem için yetkiniz bulunmuyor.";
    }
    if (candidate.status === 409) {
      return "Bu bilgilerle kayıtlı bir cari zaten var.";
    }
  }
  return "Kayıt şu anda oluşturulamıyor.";
}

const CITY_OPTIONS = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Kocaeli", "Gaziantep"];

function IconBuilding() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M4 21V7l8-4 8 4v14" />
      <path d="M9 21v-6h6v6" />
      <path d="M9 9h.01M15 9h.01M9 13h.01M15 13h.01" />
    </svg>
  );
}

function IconIdCard() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="12" r="2" />
      <path d="M15 10h4M15 14h4" />
    </svg>
  );
}

function IconMapPin() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function IconPerson() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c1.2-3.5 4-5.5 7-5.5s5.8 2 7 5.5" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M6.5 4h3l1.5 5-2 1.5a11 11 0 0 0 5 5L15.5 14l5 1.5v3A2 2 0 0 1 18.8 20 16 16 0 0 1 4 5.2 2 2 0 0 1 6.5 4z" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function IconUserPlus() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3.5 20c1-3 3.2-4.5 5.5-4.5" />
      <path d="M16 11v6M13 14h6" />
    </svg>
  );
}

type FieldIconProps = {
  children: React.ReactNode;
};

function FieldIcon({ children }: FieldIconProps) {
  return <span className="cyf-field__icon">{children}</span>;
}

export function CustomerCreateReferenceLayout() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [city, setCity] = useState("İstanbul");
  const [district, setDistrict] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setNotice(null);

    if (!name.trim()) {
      setNotice("Cari adı zorunludur.");
      return;
    }
    if (!phone.trim()) {
      setNotice("Telefon bilgisi zorunludur.");
      return;
    }

    if (dataSourceConfig.useDemoData) {
      setNotice("Canlı kayıt modu kapalı. Bağlantı kurulduğunda kayıt oluşturulabilir.");
      return;
    }

    setPending(true);
    try {
      const payload: Partial<Customer> = {
        name: name.trim(),
        taxNumber: taxNumber.trim() || undefined,
        phone: phone.trim(),
        email: email.trim() || undefined,
        addressLine: addressLine.trim() || "—",
        city: city.trim() || "İstanbul",
        district: district.trim() || undefined,
        type: "bayi",
        active: true
      };

      const response = await sdk.customers.create(payload);
      if (!response.item?.id) {
        setNotice("Kayıt şu anda oluşturulamıyor.");
        return;
      }

      router.push(`/cariler/${response.item.id}`);
    } catch (error) {
      setNotice(mapCreateError(error));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="cyf-page" data-page="cariler-yeni-form-reference">
      <article className="cyf-card">
        <header className="cyf-card__head">
          <span className="cyf-card__icon" aria-hidden>
            <IconUserPlus />
          </span>
          <div>
            <h1>Yeni Cari Kaydı</h1>
            <p>Yeni cari bilgilerini girin</p>
          </div>
        </header>

        <form className="cyf-form" onSubmit={handleSubmit}>
          <label className="cyf-field">
            <span className="cyf-field__label">Ünvan</span>
            <span className="cyf-field__control">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Cari ünvanını girin"
                required
              />
              <FieldIcon>
                <IconBuilding />
              </FieldIcon>
            </span>
          </label>

          <label className="cyf-field">
            <span className="cyf-field__label">Vergi No</span>
            <span className="cyf-field__control">
              <input
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                placeholder="Vergi numarasını girin"
              />
              <FieldIcon>
                <IconIdCard />
              </FieldIcon>
            </span>
          </label>

          <div className="cyf-field-row">
            <label className="cyf-field">
              <span className="cyf-field__label">İl</span>
              <span className="cyf-field__control cyf-field__control--select">
                <select value={city} onChange={(e) => setCity(e.target.value)}>
                  {CITY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </span>
            </label>

            <label className="cyf-field">
              <span className="cyf-field__label">İlçe</span>
              <span className="cyf-field__control cyf-field__control--select">
                <input
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="İlçe seçin"
                />
              </span>
            </label>
          </div>

          <label className="cyf-field">
            <span className="cyf-field__label">Adres</span>
            <span className="cyf-field__control cyf-field__control--textarea">
              <textarea
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                placeholder="Adres bilgisini girin"
                rows={3}
              />
              <FieldIcon>
                <IconMapPin />
              </FieldIcon>
            </span>
          </label>

          <label className="cyf-field">
            <span className="cyf-field__label">Yetkili</span>
            <span className="cyf-field__control">
              <input
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Yetkili kişi adını girin"
              />
              <FieldIcon>
                <IconPerson />
              </FieldIcon>
            </span>
          </label>

          <label className="cyf-field">
            <span className="cyf-field__label">Telefon</span>
            <span className="cyf-field__control">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Telefon numarasını girin"
                required
              />
              <FieldIcon>
                <IconPhone />
              </FieldIcon>
            </span>
          </label>

          <label className="cyf-field">
            <span className="cyf-field__label">E-posta</span>
            <span className="cyf-field__control">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-posta adresini girin"
              />
              <FieldIcon>
                <IconMail />
              </FieldIcon>
            </span>
          </label>

          {notice ? <p className="cyf-notice">{notice}</p> : null}

          <div className="cyf-actions">
            <button type="submit" className="cyf-btn cyf-btn--primary" disabled={pending}>
              <IconCheck />
              {pending ? "Kaydediliyor…" : "Kaydet"}
            </button>
            <Link href="/cariler" className="cyf-btn cyf-btn--ghost">
              <IconClose />
              Vazgeç
            </Link>
          </div>
        </form>
      </article>
    </div>
  );
}
