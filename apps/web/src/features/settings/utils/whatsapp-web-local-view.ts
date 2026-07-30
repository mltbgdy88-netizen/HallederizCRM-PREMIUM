import type { WhatsAppWebLocalConnectionState } from "@hallederiz/types";
import type { WhatsAppWebLocalControlSnapshot } from "../services/whatsapp-web-local-control";

export type WhatsAppWebLocalViewAction =
  | "status"
  | "start"
  | "refresh_pairing"
  | "disconnect"
  | "logout";

export type WhatsAppWebLocalActionAvailability = {
  visible: boolean;
  enabled: boolean;
};

export type WhatsAppWebLocalView = {
  badgeLabel: string;
  badgeTone: "ok" | "warn" | "neutral";
  dotTone: "ok" | "warn" | "error";
  statusText: string;
  description: string;
  qrPlaceholderText: string;
  actionHint: string;
  productionHardDeny: boolean;
  actions: Record<WhatsAppWebLocalViewAction, WhatsAppWebLocalActionAvailability>;
};

type StateViewDefinition = Omit<
  WhatsAppWebLocalView,
  "productionHardDeny" | "actions"
> & {
  allowedActions: readonly WhatsAppWebLocalViewAction[];
};

const ALL_ACTIONS: readonly WhatsAppWebLocalViewAction[] = [
  "status",
  "start",
  "refresh_pairing",
  "disconnect",
  "logout"
];

const DEFAULT_QR_PLACEHOLDER =
  "Bu foundation sürümünde scannable QR veya QR verisi üretilmez.";

const STATE_VIEWS: Readonly<Record<WhatsAppWebLocalConnectionState, StateViewDefinition>> = {
  disabled: {
    badgeLabel: "Devre dışı",
    badgeTone: "neutral",
    dotTone: "warn",
    statusText: "Yerel beta yapılandırması etkin değil",
    description:
      "Yerel kontrol özelliği güvenli varsayılan olarak kapalıdır. Mutation işlemleri kullanılamaz.",
    qrPlaceholderText: DEFAULT_QR_PLACEHOLDER,
    actionHint: "Yerel beta etkin olmadığı için mutation kontrolleri kapalıdır.",
    allowedActions: ["status"]
  },
  starting: {
    badgeLabel: "Başlatılıyor",
    badgeTone: "warn",
    dotTone: "warn",
    statusText: "Yerel eşleştirme temeli başlatılıyor",
    description:
      "Stub bağlantı durumu hazırlanıyor; gerçek WhatsApp Web sağlayıcısı veya QR motoru çalışmıyor.",
    qrPlaceholderText: DEFAULT_QR_PLACEHOLDER,
    actionHint:
      "Başlatma sürerken mutation kontrolleri kilitlidir; yalnız manuel durum kontrolü yapılabilir.",
    allowedActions: ["status"]
  },
  qr_ready: {
    badgeLabel: "Eşleştirme bekleniyor",
    badgeTone: "warn",
    dotTone: "warn",
    statusText: "Eşleştirme bekleniyor",
    description:
      "Gerçek QR sağlayıcısı henüz bağlı değil; bu foundation sürümü QR verisi sağlamaz.",
    qrPlaceholderText:
      "Gerçek QR sağlayıcısı henüz bağlı değil. Bu alan yalnız güvenli durum bilgisini gösterir.",
    actionHint:
      "Durumu kontrol edebilir, eşleştirme temelini manuel yenileyebilir veya yerel durumdan çıkabilirsiniz.",
    allowedActions: ["status", "refresh_pairing", "logout"]
  },
  connecting: {
    badgeLabel: "Bağlanıyor",
    badgeTone: "warn",
    dotTone: "warn",
    statusText: "Yerel bağlantı kuruluyor",
    description:
      "Stub bağlantı geçişi sürüyor; gerçek sağlayıcı veya canlı mesaj kanalı bulunmuyor.",
    qrPlaceholderText: DEFAULT_QR_PLACEHOLDER,
    actionHint:
      "Bağlantı geçişi sürerken mutation kontrolleri kilitlidir; yalnız manuel durum kontrolü yapılabilir.",
    allowedActions: ["status"]
  },
  connected: {
    badgeLabel: "Yerel bağlantı aktif",
    badgeTone: "ok",
    dotTone: "ok",
    statusText: "Yerel bağlantı aktif",
    description:
      "Bu yalnız yerel stub bağlantı durumudur; production onayı değildir ve mesaj gönderimi kapalıdır.",
    qrPlaceholderText:
      "Yerel durum bağlı görünüyor; bu foundation sürümünde QR veya canlı sağlayıcı bulunmaz.",
    actionHint:
      "Yerel bağlantı durumunu kesebilir veya yerel oturum durumundan çıkabilirsiniz.",
    allowedActions: ["status", "disconnect", "logout"]
  },
  reconnecting: {
    badgeLabel: "Yeniden bağlanıyor",
    badgeTone: "warn",
    dotTone: "warn",
    statusText: "Yerel bağlantı yeniden deneniyor",
    description:
      "Stub durum makinesi yeniden bağlantı aşamasındadır; bu durum production kullanılabilirliği göstermez.",
    qrPlaceholderText: DEFAULT_QR_PLACEHOLDER,
    actionHint:
      "Durumu manuel yenileyebilir veya yerel bağlantı durumunu kesebilirsiniz.",
    allowedActions: ["status", "disconnect"]
  },
  logged_out: {
    badgeLabel: "Bağlı değil",
    badgeTone: "neutral",
    dotTone: "warn",
    statusText: "Yerel beta bağlantısı başlatılmadı",
    description:
      "Yerel eşleştirme temeli kullanıcı tıklamasıyla başlatılabilir; otomatik bağlantı kurulmaz.",
    qrPlaceholderText: DEFAULT_QR_PLACEHOLDER,
    actionHint: "Yerel betayı başlatabilir veya mevcut durumu manuel kontrol edebilirsiniz.",
    allowedActions: ["status", "start"]
  },
  expired: {
    badgeLabel: "Oturum süresi doldu",
    badgeTone: "warn",
    dotTone: "warn",
    statusText: "Yerel oturum durumu artık geçerli değil",
    description:
      "Bu foundation sürümü session veya auth-state saklamaz. Yeniden başlatma yalnız manuel yapılır.",
    qrPlaceholderText: DEFAULT_QR_PLACEHOLDER,
    actionHint: "Yerel betayı yeniden başlatabilir veya yerel oturum durumundan çıkabilirsiniz.",
    allowedActions: ["status", "start", "logout"]
  },
  error: {
    badgeLabel: "Yerel bağlantı hatası",
    badgeTone: "warn",
    dotTone: "error",
    statusText: "Yerel bağlantı durumu güvenli biçimde tamamlanamadı",
    description:
      "Teknik ayrıntılar gösterilmez. Durumu kontrol edebilir, yeniden başlatabilir veya yerel durumdan çıkabilirsiniz.",
    qrPlaceholderText: DEFAULT_QR_PLACEHOLDER,
    actionHint: "Manuel durum kontrolü, yeniden başlatma veya çıkış kullanılabilir.",
    allowedActions: ["status", "start", "logout"]
  }
};

const PENDING_VIEW: WhatsAppWebLocalView = {
  badgeLabel: "Kontrol ediliyor",
  badgeTone: "neutral",
  dotTone: "warn",
  statusText: "Yerel beta durumu kontrol ediliyor",
  description:
    "Yalnız same-origin kontrol uçlarından güvenli durum bilgisi bekleniyor.",
  qrPlaceholderText: DEFAULT_QR_PLACEHOLDER,
  actionHint: "Durum kontrolü tamamlanana kadar mutation kontrolleri kilitlidir.",
  productionHardDeny: false,
  actions: createActionMap([])
};

function createActionMap(
  allowedActions: readonly WhatsAppWebLocalViewAction[]
): Record<WhatsAppWebLocalViewAction, WhatsAppWebLocalActionAvailability> {
  const allowed = new Set(allowedActions);
  return Object.fromEntries(
    ALL_ACTIONS.map((action) => [
      action,
      {
        visible: allowed.has(action),
        enabled: allowed.has(action)
      }
    ])
  ) as Record<WhatsAppWebLocalViewAction, WhatsAppWebLocalActionAvailability>;
}

export function resolveWhatsAppWebLocalView(
  snapshot: WhatsAppWebLocalControlSnapshot | null
): WhatsAppWebLocalView {
  if (!snapshot) {
    return PENDING_VIEW;
  }

  if (snapshot.reasonCode === "whatsapp_web_local_production_hard_deny") {
    return {
      badgeLabel: "Production'da kapalı",
      badgeTone: "neutral",
      dotTone: "warn",
      statusText: "Production ortamında yerel bağlantı kapalı",
      description:
        "Resmi production yolu Meta WhatsApp Cloud API'dir. Yerel mutation işlemleri hard-deny olarak kapalıdır.",
      qrPlaceholderText: DEFAULT_QR_PLACEHOLDER,
      actionHint:
        "Production ortamında hiçbir yerel mutation kontrolü kullanılamaz; yalnız durum tekrar kontrol edilebilir.",
      productionHardDeny: true,
      actions: createActionMap(["status"])
    };
  }

  const definition = STATE_VIEWS[snapshot.state];
  return {
    badgeLabel: definition.badgeLabel,
    badgeTone: definition.badgeTone,
    dotTone: definition.dotTone,
    statusText: definition.statusText,
    description: definition.description,
    qrPlaceholderText: definition.qrPlaceholderText,
    actionHint: definition.actionHint,
    productionHardDeny: false,
    actions: createActionMap(definition.allowedActions)
  };
}

export function formatWhatsAppWebLocalCheckedAt(checkedAt: string | undefined): string | null {
  if (!checkedAt) {
    return null;
  }
  const timestamp = Date.parse(checkedAt);
  if (!Number.isFinite(timestamp)) {
    return null;
  }
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(timestamp));
}
