// @ts-nocheck
export const CYF_FORM = {
  title: "Yeni Cari Kaydı",
  subtitle: "Yeni cari bilgilerini girin"
} as const;

export const CYF_FIELDS = [
  {
    id: "unvan",
    label: "Ünvan",
    placeholder: "Cari ünvanını girin",
    type: "text" as const,
    icon: "building" as const
  },
  {
    id: "vergi",
    label: "Vergi No",
    placeholder: "Vergi numarasını girin",
    type: "text" as const,
    icon: "id" as const
  }
] as const;

export const CYF_LOCATION = {
  ilLabel: "İl",
  ilPlaceholder: "İl seçin",
  ilceLabel: "İlçe",
  ilcePlaceholder: "İlçe seçin"
} as const;

export const CYF_EXTRA_FIELDS = [
  {
    id: "adres",
    label: "Adres",
    placeholder: "Adres bilgisini girin",
    type: "textarea" as const,
    icon: "pin" as const
  },
  {
    id: "yetkili",
    label: "Yetkili",
    placeholder: "Yetkili kişi adını girin",
    type: "text" as const,
    icon: "person" as const
  },
  {
    id: "telefon",
    label: "Telefon",
    placeholder: "Telefon numarasını girin",
    type: "text" as const,
    icon: "phone" as const
  },
  {
    id: "eposta",
    label: "E-posta",
    placeholder: "E-posta adresini girin",
    type: "text" as const,
    icon: "mail" as const
  }
] as const;

export const CYF_ACTIONS = {
  save: "Kaydet",
  cancel: "Vazgeç"
} as const;
