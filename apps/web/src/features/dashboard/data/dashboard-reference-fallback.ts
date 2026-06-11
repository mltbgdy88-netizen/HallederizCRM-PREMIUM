export type ReferenceFlowItemTemplate = {
  id: string;
  title: string;
  detail: string;
  time: string;
  status: "Başarılı" | "Uyarı" | "Bilgi";
  icon: "plus" | "alert" | "transfer" | "price" | "shelf" | "system";
};

/** Yalnızca akış listesi boş kaldığında gösterilen referans şablonu (NAV_ITEMS dahil değil). */
export const REFERENCE_FLOW_FALLBACK: ReferenceFlowItemTemplate[] = [
  {
    id: "1",
    title: "Yeni Ürün Eklendi",
    detail: "UR-10008 kodlu ürün sisteme eklendi.",
    time: "10:24",
    status: "Başarılı",
    icon: "plus"
  },
  {
    id: "2",
    title: "Kritik Stok Uyarısı",
    detail: "UR-10006 ürünü kritik stok seviyesinin altına düştü.",
    time: "09:58",
    status: "Uyarı",
    icon: "alert"
  },
  {
    id: "3",
    title: "Stok Girişi Gerçekleştirildi",
    detail: "UR-10001 ürünü için 850 adet stok girişi yapıldı.",
    time: "09:35",
    status: "Başarılı",
    icon: "plus"
  },
  {
    id: "4",
    title: "Transfer Talebi Oluşturuldu",
    detail: "Merkez Depo → Fabrika Stok için transfer talebi oluşturuldu.",
    time: "09:12",
    status: "Bilgi",
    icon: "transfer"
  },
  {
    id: "5",
    title: "Depo Raf Güncellendi",
    detail: "A-01-01 lokasyonundaki raf bilgisi güncellendi.",
    time: "08:47",
    status: "Bilgi",
    icon: "shelf"
  },
  {
    id: "6",
    title: "Fiyat Güncellemesi",
    detail: "Hidrolik Yay 46 20L ürününün fiyatı güncellendi.",
    time: "08:15",
    status: "Başarılı",
    icon: "price"
  },
  {
    id: "7",
    title: "Rapor Oluşturuldu",
    detail: "Günlük stok hareket raporu oluşturuldu.",
    time: "Dün 17:45",
    status: "Bilgi",
    icon: "system"
  },
  {
    id: "8",
    title: "Transfer Tamamlandı",
    detail: "Transfer talebi başarıyla tamamlandı.",
    time: "Dün 16:30",
    status: "Başarılı",
    icon: "transfer"
  }
];

export const REFERENCE_AI_QUICK_ACTIONS = [
  { id: "1", label: "Kritik stokları göster" },
  { id: "2", label: "Günlük operasyon özetini hazırla" },
  { id: "3", label: "Bekleyen onayları listele" },
  { id: "4", label: "Vadesi geçen tahsilatları özetle" }
] as const;
