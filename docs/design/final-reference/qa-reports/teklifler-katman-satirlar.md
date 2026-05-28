# QA Visual Report — teklifler-katman-satirlar

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/01-teklifler/katmanlar/satirlar/teklifler-katman-satirlar-acik-mod.png`  
**Route:** http://localhost:3011/teklifler/katman/satirlar  
**Implementer iddiası:** pass (REVIZE batch)  
**Re-QA (2026-05-27):** Post-REVIZE — Kalemler 7-sekme + 8 kalem + stok uyarıları PNG ile hizalı.

---

## 1. Ön kontroller

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| Doğru PNG açıldı | PASS | `teklifler-katman-satirlar-acik-mod.png` okundu |
| `pnpm build` | PASS | `pnpm stop-dev` → `pnpm build` |
| Body scroll yok | PASS | Katman layout `overflow: hidden` |
| Route erişilebilir | PASS | `/teklifler/katman/satirlar` build çıktısında |

---

## 2. Layout karşılaştırması (referans ↔ uygulama)

| Bölge | Referans | Uygulama | Sonuç |
|-------|----------|----------|-------|
| Kabuk | Teklifler aktif | AppShell | PASS |
| Üst meta | TEK-2025-00123 · Onay Bekliyor · ₺167.450 | `SATIRLAR_HEADER` | PASS |
| Detay sekmeleri | 7 sekme; Kalemler aktif | `SATIRLAR_DETAIL_TABS` | PASS |
| Kalem tablosu | 8 satır UR-10001…10008 | `SATIRLAR_ROWS` ×8 | PASS |
| Sağ özet + stok | Özet tutarlar + 4 stok uyarısı | `SATIRLAR_SUMMARY` + `SATIRLAR_STOCK` | PASS |

---

## 3. Metin ve veri (mock)

| Alan | Referans değer | Uygulama | Sonuç |
|------|----------------|----------|-------|
| Genel Toplam | ₺167.450,00 | ₺167.450,00 | PASS |
| UR-10003 stok | Elektrik Motoru · uyarı | Aynı | PASS |
| UR-10005 stok | Hidrolik Yağ · uyarı | Aynı | PASS |
| Ara Toplam | ₺138.005,00 | Aynı | PASS |
| Teklif notu | KDV dahil / 15 gün | Sayfa metni | PASS |

---

## 4. Fark listesi (zorunlu, min 1 satır)

1. Gözle görülür layout/metin farkı yok — 8 kalem ve stok uyarı metinleri PNG ile eşleşiyor.
2. Üst katman sekmeleri (Özet/Satırlar/…) ortak `KATMAN_TABS` ile tutarlı.
3. Tablo “Toplam 8 kalem” sayacı doğru.
4. Hızlı işlemler 4 buton (PDF, E-posta, Onaya Gönder, İptal) mevcut.
5. Ürün ikonları dekoratif placeholder (kozmetik).

---

## 5. Karar

- [x] **PASS** → Director final sign-off için `qa-pass`
- [ ] **FAIL** → REVIZE

**Auditor imzası:** PNG okundu, `teklifler-katman-mock.ts` satırlar bölümü bire bir doğrulandı, `pnpm build` PASS.
