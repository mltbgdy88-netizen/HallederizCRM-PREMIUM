# QA Visual Report — siparisler W3 batch (final re-QA)

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Kapsam:** `#19–27` (iade `#22` atlandı — önceki PASS)  
**Build:** `pnpm stop-dev` → `pnpm build` — **PASS** (85 route)

---

## Özet karar tablosu

| # | Slug | Route | Karar | Ana gerekçe |
|---|------|-------|-------|-------------|
| 19 | siparisler-detay-masasi | /siparisler/detay | **FAIL** | Tablo 4 satır OK; alt bilgi “Toplam 4 satır” — PNG “Toplam 8 satır” |
| 20 | siparisler-katman-depo-stok | /siparisler/katman/depo-stok | **PASS** | 7 satır; UR-10004 Hava Filtresi eksik 20 |
| 21 | siparisler-katman-fatura | /siparisler/katman/fatura | **PASS** | INV tutar/tarih/e-Fatura PNG ile hizalı |
| 22 | siparisler-katman-iade | /siparisler/katman/iade | *(atlandı)* | Önceki PASS — Director `done` |
| 23 | siparisler-katman-odeme | /siparisler/katman/odeme | **PASS** | RCPT-2025-000156/187/221 |
| 24 | siparisler-katman-ozet | /siparisler/katman/ozet | **PASS** | XYZ Üretim Hattı · SP-24031 KPI |
| 25 | siparisler-katman-satirlar | /siparisler/katman/satirlar | **PASS** | SIP-2025-000246 · 6 satır · alt toplamlar |
| 26 | siparisler-katman-teslimat | /siparisler/katman/teslimat | **PASS** | 6 TES-* kaydı |
| 27 | siparisler-katman-timeline | /siparisler/katman/timeline | **PASS** | SO-2025-00568 · Zeynep Demir · 30.05 teslim |

**Özet:** 7 PASS · 1 FAIL (8 ekran QA’landı)

---

## Ortak ön kontroller

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| PNG dosyaları okundu | PASS | `docs/design/reference/02-siparisler/**` |
| `pnpm build` | PASS | 2026-05-27 |
| Body scroll yok | PASS | `siparisler-*-reference.css` |
| Route erişilebilir | PASS | Build çıktısı |

---

## #19 — siparisler-detay-masasi (FAIL)

**PNG:** `02-siparisler/detay/siparisler-detay-masasi-acik-mod.png`

| Alan | PNG | Mock / UI | Sonuç |
|------|-----|-----------|-------|
| Tarih / kaynak | 24.05.2025 · Web Sitesi | `SDM_INFO_LEFT` | PASS |
| Cari kodu | C-1024 | C-1024 | PASS |
| Görünür satırlar | 4 kalem | `SDM_LINES` (4) | PASS |
| Onay saatleri | 14:35 / 14:37 / 14:40 | `SDM_APPROVAL` | PASS |
| İç not | proje kapsamında düzenli alım | `SDM_NOTES.sample` | PASS |
| Teslimat özeti | 2 / 8 satır | `SDM_DELIVERY.progress` | PASS |
| **Pagination metni** | **Toplam 8 satır** | **`Toplam {SDM_LINES.length} satır` → 4** | **FAIL** |

### Fark listesi

1. Finans KPI şeridi (₺89.350 … ₺49.471,50) PNG ile eşleşiyor.
2. Sol bilgi alanı tarih, kaynak, C-1024 hizalı.
3. Satır tablosu 4 ürün PNG görünür satırlarıyla eşleşiyor.
4. Onay süreci zaman damgaları hizalı.
5. Alt bilgi “Toplam 4 satır” — PNG pagination “Toplam 8 satır” (REVIZE eksik).

**Karar:** **FAIL** → `SDM_LINES_TOTAL = 8` veya footer sabiti PNG.

---

## #20–27 — Katman ekranları (özet)

- **Depo:** 7. satır Hava Filtresi `missing: 20` — PASS.
- **Fatura:** INV-178/215/246 tutar ve e-Fatura etiketleri — PASS.
- **Ödeme:** SO-2025-000124 · RCPT-156/187/221 — PASS.
- **Özet:** XYZ Üretim Hattı · finans KPI — PASS.
- **Satırlar:** SIP-2025-000246 · Genel Toplam ₺37.275,60 — PASS.
- **Teslimat:** 6 kayıt TES-* — PASS.
- **Timeline:** Zeynep Demir · teslim 30.05.2025 · 7 ürün — PASS.

**Auditor imzası:** PNG’ler okundu; post-REVIZE 7/8 PASS.
