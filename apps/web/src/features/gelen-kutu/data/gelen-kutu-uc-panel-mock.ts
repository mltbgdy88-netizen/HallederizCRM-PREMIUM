// @ts-nocheck
export const GKU_PAGE = {
  title: "Gelen Kutu",
  subtitle: "Tüm kanallardan gelen mesajları tek merkezden yönetin."
};

export const GKU_FOLDERS = [
  { label: "Gelen Kutusu", count: 24, active: true },
  { label: "Bekleyen", count: 8 },
  { label: "Atanan", count: 12 },
  { label: "Tamamlanan", count: 152 },
  { label: "Spam", count: 6 },
  { label: "Çöp", count: 4 }
];

export const GKU_CHANNELS = [
  { label: "WhatsApp", count: 12 },
  { label: "Canlı Destek", count: 6 },
  { label: "Instagram", count: 3 },
  { label: "Facebook", count: 2 },
  { label: "E-posta", count: 1 },
  { label: "SMS", count: 0 },
  { label: "Web Formu", count: 0 },
  { label: "Telefon", count: 0 }
];

export const GKU_CONVERSATIONS = [
  {
    id: "1",
    name: "Ahmet Yılmaz",
    channel: "WhatsApp",
    preview: "Merhaba, UR-10001 kodlu ürünün fiyatı nedir?",
    time: "10:24",
    unread: 2,
    selected: true,
    status: "Yeni"
  },
  {
    id: "2",
    name: "Zeynep Kaya",
    channel: "Instagram",
    preview: "Kargo takip numarasını paylaşır mısınız?",
    time: "09:52",
    unread: 1,
    status: "Atanmadı"
  },
  {
    id: "3",
    name: "Mehmet Demir",
    channel: "E-posta",
    preview: "Teşekkürler, ödeme planını onayladım.",
    time: "Dün",
    unread: 0,
    status: "Tamamlandı"
  }
];

export const GKU_CHAT_HEADER = {
  name: "Ahmet Yılmaz",
  phone: "905*******34",
  tags: ["WhatsApp", "Yeni", "Atanmadı"]
};

export const GKU_MESSAGES = [
  { id: "1", dir: "in" as const, text: "Merhaba, UR-10001 kodlu ürünün fiyatı nedir?", time: "10:18" },
  { id: "2", dir: "out" as const, text: "Merhaba, birim fiyat ₺85,00 + KDV'dir.", time: "10:20", read: true },
  { id: "3", dir: "in" as const, text: "50 adet için iskonto uygulanır mı?", time: "10:22" }
];

export const GKU_CUSTOMER = {
  name: "Ahmet Yılmaz",
  email: "ahmet@abcinsaat.com",
  phone: "0532 123 45 67",
  city: "İstanbul",
  id: "CR-10245",
  registered: "12.01.2024",
  lastContact: "22.05.2025 10:24"
};

export const GKU_TAGS = ["Potansiyel Müşteri", "Fiyat Soruyor", "Teknik Destek"];

export const GKU_STATS = [
  { label: "Toplam Konuşma", value: "5" },
  { label: "Tamamlanan", value: "3" },
  { label: "Bekleyen", value: "1" },
  { label: "Ort. Yanıt", value: "2dk 15sn" },
  { label: "Memnuniyet", value: "4.5/5" }
];

