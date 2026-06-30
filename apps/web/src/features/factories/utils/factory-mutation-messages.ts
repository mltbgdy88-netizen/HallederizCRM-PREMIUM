export const FACTORY_MUTATION_DEMO_MESSAGES = {
  testChannel: "Fabrika bağlantı testi demo modda simüle edildi.",
  syncStock: "Stok senkronu demo modda simüle edildi.",
  sendOrder: "Sipariş iletimi demo modda simüle edildi; onay zinciri gerektirir."
} as const;

export const FACTORY_MUTATION_ERROR_MESSAGES = {
  testChannelFailed: "Fabrika bağlantı testi başlatılamadı.",
  syncStockFailed: "Fabrika stok senkronu başlatılamadı.",
  sendOrderFailed: "Fabrika sipariş iletimi başlatılamadı."
} as const;
