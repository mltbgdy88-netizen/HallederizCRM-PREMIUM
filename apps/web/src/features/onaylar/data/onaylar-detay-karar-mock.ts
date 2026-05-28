// @ts-nocheck
export const ODK_BREADCRUMB = "Onaylar > Onay Detayı";
export const ODK_TITLE = "Onay Karar Masası";
export const ODK_APPROVAL_NO = "ONY-2025-000124";
export const ODK_APPROVAL_TYPE = "Tek Onay";

export const ODK_PRODUCT = {
  status: "Bekliyor",
  created: "25.05.2025 14:32",
  requester: "Ali Yılmaz",
  code: "UR-10001",
  name: "Rulman 6205 2RS",
  stockStatus: "Stokta",
  fields: [
    { label: "Marka", value: "SKF" },
    { label: "Kategori", value: "Rulmanlar" },
    { label: "Depo", value: "Merkez Depo" },
    { label: "Birim", value: "Adet" },
    { label: "Mevcut Stok", value: "2.450" },
    { label: "Kritik Stok", value: "86" }
  ]
};

export const ODK_PRICE = {
  current: { label: "Mevcut Kayıt", price: "₺85,00", supplier: "SKF" },
  diff: "+ ₺35,00 (+%41,18)",
  requested: { label: "Talep Edilen Değişiklik", price: "₺120,00", supplier: "SKF" }
};

export const ODK_REASON =
  "Tedarikçi fiyat güncellemesi nedeniyle birim fiyat artışı talep edilmektedir. Son alım fiyatı ile karşılaştırıldığında %41,18 artış görülmektedir. Stok seviyesi yeterli olup iş sürekliliği etkilenmeyecektir.";

export const ODK_ATTACHMENTS = [
  { name: "fiyat-teklifi-skf.pdf", size: "245 KB" },
  { name: "tedarikci-yazisi.pdf", size: "128 KB" }
];

export const ODK_RELATED = [
  { label: "Son Alım Fiyatı", value: "₺80,00" },
  { label: "Ortalama Fiyat", value: "₺82,10" },
  { label: "Son Alım Tarihi", value: "10.05.2025" },
  { label: "Fiyat Grubu", value: "A" },
  { label: "Para Birimi", value: "TRY" },
  { label: "KDV Oranı", value: "%20" }
];

export const ODK_RISKS = [
  { label: "Stok Riski", value: "Düşük", tone: "green" },
  { label: "Maliyet Etkisi", value: "Orta", tone: "orange" },
  { label: "Tedarik Riski", value: "Düşük", tone: "green" },
  { label: "İş Sürekliliği", value: "Etkilenmez", tone: "green" }
];

export const ODK_IMPACT = [
  { label: "Aylık Tahmini Tüketim", value: "150 Adet" },
  { label: "Birim Farkı", value: "₺35,00" },
  { label: "Aylık Etki", value: "+ ₺5.250,00", negative: true },
  { label: "Yıllık Etki", value: "+ ₺63.000,00", negative: true }
];

export const ODK_HISTORY = [
  { id: "1", actor: "Ali Yılmaz", action: "Talep oluşturuldu", time: "14:32" },
  { id: "2", actor: "Ali Yılmaz", action: "Düzenlendi", time: "14:45" },
  { id: "3", actor: "Yusuf Kaya", action: "Onaya gönderildi", time: "15:02" }
];
