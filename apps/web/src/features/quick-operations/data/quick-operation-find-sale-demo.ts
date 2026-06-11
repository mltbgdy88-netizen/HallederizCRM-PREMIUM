export type QuickOperationFoundSaleStatusTone = "green" | "blue" | "orange" | "purple" | "muted";

export type QuickOperationFoundSaleLine = {
  id: string;
  productCode: string;
  productName: string;
  quantity: number;
  unit: string;
  sourceLabel: string;
  warehouseName: string;
  rackCode: string;
  unitPrice: number;
  taxRate: number;
  status: string;
  statusTone: QuickOperationFoundSaleStatusTone;
};

export type QuickOperationFoundSale = {
  id: string;
  saleNo: string;
  customerName: string;
  customerCode: string;
  customerPhone: string;
  customerAddress: string;
  customerRepresentative: string;
  priceGroup: string;
  date: string;
  amount: string;
  deliveryStatus: string;
  paymentStatus: string;
  returnStatus: string;
  summary: string;
  statusTone: QuickOperationFoundSaleStatusTone;
  lines: QuickOperationFoundSaleLine[];
};

export const QUICK_OPERATION_FOUND_SALES: QuickOperationFoundSale[] = [
  {
    id: "sale_demo_0187",
    saleNo: "SIP-2025-0187",
    customerName: "ABC İnşaat A.Ş.",
    customerCode: "C-0025",
    customerPhone: "0 (212) 555 12 34",
    customerAddress: "Maslak Mah. Büyükdere Cad. No:255 · Sarıyer / İstanbul",
    customerRepresentative: "Ahmet Yılmaz",
    priceGroup: "Müşteri A",
    date: "06.05.2025",
    amount: "₺34.560,00",
    deliveryStatus: "Kısmi Teslim",
    paymentStatus: "Kısmi Tahsilat",
    returnStatus: "İade Yok",
    summary: "5 ürün · 52 toplam miktar",
    statusTone: "blue",
    lines: [
      {
        id: "sale_0187_1",
        productCode: "UR-10001",
        productName: "Rulman 6205 2RS",
        quantity: 24,
        unit: "Adet",
        sourceLabel: "Merkez Depo",
        warehouseName: "Merkez Depo",
        rackCode: "A-03",
        unitPrice: 85,
        taxRate: 20,
        status: "Hazır",
        statusTone: "green"
      },
      {
        id: "sale_0187_2",
        productCode: "UR-10002",
        productName: "V Kayışı SPA 1900",
        quantity: 12,
        unit: "Adet",
        sourceLabel: "Merkez Depo",
        warehouseName: "Merkez Depo",
        rackCode: "A-03",
        unitPrice: 123,
        taxRate: 20,
        status: "Hazır",
        statusTone: "green"
      },
      {
        id: "sale_0187_3",
        productCode: "UR-10003",
        productName: "Elektrik Motoru 7.5 kW",
        quantity: 5,
        unit: "Adet",
        sourceLabel: "Fabrika",
        warehouseName: "Fabrika",
        rackCode: "F3B-01",
        unitPrice: 8750,
        taxRate: 20,
        status: "Fabrika Bekliyor",
        statusTone: "orange"
      }
    ]
  },
  {
    id: "sale_demo_0172",
    saleNo: "SIP-2025-0172",
    customerName: "ABC İnşaat A.Ş.",
    customerCode: "C-0025",
    customerPhone: "0 (212) 555 12 34",
    customerAddress: "Maslak Mah. Büyükdere Cad. No:255 · Sarıyer / İstanbul",
    customerRepresentative: "Ahmet Yılmaz",
    priceGroup: "Müşteri A",
    date: "02.05.2025",
    amount: "₺18.240,00",
    deliveryStatus: "Tam Teslim",
    paymentStatus: "Ödendi",
    returnStatus: "İade Yok",
    summary: "3 ürün · teslim tamamlandı",
    statusTone: "green",
    lines: []
  },
  {
    id: "sale_demo_0156",
    saleNo: "SIP-2025-0156",
    customerName: "ABC İnşaat A.Ş.",
    customerCode: "C-0025",
    customerPhone: "0 (212) 555 12 34",
    customerAddress: "Maslak Mah. Büyükdere Cad. No:255 · Sarıyer / İstanbul",
    customerRepresentative: "Ahmet Yılmaz",
    priceGroup: "Müşteri A",
    date: "28.04.2025",
    amount: "₺27.135,00",
    deliveryStatus: "Kısmi Teslim",
    paymentStatus: "Kısmi Tahsilat",
    returnStatus: "İade Yok",
    summary: "4 ürün · sevk bekliyor",
    statusTone: "blue",
    lines: []
  },
  {
    id: "sale_demo_0138",
    saleNo: "SIP-2025-0138",
    customerName: "ABC İnşaat A.Ş.",
    customerCode: "C-0025",
    customerPhone: "0 (212) 555 12 34",
    customerAddress: "Maslak Mah. Büyükdere Cad. No:255 · Sarıyer / İstanbul",
    customerRepresentative: "Ahmet Yılmaz",
    priceGroup: "Müşteri A",
    date: "22.04.2025",
    amount: "₺12.875,00",
    deliveryStatus: "Fabrika Bekliyor",
    paymentStatus: "Açık",
    returnStatus: "İade Yok",
    summary: "2 ürün · fabrika karşılayacak",
    statusTone: "orange",
    lines: []
  },
  {
    id: "sale_demo_0121",
    saleNo: "SIP-2025-0121",
    customerName: "ABC İnşaat A.Ş.",
    customerCode: "C-0025",
    customerPhone: "0 (212) 555 12 34",
    customerAddress: "Maslak Mah. Büyükdere Cad. No:255 · Sarıyer / İstanbul",
    customerRepresentative: "Ahmet Yılmaz",
    priceGroup: "Müşteri A",
    date: "15.04.2025",
    amount: "₺43.900,00",
    deliveryStatus: "Tam Teslim",
    paymentStatus: "Ödendi",
    returnStatus: "İade Yok",
    summary: "8 ürün · kapanmış satış",
    statusTone: "green",
    lines: []
  }
];

export type FoundSaleSummary = {
  id: string;
  saleNo: string;
  customerName: string;
  date: string;
  amount: string;
  status: string;
};

export const FOUND_SALES: FoundSaleSummary[] = [
  {
    id: "sale-0187",
    saleNo: "SIP-2025-0187",
    customerName: "ABC İnşaat A.Ş.",
    date: "06.05.2025",
    amount: "₺34.560,00",
    status: "Kısmi Teslim · Kısmi Tahsilat"
  },
  {
    id: "sale-0172",
    saleNo: "SIP-2025-0172",
    customerName: "ABC İnşaat A.Ş.",
    date: "02.05.2025",
    amount: "₺18.240,00",
    status: "Ödendi · Tam Teslim"
  },
  {
    id: "sale-0156",
    saleNo: "SIP-2025-0156",
    customerName: "ABC İnşaat A.Ş.",
    date: "28.04.2025",
    amount: "₺27.135,00",
    status: "Kısmi Teslim · Kısmi Tahsilat"
  },
  {
    id: "sale-0138",
    saleNo: "SIP-2025-0138",
    customerName: "ABC İnşaat A.Ş.",
    date: "22.04.2025",
    amount: "₺12.875,00",
    status: "Fabrika Bekliyor"
  },
  {
    id: "sale-0121",
    saleNo: "SIP-2025-0121",
    customerName: "ABC İnşaat A.Ş.",
    date: "15.04.2025",
    amount: "₺43.900,00",
    status: "Ödendi · Tam Teslim"
  }
];
