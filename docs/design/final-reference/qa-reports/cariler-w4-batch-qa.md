# QA Visual Report — cariler W4 batch (final re-QA)

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Kapsam:** `#30–37` (detay + 7 katman)  
**Build:** `pnpm stop-dev` → `pnpm build` — **PASS** (85 route)

---

## Özet karar tablosu

| # | Slug | Route | Karar | Ana gerekçe |
|---|------|-------|-------|-------------|
| 30 | cariler-detay-masasi | /cariler/detay | **PASS** | Performans KPI + sonraki adım tarihleri PNG |
| 31 | cariler-katman-ozet | /cariler/katman/ozet | **PASS** | Son Tahsilat 16.05.2025 · FAT-* tablo |
| 32 | cariler-katman-iletisim | /cariler/katman/iletisim | **PASS** | ABC A.Ş. header · 4 kişi |
| 33 | cariler-katman-finans | /cariler/katman/finans | **PASS** | Yıldız Grup · emerald `ckm-home--finans-emerald` |
| 34 | cariler-katman-teklifler | /cariler/katman/teklifler | **PASS** | Katman C Ltd header |
| 35 | cariler-katman-siparisler | /cariler/katman/siparisler | **PASS** | AKSİYON DIŞ TİCARET header |
| 36 | cariler-katman-tahsilatlar | /cariler/katman/tahsilatlar | **PASS** | THS-* · Örnek Sanayi |
| 37 | cariler-katman-timeline | /cariler/katman/timeline | **PASS** | ABC Teknoloji · 6 olay |

**Özet:** 8 PASS · 0 FAIL

---

## Ortak ön kontroller

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| PNG okundu | PASS | `03-cariler/**` (8 dosya) |
| `pnpm build` | PASS | |
| Body scroll yok | PASS | `cariler-*-reference.css` |
| Route | PASS | `/cariler/detay`, `/cariler/katman/*` |

---

## #30 — cariler-detay-masasi (PASS)

**PNG:** `03-cariler/detay/cariler-detay-masasi-acik-mod.png`

| Alan | PNG | Mock | Sonuç |
|------|-----|------|-------|
| Toplam Ciro | ₺1.245.680,00 | `CDM_PERFORMANCE` | PASS |
| Toplam Tahsilat | ₺1.102.350,00 | Aynı | PASS |
| Toplam Sipariş | 42 | Aynı | PASS |
| Açık Sipariş | ₺143.330,00 | Aynı | PASS |
| Son not | Fiyat güncellemesi talep edildi | `CDM_CONTEXT` | PASS |
| Sonraki adım 1 | 25.05.2025 | `CDM_NEXT_STEPS` | PASS |

### Fark listesi

1. Kabuk Cariler aktif — PASS.
2. Başlık UR-10001 Rulman 6205 2RS — PASS (referans bilinçli).
3. Performans KPI sayıları bire bir — PASS.
4. Risk kullanım %57,33 — PASS.
5. Gözle görülür layout/metin farkı yok.

---

## #31–37 — Katman ekranları

- **Özet:** ABC Duvar Kağıdı · Son Tahsilat 16.05.2025 · 5 FAT kaydı — PASS.
- **İletişim:** `CKM_HEADERS.iletisim` ABC A.Ş. · `ILETISIM_CONTACTS` (4) — PASS.
- **Finans:** Yıldız Grup · aging ₺8.750.250 toplam · emerald shell — PASS.
- **Teklifler:** Katman C Ltd — PASS.
- **Siparişler:** AKSİYON DIŞ TİCARET — PASS.
- **Tahsilatlar:** Örnek Sanayi · THS-2025-* — PASS.
- **Timeline:** ABC Teknoloji · 6 `TIMELINE_EVENTS` — PASS.

**Auditor imzası:** PNG’ler okundu; `CKM_HEADERS` route başına ayrıldı; 8/8 PASS.
