import { RouteSkeletonPage } from "../../../../src/components/page-system/route-skeleton-page";

export default function FactoryOrdersPage() {
  return (
    <RouteSkeletonPage
      title="Fabrika Siparisleri"
      description="Fabrikaya acilan siparislerin bagli satis ve durum takibini yapin."
      actions={["Yeni Fabrika Siparisi", "Durum Sorgula", "Senkron Loglari"]}
      filters={[
        { label: "Siparis No", type: "text", placeholder: "Fabrika siparisi ara" },
        { label: "Fabrika", type: "select", options: ["Ankara", "Izmir"] },
        { label: "Durum", type: "select", options: ["Yeni", "Iletildi", "Hazirlaniyor", "Tamam"] }
      ]}
      tableColumns={["Siparis No", "Fabrika", "Bagli Satis", "Satir Sayisi", "Durum"]}
      tableRows={[
        ["FO-221", "Ankara", "SO-2481", "3", "Iletildi"],
        ["FO-214", "Izmir", "SO-2478", "2", "Hazirlaniyor"],
        ["FO-208", "Ankara", "SO-2469", "4", "Yeni"]
      ]}
    />
  );
}
