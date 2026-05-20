const TIMELINE_SUMMARY_BY_ACTION: Record<string, { title: string; description: string }> = {
  "platform.orders.confirm": {
    title: "Sipariş onayı",
    description: "Sipariş onaya alındı."
  },
  "platform.orders.cancel": {
    title: "Sipariş iptali",
    description: "Sipariş iptal işlemi kaydedildi."
  },
  "platform.deliveries.complete": {
    title: "Teslimat tamamlama",
    description: "Teslimat tamamlama işlemi alındı."
  },
  "platform.invoices.issue": {
    title: "Fatura düzenleme",
    description: "Fatura düzenleme işlemi alındı."
  },
  "platform.returns.approve": {
    title: "İade onayı",
    description: "İade onaya alındı."
  },
  "platform.documents.regenerate": {
    title: "Belge yenileme",
    description: "Belge yenileme işlemi kuyruğa alındı."
  },
  "platform.documents.send_whatsapp": {
    title: "Belge iletimi",
    description: "Belge iletim işlemi kuyruğa alındı."
  },
  "platform.documents.send_email": {
    title: "Belge iletimi",
    description: "Belge e-posta iletimi kuyruğa alındı."
  },
  "platform.payments.confirm": {
    title: "Tahsilat doğrulama",
    description: "Tahsilat doğrulama işlemi alındı."
  },
  "platform.payments.reverse": {
    title: "Ters kayıt",
    description: "Tahsilat ters kayıt işlemi alındı."
  }
};

export function resolveMutationTimelineSummary(actionKey: string): { title: string; description: string } {
  return (
    TIMELINE_SUMMARY_BY_ACTION[actionKey] ?? {
      title: "İşlem kaydı",
      description: "Kritik işlem kaydı oluşturuldu."
    }
  );
}
