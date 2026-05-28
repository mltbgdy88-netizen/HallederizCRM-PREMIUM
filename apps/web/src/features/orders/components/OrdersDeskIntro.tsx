"use client";

import Link from "next/link";
import { LucideIcon } from "../../../components/icons/lucide-icons";

export function OrdersDeskIntro() {
  return (
    <header className="hz-orders-intro">
      <div className="hz-orders-intro__left">
        <span className="hz-orders-intro__icon" aria-hidden>
          <LucideIcon name="shopping-cart" size={16} />
        </span>
        <div>
          <h1 className="hz-orders-intro__title">Sipariş Operasyon Masası</h1>
          <p className="hz-orders-intro__subtitle">
            Sipariş, tahsilat, teslimat ve fatura durumunu tek ekranda takip edin.
          </p>
        </div>
      </div>
      <div className="hz-orders-intro__actions">
        <Link href="/hizli-islem" className="hz-orders-intro-btn hz-orders-intro-btn--primary">
          <LucideIcon name="plus-square" size={14} />
          <span>Yeni Sipariş</span>
        </Link>
        <Link href="/hizli-islem" className="hz-orders-intro-btn hz-orders-intro-btn--secondary">
          <LucideIcon name="zap" size={14} />
          <span>Hızlı Satış</span>
        </Link>
        <Link href="/print-export" className="hz-orders-intro-btn hz-orders-intro-btn--secondary">
          <LucideIcon name="file-text" size={14} />
          <span>Dışa Aktar</span>
        </Link>
      </div>
    </header>
  );
}
