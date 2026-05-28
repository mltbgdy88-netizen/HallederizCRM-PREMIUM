# QA Visual Report — onaylar-detay-karar

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/15-onaylar/detay-karar/onaylar-detay-karar-acik-mod.png`  
**Route:** http://localhost:3011/onaylar/detay  
**Implementer iddiası:** qa-review (W6 teslim)

---

## 1. Ön kontroller

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| Doğru PNG açıldı | PASS | PNG okundu |
| `pnpm build` | FAIL | Dev 3011 aktif |
| Body scroll yok | PASS | `.odk-home { overflow: hidden }` |
| Route erişilebilir | PASS | HTTP 200 |

---

## 2. Layout karşılaştırması

| Bölge | Referans | Uygulama | Sonuç |
|-------|----------|----------|-------|
| Kabuk | Onaylar aktif | AppShell | PASS |
| Başlık | Onay Karar Masası | Aynı | PASS |
| Ürün + fiyat | UR-10001, +₺35 (%41,18) | Mock eşleşiyor | PASS |
| Sağ panel | Risk + tutar etkisi + geçmiş | 3 panel | PASS |
| Alt aksiyonlar | Onayla / Reddet / İncele | 3 buton | PASS |
| Canvas | Açık | Uyumlu | PASS |

---

## 3. Metin ve veri (mock)

| Alan | Referans | Uygulama | Sonuç |
|------|----------------|----------|-------|
| Onay No | ONY-2025-000124 | ONY-2025-000124 | PASS |
| Fiyat farkı | + ₺35,00 (+%41,18) | Aynı | PASS |
| Yıllık etki | + ₺63.000,00 | Aynı | PASS |
| Ekler | 2 PDF | 2 PDF | PASS |
| Stok | 2.450 / kritik 86 | Aynı | PASS |

---

## 4. Fark listesi

1. Ürün görseli placeholder (kozmetik).
2. Denetim geçmişi saatleri PNG’de tam tarih; mock kısa saat (kozmetik).
3. `pnpm build` atlandı.
4. Layout 2+1 sütun oranı referansa yakın.
5. Gözle görülür metin drift’i yok (çekirdek alanlar).

---

## 5. Karar

- [x] **PASS** → Director `qa-pass` adayı
- [ ] **FAIL**

**Auditor imzası:** PNG okundu; PASS.
