# QA Visual Report — hizli-satis-masasi

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/_ek-alternatifler/hizli-satis-masasi-acik-mod.png`  
**Route:** http://localhost:3011/hizli-satis  
**Implementer iddiası:** pass (REVIZE batch)  
**Re-QA (2026-05-27):** Post-REVIZE — mock PNG ile hizalı.

---

## 1. Ön kontroller

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| Doğru PNG açıldı | PASS | `hizli-satis-masasi-acik-mod.png` okundu |
| `pnpm build` | PASS | `pnpm stop-dev` → `pnpm build` — 85 route, compile+lint OK |
| Body scroll yok | PASS | `.hsm-home { overflow: hidden }` + `100dvh` kabuk |
| Route erişilebilir | PASS | `/hizli-satis` static route build çıktısında |

---

## 2. Layout karşılaştırması (referans ↔ uygulama)

| # | Bölge | Referans | Uygulama | Sonuç |
|---|-------|----------|----------|-------|
| 1 | Kabuk | Hallederiz CRM; Hızlı İşlem aktif (mavi) | AppShell; Hızlı İşlem → `/hizli-satis` | PASS |
| 2 | Başlık + üst CTA | Hızlı Satış Masası; Tekliften Çağır / + Yeni Fiş / Önizle | `HSM_HEADER_ACTIONS` aynı üçlü | PASS |
| 3 | Form şeridi | Cari ara, telefon, temsilci, depo + 2 sarı banner | `HSM_FORM` + `HSM_INFO_BANNERS` | PASS |
| 4 | Ürün tablosu + özet | 6 satır PRD-00123…01111; ara 4.025; genel 4.830 | `HSM_LINES` ×6 + `HSM_SUMMARY` | PASS |
| 5 | Onay + footer CTA | Taslak; Onaylayan `--`; Onay Tarihi `--`; 5 alt buton | `HSM_APPROVAL` + `HSM_FOOTER_ACTIONS` | PASS |

---

## 3. Metin ve veri (mock)

| Alan | Referans değer | Uygulama | Sonuç |
|------|----------------|----------|-------|
| Satır 1 | PRD-00123 Beyaz A4 · 1.250,00 | Aynı | PASS |
| Satır 6 | PRD-01111 Yapışkanlı Not · 450,00 | Aynı | PASS |
| Ara toplam | 4.025,00 TL | 4.025,00 TL | PASS |
| KDV Toplamı | 805,00 TL | 805,00 TL | PASS |
| Genel Toplam | 4.830,00 TL | 4.830,00 TL | PASS |
| Onaylayan / Onay Tarihi | `--` / `--` | `--` / `--` | PASS |
| Vade / Tahsilat | 20.05.2025 · 4.830,00 | `HSM_PAYMENT` aynı | PASS |

---

## 4. Fark listesi (zorunlu, min 1 satır)

1. Gözle görülür layout/metin farkı yok — 6 ürün satırı, ara/KDV ve onay paneli PNG ile eşleşiyor.
2. Kabuk markası PNG “Hallederiz CRM”; platform AppShell “Premium CRM” (ortak kabuk farkı, kabul).
3. Sidebar aktif vurgu mavi ton referansa yakın.
4. Tablo sütun genişlikleri viewport’a göre ölçekleniyor (kozmetik).
5. Footer buton sırası ve etiketleri PNG ile aynı.

---

## 5. Karar

- [x] **PASS** → Director final sign-off için `qa-pass`
- [ ] **FAIL** → REVIZE

**Auditor imzası:** PNG okundu, `hizli-satis-masasi-mock.ts` bire bir doğrulandı, `pnpm build` PASS.
