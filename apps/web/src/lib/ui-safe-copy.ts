/** Kullanıcıya dönük güvenli boş/bekleyen durum metinleri (fake veri üretmez). */
export const UI_SAFE_COPY = {
  liveDataWaiting: "Canlı veri bekleniyor.",
  liveReportWaiting: "Canlı rapor verisi bekleniyor.",
  auditHistoryEmpty: "Bu kayıt için denetim geçmişi henüz oluşmadı.",
  fieldWhenLive: "Bu alan gerçek veri geldiğinde doldurulacak.",
  previewInsufficient: "Önizleme için yeterli veri yok.",
  exportWhenLive: "Dışa aktarma canlı rapor verisi hazır olduğunda açılacak."
} as const;
