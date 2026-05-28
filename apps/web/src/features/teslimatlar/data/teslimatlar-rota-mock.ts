// @ts-nocheck
export const TSRM_TITLE = "Teslimat Rota Masası";
export const TSRM_SUBTITLE = "Teslimat rotalarını planlayın, izleyin ve yönetin.";

export const TSRM_KPIS = [
  { id: "routes", label: "Toplam Rota", value: "12" },
  { id: "planned", label: "Planlanan Teslimat", value: "68" },
  { id: "done", label: "Tamamlanan", value: "32 (%47)" },
  { id: "onway", label: "Yolda", value: "18" },
  { id: "waiting", label: "Bekleyen", value: "18" },
  { id: "distance", label: "Toplam Mesafe", value: "186,4 km" },
  { id: "eta", label: "Tahmini Süre", value: "5s 45dk" }
] as const;

export const TSRM_DRIVERS = [
  { id: "1", name: "Yusuf Kaya", plate: "34 ABC 123", status: "Yolda", stops: "6 Durak" },
  { id: "2", name: "Mehmet K.", plate: "06 DEF 456", status: "Planlandı", stops: "8 Durak" },
  { id: "3", name: "Ahmet H.", plate: "35 GHI 789", status: "Yolda", stops: "7 Durak" },
  { id: "4", name: "Serkan B.", plate: "16 JKL 012", status: "Beklemede", stops: "5 Durak" }
] as const;

export type TsrmRouteStatus = "Yolda" | "Planlandı" | "Beklemede";

export const TSRM_TABLE_ROWS = [
  {
    id: "1",
    routeNo: "RT-00012",
    driver: "Yusuf Kaya",
    status: "Yolda" as TsrmRouteStatus,
    stops: "6",
    distance: "48,6 km",
    eta: "1s 35dk",
    window: "08:15 – 11:05"
  },
  {
    id: "2",
    routeNo: "RT-00011",
    driver: "Mehmet K.",
    status: "Planlandı" as TsrmRouteStatus,
    stops: "8",
    distance: "51,2 km",
    eta: "2s 10dk",
    window: "09:00 – 12:30"
  },
  {
    id: "3",
    routeNo: "RT-00010",
    driver: "Ahmet H.",
    status: "Yolda" as TsrmRouteStatus,
    stops: "7",
    distance: "38,6 km",
    eta: "1s 48dk",
    window: "08:30 – 11:45"
  }
] as const;

export const TSRM_TABLE_TOTAL = "Toplam 12 rota";
export const TSRM_PAGE_NUMBERS = ["1", "2"] as const;

export const TSRM_CONTEXT = {
  routeNo: "RT-00012",
  status: "Yolda" as TsrmRouteStatus,
  driver: "Yusuf Kaya",
  plate: "34 ABC 123",
  start: "08:15",
  end: "11:05",
  stops: "6",
  distance: "48,6 km",
  eta: "1s 35dk"
} as const;

export const TSRM_STOPS = [
  { id: "1", name: "ABC Market", address: "Ataşehir / İstanbul", time: "08:30", state: "done" as const },
  { id: "2", name: "Yılmaz Gıda", address: "Kadıköy / İstanbul", time: "08:50", state: "done" as const },
  { id: "3", name: "Derya Büfe", address: "Üsküdar / İstanbul", time: "09:15", state: "done" as const },
  { id: "4", name: "Özkan Manav", address: "Maltepe / İstanbul", time: "09:40", state: "current" as const },
  { id: "5", name: "Sevil Market", address: "Kartal / İstanbul", time: "10:10", state: "pending" as const },
  { id: "6", name: "Final Market", address: "Pendik / İstanbul", time: "10:35", state: "pending" as const }
] as const;
