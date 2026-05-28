// @ts-nocheck
import { REFERENCE_ROUTE_IDS } from "@/lib/reference/reference-route-ids";

export type FsoKpiTone = "green" | "gold" | "teal" | "blue" | "orange" | "slate";



export type FsoKpi = { id: string; label: string; value: string; tone: FsoKpiTone };



export type FsoStatus =

  | "Yeni"

  | "Onaylandı"

  | "Üretimde"

  | "Kalite Kontrol"

  | "Sevkiyata Hazır"

  | "Sevk Edildi"

  | "Sorunlu"

  | "İptal";



export type FsoTableRow = {

  id: string;

  factoryOrderId: string;

  salesOrderId?: string;

  orderNo: string;

  factory: string;

  salesRef: string;

  status: FsoStatus;

  created: string;

  delivery: string;

  amount: string;

};



export type FsoSyncPath = { id: string; label: string; status: "Başarılı" };



export type FsoContext = {

  lastSync: string;

  syncStatus: string;

  paths: FsoSyncPath[];

  summary: { label: string; value: string }[];

};



export const FSO_TITLE = "Fabrika Sipariş Operasyon Masası";

export const FSO_SUBTITLE =

  "Merkez, fabrika ve satış arasındaki sipariş akışını yönetin ve takip edin.";



export const FSO_KPIS: FsoKpi[] = [

  { id: "total", label: "Toplam Sipariş", value: "1.245", tone: "green" },

  { id: "production", label: "Üretimde", value: "128", tone: "orange" },

  { id: "done", label: "Tamamlandı", value: "892", tone: "teal" },

  { id: "ship", label: "Sevkiyat Bekliyor", value: "76", tone: "blue" },

  { id: "issue", label: "Sorunlu", value: "24", tone: "gold" },

  { id: "amount", label: "Toplam Tutar", value: "₺28.450.000", tone: "slate" }

];



export const FSO_FILTER_SEARCH = "Sipariş no...";



export const FSO_FILTERS = [

  { id: "factory", label: "Fabrika", options: [{ label: "Tümü", value: "all" }] },

  { id: "status", label: "Durum", options: [{ label: "Tümü", value: "all" }] },

  { id: "sales", label: "Satış Durumu", options: [{ label: "Tümü", value: "all" }] },

  { id: "date", label: "Tarih Aralığı", options: [{ label: "Seçiniz", value: "pick" }] }

];



export const FSO_STATUS_CHIPS = [

  "Tüm Durumlar",

  "Yeni",

  "Onaylandı",

  "Üretimde",

  "Kalite Kontrol",

  "Sevkiyata Hazır",

  "Sevk Edildi",

  "İptal Edildi"

] as const;



export const FSO_TABLE_ROWS: FsoTableRow[] = [

  {

    id: "1",

    factoryOrderId: REFERENCE_ROUTE_IDS.factoryOrderId,

    salesOrderId: REFERENCE_ROUTE_IDS.orderId,

    orderNo: "FO-2025-00124",

    factory: "Merkez Fabrika",

    salesRef: "SS-2025-00078",

    status: "Onaylandı",

    created: "24.05.2025 14:20",

    delivery: "27.05.2025",

    amount: "₺3.993.750,00"

  },

  {

    id: "2",

    factoryOrderId: "factory_order_2",

    orderNo: "FO-2025-00123",

    factory: "Ankara Fabrika",

    salesRef: "SAT-2025-5318",

    status: "Sevkiyata Hazır",

    created: "19.05.2025 09:15",

    delivery: "28.05.2025",

    amount: "₺312.450,00"

  },

  {

    id: "3",

    orderNo: "FO-2025-00122",

    factory: "İzmir Fabrika",

    salesRef: "SAT-2025-5310",

    status: "Onaylandı",

    created: "18.05.2025 14:20",

    delivery: "30.05.2025",

    amount: "₺198.200,00"

  },

  {

    id: "4",

    factoryOrderId: "factory_order_4",

    salesOrderId: "order_4",

    orderNo: "FO-2025-00121",

    factory: "Merkez Fabrika",

    salesRef: "SAT-2025-5308",

    status: "Kalite Kontrol",

    created: "18.05.2025 11:05",

    delivery: "27.05.2025",

    amount: "₺567.900,00"

  },

  {

    id: "5",

    factoryOrderId: "factory_order_5",

    orderNo: "FO-2025-00120",

    factory: "Bursa Fabrika",

    salesRef: "SAT-2025-5298",

    status: "Sevk Edildi",

    created: "17.05.2025 08:40",

    delivery: "25.05.2025",

    amount: "₺89.750,00"

  },

  {

    id: "6",

    orderNo: "FO-2025-00119",

    factory: "Ankara Fabrika",

    salesRef: "SAT-2025-5290",

    status: "Yeni",

    created: "17.05.2025 16:22",

    delivery: "—",

    amount: "₺156.300,00"

  },

  {

    id: "7",

    factoryOrderId: "factory_order_7",

    salesOrderId: "order_7",

    orderNo: "FO-2025-00118",

    factory: "Merkez Fabrika",

    salesRef: "SAT-2025-5285",

    status: "Üretimde",

    created: "16.05.2025 13:18",

    delivery: "29.05.2025",

    amount: "₺742.100,00"

  },

  {

    id: "8",

    factoryOrderId: "factory_order_8",

    orderNo: "FO-2025-00117",

    factory: "İstanbul Fabrika",

    salesRef: "SAT-2025-5305",

    status: "Sorunlu",

    created: "16.05.2025 10:05",

    delivery: "26.05.2025",

    amount: "₺425.600,00"

  },

  {

    id: "9",

    factoryOrderId: "factory_order_9",

    orderNo: "FO-2025-00116",

    factory: "İzmir Fabrika",

    salesRef: "SAT-2025-5278",

    status: "Onaylandı",

    created: "15.05.2025 15:30",

    delivery: "31.05.2025",

    amount: "₺278.400,00"

  },

  {

    id: "10",

    factoryOrderId: "factory_order_10",

    orderNo: "FO-2025-00115",

    factory: "Bursa Fabrika",

    salesRef: "SAT-2025-5270",

    status: "Kalite Kontrol",

    created: "15.05.2025 09:45",

    delivery: "24.05.2025",

    amount: "₺134.250,00"

  }

];



export const FSO_TABLE_TOTAL = "Toplam 1.245 kayıt";

export const FSO_PAGE_NUMBERS = ["1", "2", "3", "…", "125"];



export function getFsoContext(): FsoContext {

  return {

    lastSync: "20.05.2025 15:30:45",

    syncStatus: "Başarılı",

    paths: [

      { id: "1", label: "Merkez → Fabrika", status: "Başarılı" },

      { id: "2", label: "Fabrika → Merkez", status: "Başarılı" },

      { id: "3", label: "Satış → Fabrika", status: "Başarılı" },

      { id: "4", label: "Fabrika → Satış", status: "Başarılı" }

    ],

    summary: [

      { label: "Bekleyen Sipariş", value: "12" },

      { label: "Hatalı Kayıt", value: "2" },

      { label: "Aktarılan Sipariş", value: "1.231" },

      { label: "Güncellenen Sipariş", value: "856" },

      { label: "Başarısız İşlem", value: "0" }

    ]

  };

}



export function fsoStatusClass(status: FsoStatus): string {

  const map: Record<FsoStatus, string> = {

    Yeni: " fso-badge--gray",

    Onaylandı: " fso-badge--green",

    Üretimde: " fso-badge--orange",

    "Kalite Kontrol": " fso-badge--blue",

    "Sevkiyata Hazır": " fso-badge--teal",

    "Sevk Edildi": " fso-badge--purple",

    Sorunlu: " fso-badge--red",

    İptal: " fso-badge--gray"

  };

  return map[status];

}

