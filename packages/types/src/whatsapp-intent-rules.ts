/** WhatsApp + AI kural matrisi — Evet / Hayır / Koşullu (ürün varsayılanı). */

import type { WhatsAppIntent } from "./commercial-operations";

export type RuleDecision = "yes" | "no" | "conditional";

export interface RuleDecisionSetting {
  value: RuleDecision;
  /** Koşullu seçildiğinde UI ve operatör için açıklama */
  note?: string;
}

/** `WhatsAppIntent` ile aynı anahtarlar (sipariş, ödeme vb.). */
export type WhatsAppIntentRuleId = WhatsAppIntent;

export interface WhatsAppIntentRule {
  intentId: WhatsAppIntentRuleId;
  /** Kart başlığı */
  intentLabel: string;
  /** Kısa risk / süreç etiketi */
  riskTag: string;
  registeredPhone: RuleDecisionSetting;
  linkedCustomer: RuleDecisionSetting;
  autoReply: RuleDecisionSetting;
  customerConfirmation: RuleDecisionSetting;
  internalApproval: RuleDecisionSetting;
  salesApproval: RuleDecisionSetting;
  accountingApproval: RuleDecisionSetting;
  crmApproval: RuleDecisionSetting;
  templateText: string;
}

export interface WhatsAppIntentRulesConfig {
  intents: WhatsAppIntentRule[];
}

export function createDefaultWhatsappIntentRules(): WhatsAppIntentRule[] {
  return [
    {
      intentId: "stok",
      intentLabel: "Stok",
      riskTag: "Düşük / Koşullu",
      registeredPhone: { value: "yes" },
      linkedCustomer: {
        value: "conditional",
        note: "Müşteri bazlı stok için gerekli; genel bilgi için gerekli değil."
      },
      autoReply: {
        value: "conditional",
        note: "Sadece “kontrol ediyoruz” ve SLA bilgisi otomatik dönebilir; miktar taahhüdü otomatik verilmez."
      },
      customerConfirmation: {
        value: "conditional",
        note: "Rezerve veya teyit gereken durumda gerekli."
      },
      internalApproval: {
        value: "conditional",
        note: "Kritik eşik veya negatif stokta gerekli."
      },
      salesApproval: {
        value: "conditional",
        note: "Alternatif ürün önerisi satış alanındaysa gerekli."
      },
      accountingApproval: { value: "no" },
      crmApproval: {
        value: "conditional",
        note: "Depo kuralı ihlali varsa gerekli."
      },
      templateText:
        "Merhaba {cari}, {ürün} için stok durumunu kontrol ediyoruz. En geç {saat} içinde net bilgi paylaşacağız."
    },
    {
      intentId: "fiyat",
      intentLabel: "Fiyat",
      riskTag: "Satış onayı",
      registeredPhone: { value: "yes" },
      linkedCustomer: { value: "yes" },
      autoReply: { value: "no" },
      customerConfirmation: {
        value: "conditional",
        note: "Fiyat teklifi bağlayıcı hale gelecekse gerekli."
      },
      internalApproval: {
        value: "conditional",
        note: "Liste dışı iskonto varsa gerekli."
      },
      salesApproval: { value: "yes" },
      accountingApproval: { value: "no" },
      crmApproval: {
        value: "conditional",
        note: "Alt limit altı fiyat varsa gerekli."
      },
      templateText:
        "Fiyat bilgisini hazırlıyoruz. Geçerli fiyat grubunuz: {grup}. Net fiyat için satış ekibimiz onaylayacak."
    },
    {
      intentId: "ekstre",
      intentLabel: "Ekstre",
      riskTag: "Muhasebe onayı",
      registeredPhone: { value: "yes" },
      linkedCustomer: { value: "yes" },
      autoReply: { value: "no" },
      customerConfirmation: { value: "no" },
      internalApproval: { value: "no" },
      salesApproval: { value: "no" },
      accountingApproval: { value: "yes" },
      crmApproval: {
        value: "conditional",
        note: "Yüksek risk veya şüpheli bakiyede gerekli."
      },
      templateText:
        "Ekstre talebinizi aldık. {cari} cari hesabınız için güncel ekstre hazırlanıyor; muhasebe onayı sonrası iletilecek."
    },
    {
      intentId: "siparis",
      intentLabel: "Sipariş",
      riskTag: "Satış onayı",
      registeredPhone: { value: "yes" },
      linkedCustomer: { value: "yes" },
      autoReply: {
        value: "conditional",
        note: "Yalnızca “talep alındı” otomatik dönebilir; sipariş no üretimi otomatik yapılmaz."
      },
      customerConfirmation: {
        value: "conditional",
        note: "Kapalı/onaylı siparişte gerekmeyebilir; açık uçlu talepte gerekir."
      },
      internalApproval: {
        value: "conditional",
        note: "Kredi limiti aşımı, risk, stok istisnası gibi durumlarda gerekli."
      },
      salesApproval: { value: "yes" },
      accountingApproval: { value: "no" },
      crmApproval: {
        value: "conditional",
        note: "İstisna politikasında gerekli."
      },
      templateText: "Sipariş talebinizi aldık. Satış ekibimiz {ürünler} için onay ve termin bilgisini paylaşacak."
    },
    {
      intentId: "odeme",
      intentLabel: "Ödeme / Tahsilat",
      riskTag: "Muhasebe onayı",
      registeredPhone: { value: "yes" },
      linkedCustomer: { value: "yes" },
      autoReply: { value: "no" },
      customerConfirmation: {
        value: "conditional",
        note: "Ödeme linki veya tutar teyidi gerekiyorsa gerekli."
      },
      internalApproval: { value: "no" },
      salesApproval: { value: "no" },
      accountingApproval: { value: "yes" },
      crmApproval: {
        value: "conditional",
        note: "Yüksek tutar veya şüpheli kanalda gerekli."
      },
      templateText:
        "Ödeme/tahsilat talebinizi aldık. Tutar ve yöntem muhasebe doğrulamasından sonra size döneceğiz."
    },
    {
      intentId: "iade",
      intentLabel: "İade",
      riskTag: "Çoklu onay",
      registeredPhone: { value: "yes" },
      linkedCustomer: { value: "yes" },
      autoReply: { value: "no" },
      customerConfirmation: { value: "yes" },
      internalApproval: { value: "yes" },
      salesApproval: {
        value: "conditional",
        note: "Satış koşulları iadeye bağlıysa gerekli."
      },
      accountingApproval: { value: "yes" },
      crmApproval: {
        value: "conditional",
        note: "Tutar eşiği üzerindeyse gerekli."
      },
      templateText:
        "İade talebinizi kaydettik. Ürün/kutu ve fatura bilgisiyle muhasebe incelemesi sonrası süreç bilgisi paylaşılacak."
    },
    {
      intentId: "fatura",
      intentLabel: "Fatura",
      riskTag: "Muhasebe onayı",
      registeredPhone: { value: "yes" },
      linkedCustomer: { value: "yes" },
      autoReply: { value: "no" },
      customerConfirmation: { value: "no" },
      internalApproval: { value: "no" },
      salesApproval: { value: "no" },
      accountingApproval: { value: "yes" },
      crmApproval: {
        value: "conditional",
        note: "Düzeltme veya iptal talebinde gerekli."
      },
      templateText: "Fatura talebinizi aldık. {belge_no} için muhasebe tarafından PDF/efatura çıktısı hazırlanacak."
    },
    {
      intentId: "hatali_urun",
      intentLabel: "Hatalı ürün",
      riskTag: "İnceleme gerekli",
      registeredPhone: { value: "yes" },
      linkedCustomer: { value: "yes" },
      autoReply: { value: "no" },
      customerConfirmation: { value: "yes" },
      internalApproval: { value: "yes" },
      salesApproval: { value: "conditional" },
      accountingApproval: { value: "conditional" },
      crmApproval: { value: "conditional" },
      templateText:
        "Kaydınızı aldık. Lot/seri ve fotoğraf rica ediyoruz. İade/değişim için satış+muhasebe süreci başlatılacak."
    },
    {
      intentId: "diger",
      intentLabel: "Diğer",
      riskTag: "Yönlendirme",
      registeredPhone: { value: "conditional" },
      linkedCustomer: { value: "conditional" },
      autoReply: { value: "no" },
      customerConfirmation: { value: "conditional" },
      internalApproval: { value: "conditional" },
      salesApproval: { value: "conditional" },
      accountingApproval: { value: "conditional" },
      crmApproval: { value: "conditional" },
      templateText:
        "Talebinizi aldık. Konuyu netleştirmek için kısa bir özet (sipariş no / ürün kodu) paylaşır mısınız? Uygun ekibe yönlendiriyoruz."
    }
  ];
}

/** Boolean bekleyen eski resolver / pipeline için alan anahtarı. */
export type RuleRuntimeBooleanField =
  | "registeredPhone"
  | "linkedCustomer"
  | "autoReply"
  | "customerConfirmation"
  | "internalApproval"
  | "salesApproval"
  | "accountingApproval"
  | "crmApproval";

/**
 * Koşullu: otomatik cevap dışında güvenli tarafta true; `autoReply` için conditional → false
 * (otomatik taahhüt verme).
 */
export function ruleDecisionSettingToBoolean(
  setting: RuleDecisionSetting,
  field: RuleRuntimeBooleanField
): boolean {
  const v = setting.value;
  if (v === "yes") return true;
  if (v === "no") return false;
  if (field === "autoReply") return false;
  return true;
}

export function runtimeBooleansFromIntentRule(rule: WhatsAppIntentRule): Record<RuleRuntimeBooleanField, boolean> {
  return {
    registeredPhone: ruleDecisionSettingToBoolean(rule.registeredPhone, "registeredPhone"),
    linkedCustomer: ruleDecisionSettingToBoolean(rule.linkedCustomer, "linkedCustomer"),
    autoReply: ruleDecisionSettingToBoolean(rule.autoReply, "autoReply"),
    customerConfirmation: ruleDecisionSettingToBoolean(rule.customerConfirmation, "customerConfirmation"),
    internalApproval: ruleDecisionSettingToBoolean(rule.internalApproval, "internalApproval"),
    salesApproval: ruleDecisionSettingToBoolean(rule.salesApproval, "salesApproval"),
    accountingApproval: ruleDecisionSettingToBoolean(rule.accountingApproval, "accountingApproval"),
    crmApproval: ruleDecisionSettingToBoolean(rule.crmApproval, "crmApproval")
  };
}

export function findIntentRule(config: WhatsAppIntentRulesConfig, intentId: WhatsAppIntentRuleId): WhatsAppIntentRule | undefined {
  return config.intents.find((row) => row.intentId === intentId);
}
