export const ERP_MUTATION_DEMO_MESSAGES = {
  test: "Bağlantı testi demo modda simüle edildi.",
  sync: "Senkron demo modda simüle edildi; canlı yazım onay zinciri gerektirir."
} as const;

export const ERP_MUTATION_ERROR_MESSAGES = {
  testFailed: "ERP bağlantı testi çalıştırılamadı.",
  syncFailed: "ERP senkron işlemi başlatılamadı."
} as const;
