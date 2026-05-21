"use client";

import { LucideIcon } from "../../../components/icons/lucide-icons";

export function ApprovalPolicyBand() {
  return (
    <div className="hz-approval-policy-band" role="note">
      <LucideIcon name="shield" size={14} />
      <span>
        Manuel kullanıcı işlemleri onay beklemez. Bu ekran sadece AI, otomasyon veya mesaj kaynaklı öneriler içindir.
      </span>
    </div>
  );
}
