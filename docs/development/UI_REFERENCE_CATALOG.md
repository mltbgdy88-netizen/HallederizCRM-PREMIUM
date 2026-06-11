# Referans Görsel Kataloğu — Tüm sayfa ve katmanlar

**Amaç:** Kullanıcının göreceği her route/katman için bir PNG; toplu onay.  
**Klasör:** `docs/design/reference/`  
**Görsel dil:** `stok-operasyon-masasi-acik-mod.png` (PREMIUM CRM, zümrüt/altın/krem)

**Durum:** `VAR ✅` = onaylı (Sprint 1) | `TASLAK` = üretildi, toplu onay bekliyor

**Son üretim:** 2026-05-26 — `docs/design/reference/` altında **76/76** katalog dosyası mevcut (Sprint 1 dört onaylı + 72 taslak).

---

## Şablon özeti

| Şablon | Dosya sayısı | Açıklama |
|--------|--------------|----------|
| A | 22 | Liste operasyon masası |
| B | 14 | Entity detay (kök + modül detay) |
| C | 21 | Entity alt katman masası (sekme + readiness listesi) |
| D | 5 | Özel komut (dashboard, hızlı işlem, onaylar, AI) |
| E | 6 | Form |
| F | 2 | Hub |
| G | 5 | Sistem / state |
| H | 2 | Çok panel (WA var, gelen kutu) |
| **Toplam benzersiz PNG** | **~77** | Alias route aynı dosyayı paylaşır |

---

## A — Liste operasyon masası

| Dosya | Route(lar) | Durum |
|-------|------------|-------|
| `stok-operasyon-masasi-acik-mod.png` | `/stok` | VAR ✅ |
| `arsiv-operasyon-merkezi-acik-mod.png` | `/archive` | VAR ✅ |
| `rapor-operasyon-merkezi-acik-mod.png` | `/raporlar`, `/raporlar/*` | VAR ✅ |
| `whatsapp-operasyon-paneli-acik-mod.png` | `/whatsapp` | VAR ✅ |
| `teklifler-operasyon-masasi-acik-mod.png` | `/teklifler`, `/teklifler/liste` | TASLAK |
| `siparisler-operasyon-masasi-acik-mod.png` | `/siparisler`, `/siparisler/liste` | TASLAK |
| `cariler-operasyon-masasi-acik-mod.png` | `/cariler`, `/cariler/liste` | TASLAK |
| `tahsilatlar-operasyon-masasi-acik-mod.png` | `/tahsilatlar`, `/tahsilatlar/liste` | TASLAK |
| `teslimatlar-operasyon-masasi-acik-mod.png` | `/teslimatlar`, `/teslimatlar/liste` | TASLAK |
| `faturalar-operasyon-masasi-acik-mod.png` | `/faturalar`, `/faturalar/liste` | TASLAK |
| `iadeler-operasyon-masasi-acik-mod.png` | `/iadeler` | TASLAK |
| `depo-hazirlik-masasi-acik-mod.png` | `/depo` | TASLAK |
| `fabrikalar-stok-operasyon-masasi-acik-mod.png` | `/fabrikalar/stoklar` | TASLAK |
| `fabrikalar-siparis-operasyon-masasi-acik-mod.png` | `/fabrikalar/siparisler` | TASLAK |
| `teslimatlar-rota-operasyon-masasi-acik-mod.png` | `/teslimatlar/rota` | TASLAK |
| `belgeler-operasyon-masasi-acik-mod.png` | `/belgeler`, `/belgeler/liste`, `/belgeler/arsiv` | TASLAK |
| `gorevler-operasyon-masasi-acik-mod.png` | `/gorevler`, `/gorevler/*` (liste görünümleri) | TASLAK |
| `kullanicilar-operasyon-masasi-acik-mod.png` | `/kullanicilar` | TASLAK |
| `kullanicilar-roller-matris-acik-mod.png` | `/kullanicilar/roller` | TASLAK |
| `erp-entegrasyon-masasi-acik-mod.png` | `/erp` | TASLAK |
| `ayarlar-hub-acik-mod.png` | `/ayarlar`, `/ayarlar/*` | TASLAK |
| `onaylar-kurallar-matris-acik-mod.png` | `/onaylar/kurallar`, `/onaylar/limitler` | TASLAK |

---

## B — Entity detay masası

| Dosya | Route | Durum |
|-------|-------|-------|
| `cariler-detay-masasi-acik-mod.png` | `/cariler/[id]` | TASLAK |
| `siparisler-detay-masasi-acik-mod.png` | `/siparisler/[id]` | TASLAK |
| `teklifler-detay-masasi-acik-mod.png` | `/teklifler/[id]` | TASLAK |
| `tahsilatlar-detay-masasi-acik-mod.png` | `/tahsilatlar/[id]` | TASLAK |
| `teslimatlar-detay-masasi-acik-mod.png` | `/teslimatlar/[id]` | TASLAK |
| `faturalar-detay-masasi-acik-mod.png` | `/faturalar/[id]` | TASLAK |
| `iadeler-detay-masasi-acik-mod.png` | `/iadeler/[id]` | TASLAK |
| `belgeler-detay-masasi-acik-mod.png` | `/belgeler/[id]` | TASLAK |
| `gorevler-detay-masasi-acik-mod.png` | `/gorevler/[id]` | TASLAK |
| `onaylar-detay-karar-acik-mod.png` | `/onaylar/[id]` | TASLAK |
| `depo-fis-detay-masasi-acik-mod.png` | `/depo/emirler/[id]` | TASLAK |
| `fabrikalar-siparis-detay-acik-mod.png` | `/fabrikalar/siparisler/[id]` | TASLAK |
| `gelen-kutu-konusma-detay-acik-mod.png` | `/gelen-kutu/konusma/[id]` | TASLAK |
| `workflow-timeline-detay-acik-mod.png` | `/workflow/[type]/[id]` | TASLAK |

---

## C — Entity alt katman (sekme + katman masası)

### Cariler `[customerId]/*`

| Dosya | Route | Durum |
|-------|-------|-------|
| `cariler-katman-ozet-acik-mod.png` | `/cariler/[id]/ozet` | TASLAK |
| `cariler-katman-iletisim-acik-mod.png` | `/cariler/[id]/iletisim` | TASLAK |
| `cariler-katman-finans-acik-mod.png` | `/cariler/[id]/finans` | TASLAK |
| `cariler-katman-teklifler-acik-mod.png` | `/cariler/[id]/teklifler` | TASLAK |
| `cariler-katman-siparisler-acik-mod.png` | `/cariler/[id]/siparisler` | TASLAK |
| `cariler-katman-tahsilatlar-acik-mod.png` | `/cariler/[id]/tahsilatlar` | TASLAK |
| `cariler-katman-timeline-acik-mod.png` | `/cariler/[id]/timeline` | TASLAK |

### Siparişler `[orderId]/*`

| Dosya | Route | Durum |
|-------|-------|-------|
| `siparisler-katman-ozet-acik-mod.png` | `/siparisler/[id]/ozet` | TASLAK |
| `siparisler-katman-satirlar-acik-mod.png` | `/siparisler/[id]/satirlar` | TASLAK |
| `siparisler-katman-odeme-acik-mod.png` | `/siparisler/[id]/odeme-tahsilat` | TASLAK |
| `siparisler-katman-teslimat-acik-mod.png` | `/siparisler/[id]/teslimat` | TASLAK |
| `siparisler-katman-fatura-acik-mod.png` | `/siparisler/[id]/fatura` | TASLAK |
| `siparisler-katman-iade-acik-mod.png` | `/siparisler/[id]/iade` | TASLAK |
| `siparisler-katman-depo-stok-acik-mod.png` | `/siparisler/[id]/depo-stok-etkisi` | TASLAK |
| `siparisler-katman-timeline-acik-mod.png` | `/siparisler/[id]/timeline` | TASLAK |

### Teklifler `[offerId]/*`

| Dosya | Route | Durum |
|-------|-------|-------|
| `teklifler-katman-ozet-acik-mod.png` | `/teklifler/[id]/ozet` | TASLAK |
| `teklifler-katman-satirlar-acik-mod.png` | `/teklifler/[id]/satirlar` | TASLAK |
| `teklifler-katman-musteri-acik-mod.png` | `/teklifler/[id]/musteri` | TASLAK |
| `teklifler-katman-donusum-acik-mod.png` | `/teklifler/[id]/siparise-donusturme` | TASLAK |
| `teklifler-katman-belgeler-acik-mod.png` | `/teklifler/[id]/belgeler` | TASLAK |
| `teklifler-katman-timeline-acik-mod.png` | `/teklifler/[id]/timeline` | TASLAK |

---

## D — Özel komut masaları

| Dosya | Route | Durum |
|-------|-------|-------|
| `dashboard-operasyon-acik-mod.png` | `/dashboard` | TASLAK |
| `hizli-islem-satis-masasi-acik-mod.png` | `/hizli-islem` | TASLAK |
| `onaylar-komut-masasi-acik-mod.png` | `/onaylar`, `/onaylar/bekleyenler`, `/onaylar/inceleme`, `/onaylar/tamamlananlar` | TASLAK |
| `ai-operator-hub-acik-mod.png` | `/ai`, `/ai/onaylar` | TASLAK |
| `ai-icgoruler-acik-mod.png` | `/ai/icgoruler` | TASLAK |

---

## E — Form

| Dosya | Route | Durum |
|-------|-------|-------|
| `cariler-yeni-form-acik-mod.png` | `/cariler/yeni` | TASLAK |
| `tahsilatlar-yeni-form-acik-mod.png` | `/tahsilatlar/yeni` | TASLAK |
| `faturalar-yeni-form-acik-mod.png` | `/faturalar/yeni` | TASLAK |
| `iadeler-yeni-form-acik-mod.png` | `/iadeler/yeni` | TASLAK |
| `teslimatlar-yeni-form-acik-mod.png` | `/teslimatlar/yeni` | TASLAK |
| `belgeler-yeni-form-acik-mod.png` | `/belgeler/yeni` | TASLAK |

---

## F — Hub

| Dosya | Route | Durum |
|-------|-------|-------|
| `teklifler-yeni-hub-acik-mod.png` | `/teklifler/yeni` | TASLAK |
| `siparisler-yeni-hub-acik-mod.png` | `/siparisler/yeni` | TASLAK |

---

## G — Sistem / state

| Dosya | Route | Durum |
|-------|-------|-------|
| `login-split-acik-mod.png` | `/login` | TASLAK |
| `unauthorized-state-acik-mod.png` | `/unauthorized` | TASLAK |
| `offline-api-state-acik-mod.png` | `/offline-api` | TASLAK |
| `demo-mode-state-acik-mod.png` | `/demo-mode` | TASLAK |
| `live-empty-state-acik-mod.png` | `/live-empty` | TASLAK |

---

## H — Çok panelli

| Dosya | Route | Durum |
|-------|-------|-------|
| `gelen-kutu-uc-panel-acik-mod.png` | `/gelen-kutu` | TASLAK |

---

## Toplu onay (sizin için)

```text
ONAY: TÜMÜ
```

veya modül bazlı:

```text
ONAY: Sprint2-ticari, Sprint3-cariler-katman, ...
REVIZYON: depo-hazirlik — chip satırı ekle
```

Onay sonrası `UI_MASTER_DESIGN_BACKLOG.md` satırları güncellenir; ajan ekibi kod kuyruğuna alınır.
