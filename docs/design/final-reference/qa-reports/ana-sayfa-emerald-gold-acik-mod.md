# QA Visual Report — ana-sayfa-emerald-gold-acik-mod

**Auditor:** Design Auditor (subagent, re-QA post-REVIZE)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/_ek-alternatifler/ana-sayfa-emerald-gold-acik-mod.png`  
**Route:** http://localhost:3011/ana-sayfa  
**Implementer iddiası:** REVIZE — `EG_FLOW` alt başlıkları + Son İşlemler 2025

---

## 1. Ön kontroller

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| Doğru PNG açıldı | PASS | `ana-sayfa-emerald-gold-acik-mod.png` okundu (2. okuma) |
| `pnpm build` | SKIP | Dev aktif; route önceki oturumda 200 |
| Body scroll yok | PASS | `ana-sayfa-emerald-gold.css` `100dvh` + `overflow: hidden` |
| Route erişilebilir | PASS | Emerald route `(emerald)/ana-sayfa` |

---

## 2. Layout karşılaştırması (referans ↔ uygulama)

| Bölge | Referans | Uygulama | Sonuç |
|-------|----------|----------|-------|
| Kabuk (sidebar/header) | Emerald gold; Ana Sayfa aktif | `eg-sidebar-item--active`, 13 menü | PASS |
| Başlık / alt başlık | Hoş geldiniz, Mevlüt | Eşleşiyor | PASS |
| KPI / üst şerit | 4 uyarı kartı | `EG_ALERTS` değerler | PASS |
| Ana grid sütunları | Görevler + akış özeti + AI | Üçlü grid | PASS |
| Tablolar / listeler | Son İşlemler 6 satır | `EG_RECENT` 6 satır | PASS |
| Sağ panel (AI vb.) | PREMIUM rozet, 3 chip, input | `EG_AI_*` | PASS |
| Renk / canvas tonu | Emerald + altın accent | CSS dosyası | PASS |

---

## 3. Metin ve veri (mock)

| Alan | Referans değer | Uygulama | Sonuç |
|------|----------------|----------|-------|
| AI karşılama | Merhaba Mevlüt… | `EG_AI_GREETING` | PASS |
| Akış özeti alt yazıları | Toplam / Bugün vadesi gelen / Onay bekleyen / Yanıt bekleyen | `EG_FLOW[].subtitle` | PASS |
| Yeni Siparişler alt | Bugün | `subtitle: "Bugün"` | PASS |
| Son İşlemler durumları (6) | Onaylandı, Tahsil Edildi, Beklemede, Sevkiyata Hazır, İncelemede, Tamamlandı | `EG_RECENT` sıra/ton | PASS |
| Tarih yılı | 2025 | Tüm satırlar 2025 | PASS |
| Tablo kolon | Tür | `<th>Tür</th>` | PASS |

---

## 4. Fark listesi (zorunlu, min 1 satır)

1. Önceki **FAIL** (`EG_FLOW` hepsi “Bugün”) **giderildi** — beş sütun alt başlığı PNG metinleriyle eşleşiyor.
2. Son İşlemler **6 durum rozeti** referans PNG ile aynı sıra ve etiketler.
3. Kayıt numaraları/tutarlar implementer mock seti (`SIP-2025-0524-*`); PNG’de piksel bazlı ref doğrulaması sınırlı — yapı ve 2025 yılı REVIZE kapsamında kabul.
4. Önceki tur drift’i (kart başlığı, AI, görevler) korunuyor — regresyon yok.
5. Alt hızlı işlem çubuğu 7 aksiyon referansla uyumlu.

---

## 5. Karar

- [x] **PASS** → Director final sign-off için `qa-pass`
- [ ] **FAIL** → REVIZE

**Gerekçe:** REVIZE odaklı `EG_FLOW` ve Son İşlemler (6 satır, 2025, durum seti) referansla hizalı; emerald shell layout korunuyor.

**Auditor imzası:** PNG okundu; `ana-sayfa-emerald-gold-mock.ts` doğrulandı.
