import { listPolicyActions } from "@hallederiz/domain";

export type PolicyRegistryRow = ReturnType<typeof listPolicyActions>[number];

/** Operatör için kısa Türkçe ürün notu; kayıtta yoksa kayıt açıklaması kullanılır. */
const PRODUCT_NOTES: Partial<Record<string, string>> = {
  "platform.customers.create": "Yeni cari oluşturma finans ve KVK kapsamında onaylı akıştadır.",
  "platform.customers.update": "Cari güncellemeleri limit ve risk değişikliklerinde izlenebilir olmalıdır.",
  "platform.offers.create": "Teklif oluşturma fiyat taahhüdü doğurabileceği için onay kapsamındadır.",
  "platform.orders.create": "Sipariş kesinleştirme stok ve tahsilat zincirini tetikler; insan onayı zorunludur.",
  "platform.payments.create": "Tahsilat kaydı muhasebe ve denge için kritik; onay şarttır.",
  "platform.documents.generate": "Belge üretimi müşteriye gidecek çıktı doğurur; onay sonrası işlenir.",
  "platform.documents.send": "Belge veya mesaj gönderimi kanal politikası ve onay gerektirir.",
  "platform.whatsapp.action_request.confirm": "WhatsApp üzerinden operatör onayı talep kapanışı policy ile bağlanır.",
  "platform.omnichannel.reply": "Çok kanallı yanıtlar yüksek riskli outbound kabul edilir; onay gerekir.",
  "platform.ai.execute": "AI icra girişimleri üretimde kapalı/dry-run; gerçek icra için onay anahtarı tanımlıdır.",
  "platform.settings.update": "Tenant ayarları tüm modülleri etkiler; değişiklik onaylıdır.",
  "platform.users.create": "Yeni kullanıcı ve rol kapsamı güvenlik için onaylı mutasyondur."
};

export function getApprovalPolicyProductNote(entry: PolicyRegistryRow): string {
  return PRODUCT_NOTES[entry.actionKey] ?? entry.description;
}

export function mapPolicyEffectTr(effect: PolicyRegistryRow["defaultEffect"]): string {
  switch (effect) {
    case "allow":
      return "İzinli";
    case "deny":
      return "Red";
    case "require_approval":
      return "Onay gerekli";
    case "dry_run_only":
      return "Yalnızca dry-run";
    default:
      return String(effect);
  }
}

export function mapPolicyActionTypeTr(actionType: PolicyRegistryRow["actionType"]): string {
  switch (actionType) {
    case "read":
      return "Okuma";
    case "write":
      return "Yazma";
    case "execute":
      return "İcra";
    case "approve":
      return "Onay";
    case "reject":
      return "Ret";
    case "send_message":
      return "Mesaj";
    case "generate_document":
      return "Belge";
    case "ai_propose":
      return "AI öneri";
    case "ai_execute":
      return "AI icra";
    default:
      return String(actionType);
  }
}

export function mapPolicyCriticalityTr(c: PolicyRegistryRow["criticality"]): string {
  switch (c) {
    case "low":
      return "Düşük";
    case "medium":
      return "Orta";
    case "high":
      return "Yüksek";
    case "critical":
      return "Kritik";
    default:
      return String(c);
  }
}
