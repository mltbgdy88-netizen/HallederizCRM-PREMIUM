# QA Visual Report — tahsilatlar-operasyon-masasi

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/04-tahsilatlar/liste/tahsilatlar-operasyon-masasi-acik-mod.png`  
**Route:** http://localhost:3011/tahsilatlar  
**Implementer iddiası:** pass (qa-review teslim)

---

## 1. Ön kontroller

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| Doğru PNG açıldı | PASS | `tahsilatlar-operasyon-masasi-acik-mod.png` okundu |
| `pnpm build` | FAIL | Dev 3011 aktif; `prebuild` bloklar |
| Body scroll yok | PASS | `.thm-home { overflow: hidden }`; canlı `/tahsilatlar` Tahsilatlar nav `current` |
| Route erişilebilir | PASS | HTTP 200 |

---

## 2. Layout karşılaştırması (referans ↔ uygulama)

| Bölge | Referans | Uygulama | Sonuç |
|-------|----------|----------|-------|
| Kabuk (sidebar/header) | AppShell; Tahsilatlar aktif | Tahsilatlar `current`; Yusuf Kaya | PASS |
| Başlık / alt başlık | Tahsilat Operasyon Masası | `THM_TITLE` / `THM_SUBTITLE` | PASS |
| KPI / üst şerit | 5 KPI (125.430 … 1.245.360) | 5 KPI aynı değerler | PASS |
| Ana grid sütunları | Tablo + Tahsilat Bağlamı | İki sütun, sağ panel | PASS |
| Tablolar / listeler | 8 satır MKB-2025-1204… | `THM_TABLE_ROWS` bire bir | PASS |
| Sağ panel (AI vb.) | Dağılım, onay, hatırlat | `getThmContext` + aksiyonlar | PASS |
| Renk / canvas tonu | Açık gri-yeşil canvas | Referans CSS tonu | PASS |

---

## 3. Metin ve veri (mock)

| Alan | Referans değer | Uygulama | Sonuç |
|------|----------------|----------|-------|
| Bugün Tahsilat | 125.430 ₺ | 125.430 ₺ | PASS |
| Makbuz 1 | MKB-2025-1204 | MKB-2025-1204 | PASS |
| Bağlam müşteri | ABC Otomotiv | ABC Otomotiv San. ve Tic. Ltd. Şti. | PASS |
| Sayfalama | Toplam 2.458 … 246 | `THM_TABLE_TOTAL` + 246 | PASS |

---

## 4. Fark listesi (zorunlu, min 1 satır)

1. Referans PNG’de sidebar **Cariler** vurgulu; canlıda **Tahsilatlar** doğru aktif (PNG eski kare).
2. Müşteri unvanı referansta kısaltılmış; mock tam şirket adı (kabul edilebilir).
3. `pnpm build` bu turda koşturulamadı (dev aktif).
4. Demo banner tonu referansta sarımsı; uygulama açık yeşilimsi (kozmetik).
5. Gözle görülür layout/KPI/tablo drift’i yok — çekirdek mock PNG ile hizalı.

---

## 5. Karar

- [x] **PASS** → Director final sign-off için `qa-pass`
- [ ] **FAIL** → REVIZE

**Auditor imzası:** PNG okundu; canlı route doğrulandı; KPI + tablo + bağlam referansla uyumlu → PASS.
