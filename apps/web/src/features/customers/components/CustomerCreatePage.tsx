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

export function CustomerCreatePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("İstanbul");
  const [priceGroup, setPriceGroup] = useState("1");
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
        code: code.trim() || undefined,
        taxNumber: taxNumber.trim() || undefined,
        phone: phone.trim(),
        email: email.trim() || undefined,
        addressLine: addressLine.trim() || "—",
        city: city.trim() || "İstanbul",
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
    <div className="hz-customers-create-page">
      <header className="hz-customers-create-head">
        <div>
          <p className="hz-customers-create-kicker">Cariler</p>
          <h1 className="hz-customers-create-title">Yeni cari</h1>
          <p className="hz-customers-create-lead">Temel cari bilgilerini girin; kayıt yalnızca canlı bağlantıda oluşturulur.</p>
        </div>
        <Link href="/cariler" className="hz-customers-create-back">
          Cari listesine dön
        </Link>
      </header>

      <form className="hz-customers-create-form" onSubmit={handleSubmit}>
        <label className="hz-customers-create-field">
          <span>Cari adı</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className="hz-customers-create-field">
          <span>Cari kodu</span>
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Opsiyonel" />
        </label>
        <label className="hz-customers-create-field">
          <span>Vergi no</span>
          <input value={taxNumber} onChange={(e) => setTaxNumber(e.target.value)} />
        </label>
        <label className="hz-customers-create-field">
          <span>Telefon</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </label>
        <label className="hz-customers-create-field">
          <span>E-posta</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="hz-customers-create-field">
          <span>Adres</span>
          <input value={addressLine} onChange={(e) => setAddressLine(e.target.value)} />
        </label>
        <label className="hz-customers-create-field">
          <span>Şehir</span>
          <input value={city} onChange={(e) => setCity(e.target.value)} />
        </label>
        <label className="hz-customers-create-field">
          <span>Fiyat grubu</span>
          <select value={priceGroup} onChange={(e) => setPriceGroup(e.target.value)}>
            <option value="1">Fiyat Alanı 1</option>
            <option value="2">Fiyat Alanı 2</option>
            <option value="3">Fiyat Alanı 3</option>
          </select>
        </label>

        {notice ? <p className="hz-customers-create-notice">{notice}</p> : null}

        <div className="hz-customers-create-actions">
          <button type="submit" className="hz-customers-create-submit" disabled={pending}>
            {pending ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}
