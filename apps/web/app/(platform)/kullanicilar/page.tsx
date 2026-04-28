import { RouteSkeletonPage } from "../../../src/components/page-system/route-skeleton-page";

export default function UsersPage() {
  return (
    <RouteSkeletonPage
      title="Kullanicilar"
      description="Kullanici hesaplari, rol atamalari ve platform erisim kapsamlarini yonetin."
      actions={["Yeni Kullanici", "Davet Gonder", "Toplu Durum Guncelle"]}
      filters={[
        { label: "Ad Soyad / E-Posta", type: "text", placeholder: "Kullanici ara" },
        { label: "Rol", type: "select", options: ["Platform Yoneticisi", "Satis", "Muhasebe", "Depo"] },
        { label: "Durum", type: "select", options: ["Aktif", "Pasif", "Davet"] },
        { label: "Mobil Erisim", type: "toggle" }
      ]}
      tableColumns={["Ad", "Rol", "Durum", "Son Giris", "Mobil Erisim", "Onay Yetkisi"]}
      tableRows={[
        ["Platform Admin", "Platform Yoneticisi", "Aktif", "Bugun", "Evet", "Evet"],
        ["Demo Operator", "Operasyon", "Davet", "-", "Evet", "Hayir"],
        ["Merve Finans", "Muhasebe", "Aktif", "Dun", "Hayir", "Evet"]
      ]}
    />
  );
}
