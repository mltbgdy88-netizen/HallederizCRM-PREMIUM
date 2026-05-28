// @ts-nocheck
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
          <h1 className="hz-orders-intro__title">SipariÅŸ Operasyon MasasÄ±</h1>
          <p className="hz-orders-intro__subtitle">
            SipariÅŸ, tahsilat, teslimat ve fatura durumunu tek ekranda takip edin.
          </p>
        </div>
      </div>
      <div className="hz-orders-intro__actions">
        <Link href="/hizli-islem" className="hz-orders-intro-btn hz-orders-intro-btn--primary">
          <LucideIcon name="plus-square" size={14} />
          <span>Yeni SipariÅŸ</span>
        </Link>
        <Link href="/hizli-islem" className="hz-orders-intro-btn hz-orders-intro-btn--secondary">
          <LucideIcon name="zap" size={14} />
          <span>HÄ±zlÄ± SatÄ±ÅŸ</span>
        </Link>
        <Link href="/print-export" className="hz-orders-intro-btn hz-orders-intro-btn--secondary">
          <LucideIcon name="file-text" size={14} />
          <span>DÄ±ÅŸa Aktar</span>
        </Link>
      </div>
    </header>
  );
}

