import { RouteSkeletonPage } from "../../../../src/components/page-system/route-skeleton-page";

export default function RolesPage() {
  return (
    <RouteSkeletonPage
      title="Roller"
      description="Izin matrisi, modul erisimi ve approval yetkilerini rol bazli yonetin."
      actions={["Yeni Rol", "Matrisi Duzenle", "Policy Bagla"]}
      filters={[
        { label: "Rol Adi", type: "text", placeholder: "Rol ara" },
        { label: "Modul", type: "select", options: ["Platform", "Satis", "Stok", "Tahsilat", "AI"] },
        { label: "Approval Yetkisi", type: "toggle" }
      ]}
      tableColumns={["Rol Adi", "Kod", "Modul Erisimi", "Izin Matrisi", "Approval Yetkisi"]}
      tableRows={[
        ["Platform Yoneticisi", "platform_admin", "Tum moduller", "Tam", "Evet"],
        ["Operasyon Uzmani", "operation_specialist", "Siparis, Depo", "Sinirli", "Kismi"],
        ["Finans Uzmani", "finance_specialist", "Tahsilat, Rapor", "Sinirli", "Evet"]
      ]}
    />
  );
}
