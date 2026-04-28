import { RouteSkeletonPage } from "../../../../src/components/page-system/route-skeleton-page";

export default function AiApprovalsPage() {
  return (
    <RouteSkeletonPage
      title="AI Onaylar"
      description="AI tarafindan uretilen proposal kayitlari ve insan onay akislarini yonetin."
      actions={["Onayla", "Reddet", "Detay Ac"]}
      filters={[
        { label: "Proposal No", type: "text", placeholder: "AI proposal ara" },
        { label: "Durum", type: "select", options: ["Bekliyor", "Onaylandi", "Reddedildi"] },
        { label: "Yetki", type: "select", options: ["Yonetici", "Operasyon", "Finans"] }
      ]}
      tableColumns={["Proposal", "Domain Aksiyon", "Durum", "Olusturan", "Onay Seviyesi"]}
      tableRows={[
        ["AI-401", "Tahsilat Follow-up", "Bekliyor", "AI-Service", "Yonetici"],
        ["AI-395", "Fiyat Slot Guncelle", "Onaylandi", "AI-Service", "Finans"],
        ["AI-390", "Siparis Oncelik Degisimi", "Reddedildi", "AI-Service", "Operasyon"]
      ]}
      sideTitle="Approval Record"
      sideItems={[
        "Approval Policy: payment.followup.change",
        "Server-side execution: onaydan sonra tetiklenir",
        "Audit: tum kararlar timeline'a islenir",
        "Mutation modu: insan onayli"
      ]}
    />
  );
}
