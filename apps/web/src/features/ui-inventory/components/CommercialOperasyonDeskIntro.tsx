"use client";

import type { ReactNode } from "react";
import { LucideIcon, type LucideIconName } from "../../../components/icons/lucide-icons";

export function CommercialOperasyonDeskIntro({
  title,
  subtitle,
  icon,
  actions
}: {
  title: string;
  subtitle: string;
  icon: LucideIconName;
  actions: ReactNode;
}) {
  return (
    <div className="hz-commercial-desk-intro">
      <div className="hz-commercial-desk-intro__left">
        <span className="hz-commercial-desk-intro__icon" aria-hidden>
          <LucideIcon name={icon} size={20} />
        </span>
        <div>
          <h1 className="hz-commercial-desk-intro__title">{title}</h1>
          <p className="hz-commercial-desk-intro__subtitle">{subtitle}</p>
        </div>
      </div>
      <nav className="hz-commercial-desk-intro__actions" aria-label="Sayfa aksiyonları">
        {actions}
      </nav>
    </div>
  );
}

