# QA Visual Report — hizli-islem-satis-masasi

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/17-hizli-islem/satis-masasi/hizli-islem-satis-masasi-acik-mod.png`  
**Route:** http://localhost:3011/hizli-islem/satis-masasi  
**Implementer iddiası:** qa-review (W7 teslim)

---

## 1. Ön kontroller

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| Doğru PNG açıldı | PASS | PNG okundu |
| `pnpm build` | FAIL | Dev 3011 aktif |
| Body scroll yok | PASS | `.hism-home { overflow: hidden }` |
| Route erişilebilir | PASS | HTTP 200 |

---

## 2. Layout karşılaştırması

| Bölge | Referans | Uygulama | Sonuç |
|-------|----------|----------|-------|
| Kabuk | Hızlı İşlem aktif | AppShell | PASS |
| Son işlemler | 5 kart yatay | 3 kart | FAIL |
| Cari + ürün + özet | 3 bölge | 3 bölge | PASS |
| Ürün tablosu | 5 endüstriyel satır | 5 satır farklı ürünler | FAIL |
| Genel toplam | ₺13.284,00 | ₺13.284,00 | PASS |
| Canvas | Açık | Uyumlu | PASS |

---

## 3. Metin ve veri (mock)

| Alan | Referans | Uygulama | Sonuç |
|------|----------------|----------|-------|
| Başlık | Hızlı İşlem Satış Masası | Aynı | PASS |
| Son işlem SF-0245 | Taslak | Var | PASS |
| Ürün 1 | Rulman (PNG satırları) | UR-10001 | PASS |
| Ürün satır 2 | V Kayışı vb. | Kayış 1200-8M | FAIL |
| Toplam miktar | 6,000 | 6,000 | PASS |
| Genel toplam | ₺13.284,00 | ₺13.284,00 | PASS |

---

## 4. Fark listesi

1. `HISM_RECENT` 3 kart — PNG 5 kart (SF-0245…0241).
2. `HISM_LINES` ürün adları/kodları PNG endüstriyel seti ile tam eşleşmiyor.
3. Cari form alanları layout PASS; placeholder içerik boş (beklenen).
4. `pnpm build` atlandı.
5. Onaya Gönder / Kaydet butonları — PASS.

---

## 5. Karar

- [ ] **PASS**
- [x] **FAIL** → REVIZE; `hizli-islem-satis-masasi-mock.ts` `HISM_RECENT` (5) + `HISM_LINES` PNG satırları

**Auditor imzası:** PNG okundu; FAIL.
