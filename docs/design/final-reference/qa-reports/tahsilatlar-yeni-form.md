# QA Visual Report — tahsilatlar-yeni-form

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/04-tahsilatlar/yeni/tahsilatlar-yeni-form-acik-mod.png`  
**Route:** http://localhost:3011/tahsilatlar/yeni  
**Implementer iddiası:** pass (modal + liste backdrop)

---

## 1. Ön kontroller

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| Doğru PNG açıldı | PASS | `tahsilatlar-yeni-form-acik-mod.png` okundu |
| `pnpm build` | FAIL | Dev aktif |
| Body scroll yok | PASS | `.thyf-* { overflow: hidden }` |
| Route erişilebilir | PASS | HTTP 200 |

---

## 2. Layout karşılaştırması (referans ↔ uygulama)

| Bölge | Referans | Uygulama | Sonuç |
|-------|----------|----------|-------|
| Kabuk (sidebar/header) | Stok Operasyon Masası arka plan | Tahsilat Operasyon Masası backdrop | FAIL |
| Başlık / alt başlık | Yeni Tahsilat modal | `THYF_TITLE` modal | PASS |
| KPI / üst şerit | Stok KPI (2.458 ürün vb.) | Tahsilat KPI şeridi | FAIL |
| Ana grid sütunları | Modal ortada + stok tablo | Modal + tahsilat tablo | FAIL |
| Tablolar / listeler | Dağılım FTR-2025-0001 | `THYF_DISTRIBUTION_ROWS` | PASS |
| Sağ panel (AI vb.) | Yok (modal) | Yok | PASS |
| Renk / canvas tonu | Stok + modal | Tahsilat tonu | FAIL |

---

## 3. Metin ve veri (mock)

| Alan | Referans değer | Uygulama | Sonuç |
|------|----------------|----------|-------|
| Tarih | 25.05.2025 | `THYF_DATE_DEFAULT` | PASS |
| Dağılım bakiye | ₺12.450,00 | `THYF_SUMMARY.totalBalance` | PASS |
| Özet toplamlar | 12.450 / 0 / 12.450 | `THYF_SUMMARY` | PASS |
| Arka plan ekran | Ürün Stok masası | `TahsilatlarOperasyonPage backdrop` | FAIL |

---

## 4. Fark listesi (zorunlu, min 1 satır)

1. **Backdrop:** PNG’de arka plan **Stok Operasyon Masası** (+ Yeni Ürün); uygulama **Tahsilat Operasyon Masası** render ediyor (`TahsilatlarYeniFormPage` → `thyf-backdrop`).
2. Modal form alanları (tutar, yöntem, tarih, cari, dağılım) PNG ile uyumlu.
3. `Onaya Gönder` altın butonu modal footer’da mevcut.
4. `pnpm build` dev nedeniyle atlandı.
5. REVIZE: backdrop için `StokOperasyonPage` veya stok mock snapshot (referans `stok-operasyon-masasi-acik-mod.png` kalıbı).

---

## 5. Karar

- [ ] **PASS** → Director final sign-off için `qa-pass`
- [x] **FAIL** → REVIZE; backdrop PNG = Stok masası

**Auditor imzası:** PNG okundu; modal içi PASS, arka plan ekran drift → FAIL.
