# Referans Görsel Onay Takibi

**Süreç:** Tasarım Müdürü (AI) üretir → **Siz onaylarsınız** → Tasarım Uzmanı ajanı bire bir kodlar → Kontrol Şefi doğrular.

**Klasör:** `docs/design/reference/`  
**Katalog:** [`UI_REFERENCE_CATALOG.md`](UI_REFERENCE_CATALOG.md)  
**Ölçü:** 1920×1080, açık mod

## Özet (2026-05-26)

| Grup | Adet | Durum |
|------|------|--------|
| Sprint 1 (onaylı) | 4 | **ONAY** ✅ |
| Yeni üretim (taslak) | 72 | **TASLAK** — toplu inceleme |
| **Toplam katalog** | **76** | 0 eksik dosya |

## Onay durumları

| Durum | Anlam |
|-------|--------|
| `TASLAK` | Üretildi, inceleme bekliyor |
| `ONAY` | Kilitle — kodlamaya açık |
| `REVIZYON` | Geri bildirim var, yeniden üretilecek |
| `BEKLEMEDE` | Henüz üretilmedi |

---

## Sprint 1 — ONAY ✅ (kodlandı)

| Dosya | Route |
|-------|--------|
| `stok-operasyon-masasi-acik-mod.png` | `/stok` |
| `arsiv-operasyon-merkezi-acik-mod.png` | `/archive` |
| `rapor-operasyon-merkezi-acik-mod.png` | `/raporlar` |
| `whatsapp-operasyon-paneli-acik-mod.png` | `/whatsapp` |

---

## Toplu paket — TASLAK (72 dosya)

Aşağıdaki tüm dosyalar `docs/design/reference/` içinde mevcuttur. Detaylı route tablosu için kataloga bakın.

### Dalga 1 — Çekirdek liste (4)

| Dosya | Route | Şablon |
|-------|-------|--------|
| `teklifler-operasyon-masasi-acik-mod.png` | `/teklifler` | A |
| `siparisler-operasyon-masasi-acik-mod.png` | `/siparisler` | A |
| `cariler-operasyon-masasi-acik-mod.png` | `/cariler` | A |
| `tahsilatlar-operasyon-masasi-acik-mod.png` | `/tahsilatlar` | A |

### Dalga 2 — Ticari + operasyon listeleri (14)

`teslimatlar-operasyon-masasi`, `faturalar-operasyon-masasi`, `iadeler-operasyon-masasi`, `depo-hazirlik-masasi`, `fabrikalar-stok-operasyon-masasi`, `fabrikalar-siparis-operasyon-masasi`, `teslimatlar-rota-operasyon-masasi`, `belgeler-operasyon-masasi`, `gorevler-operasyon-masasi`, `kullanicilar-operasyon-masasi`, `kullanicilar-roller-matris`, `erp-entegrasyon-masasi`, `ayarlar-hub`, `onaylar-kurallar-matris`

### Dalga 3 — Entity detay B (14)

`cariler-detay-masasi`, `siparisler-detay-masasi`, `teklifler-detay-masasi`, `tahsilatlar-detay-masasi`, `teslimatlar-detay-masasi`, `faturalar-detay-masasi`, `iadeler-detay-masasi`, `belgeler-detay-masasi`, `gorevler-detay-masasi`, `onaylar-detay-karar`, `depo-fis-detay-masasi`, `fabrikalar-siparis-detay`, `gelen-kutu-konusma-detay`, `workflow-timeline-detay`

### Dalga 4 — Entity katman C (21)

**Cariler (7):** `cariler-katman-ozet`, `iletisim`, `finans`, `teklifler`, `siparisler`, `tahsilatlar`, `timeline`

**Siparişler (8):** `siparisler-katman-ozet`, `satirlar`, `odeme`, `teslimat`, `fatura`, `iade`, `depo-stok`, `timeline`

**Teklifler (6):** `teklifler-katman-ozet`, `satirlar`, `musteri`, `donusum`, `belgeler`, `timeline`

### Dalga 5 — Komut + AI + formlar + hub (13)

`dashboard-operasyon`, `hizli-islem-satis-masasi`, `onaylar-komut-masasi`, `ai-operator-hub`, `ai-icgoruler`, `cariler-yeni-form`, `tahsilatlar-yeni-form`, `faturalar-yeni-form`, `iadeler-yeni-form`, `teslimatlar-yeni-form`, `belgeler-yeni-form`, `teklifler-yeni-hub`, `siparisler-yeni-hub`

### Dalga 6 — Sistem + gelen kutu (6)

`login-split`, `unauthorized-state`, `offline-api-state`, `demo-mode-state`, `live-empty-state`, `gelen-kutu-uc-panel`

---

## Sizden beklenen onay formatı

**Hepsini kilitle:**

```text
ONAY: TÜMÜ
```

**Dalga bazlı:**

```text
ONAY: Dalga1-liste, Dalga2-ticari, Dalga3-detay, Dalga4-katman, Dalga5-komut, Dalga6-sistem
```

**Tek dosya / revizyon:**

```text
ONAY: teklifler-operasyon-masasi-acik-mod.png
REVIZYON: siparisler-katman-satirlar — AKSİYON kolonu genişlet
```

Onay sonrası `UI_MASTER_DESIGN_BACKLOG.md` satırında **Referans PNG** → ✅ ve kod görevi ajan kuyruğuna alınır.

## Görsel dili (tüm dalgalar)

Sprint 1 onaylı referanslarla **aynı**:

- Sol sidebar: koyu yeşil, altın logo, aktif menü altın çizgi
- Ana zemin: krem `#f8f1df` / `#fdfcf9`
- Birincil aksiyon: zümrüt `#047857`
- İkincil: altın çerçeve `#d4af37`
- Liste + sağ bağlam paneli 320–350px; **AKSİYON** kolonu; demo band
- Mor/lacivert SaaS paleti **yok**

Referans şablon: `stok-operasyon-masasi-acik-mod.png`
