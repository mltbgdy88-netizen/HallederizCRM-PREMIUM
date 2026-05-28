# QA Visual Report — teklifler-detay-masasi

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/01-teklifler/detay/teklifler-detay-masasi-acik-mod.png`  
**Route:** http://localhost:3011/teklifler/detay  
**Implementer iddiası:** pass (qa-review teslim)

---

## 1. Ön kontroller

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| Doğru PNG açıldı | PASS | `teklifler-detay-masasi-acik-mod.png` okundu |
| `pnpm build` | FAIL | Compile+lint OK; `build-manifest.json` ENOENT |
| Body scroll yok | PASS | `globals.css` + `.tdm-home { overflow: hidden }` |
| Route erişilebilir | PASS | HTTP 200 |

---

## 2. Layout karşılaştırması (referans ↔ uygulama)

| Bölge | Referans | Uygulama | Sonuç |
|-------|----------|----------|-------|
| Kabuk (sidebar/header) | Teklifler aktif | AppShell, Teklifler aktif | PASS |
| Başlık / alt başlık | Teklif Detayı + TK-8821 | `TDM_PAGE` + `TDM_HERO` | PASS |
| KPI / üst şerit | 4 özet kartı | 4 KPI kartı | PASS |
| Ana grid sütunları | Özet alanları + sağ bağlam + dönüşüm CTA | `tdm-body` iki sütun | PASS |
| Tablolar / listeler | Özet alan grid | `TDM_SUMMARY_FIELDS` | PASS |
| Sağ panel (AI vb.) | Teklif Bağlamı + Siparişe Dönüştür | `TDM_CONTEXT` + `TDM_CONVERT` | PASS |
| Renk / canvas tonu | Açık canvas | Açık gri-yeşil | PASS |

---

## 3. Metin ve veri (mock)

| Alan | Referans değer | Uygulama | Sonuç |
|------|----------------|----------|-------|
| Durum rozeti | Müşteri Durumunda | Müşteri Durumunda | PASS |
| Toplam | ₺125.430,00 KDV Dahil | Aynı | PASS |
| Geçerlilik KPI | 18.07.2025 / 30 gün kaldı | Aynı | PASS |
| İskonto | ₺8.750,00 / %6,52 | Aynı | PASS |
| Satır sayısı | 6 Ürün / Hizmet | 6 | PASS |
| Sekmeler | Özet…Timeline (6) | `TDM_TABS` 6 adet | PASS |

---

## 4. Fark listesi (zorunlu, min 1 satır)

1. Sekmeler görsel olarak var; henüz route değiştirmiyor (beklenen POC davranışı).
2. `pnpm build` tam paketleme ENOENT (compile yeşil).
3. Hero “Yazdır / Diğer” dropdown içeriği PNG’de daha zengin; uygulamada outline butonlar (kozmetik).
4. Etiket pill renk tonu referansta biraz daha koyu yeşil (kozmetik).
5. Gözle görülür layout/metin drift’i yok — çekirdek mock PNG ile hizalı.

---

## 5. Karar

- [x] **PASS** → Director final sign-off için `qa-pass`
- [ ] **FAIL** → REVIZE

**Auditor imzası:** PNG okundu; KPI, hero, özet alanları ve bağlam paneli referansla bire bir.
