# QA Visual Report — erp-entegrasyon-masasi

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/13-erp/entegrasyon/erp-entegrasyon-masasi-acik-mod.png`  
**Route:** http://localhost:3011/erp  
**Implementer iddiası:** qa-review (W6 teslim)

---

## 1. Ön kontroller

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| Doğru PNG açıldı | PASS | PNG okundu |
| `pnpm build` | FAIL | Dev 3011 aktif |
| Body scroll yok | PASS | `.eem-home { overflow: hidden }` |
| Route erişilebilir | PASS | HTTP 200 |

---

## 2. Layout karşılaştırması

| Bölge | Referans | Uygulama | Sonuç |
|-------|----------|----------|-------|
| Kabuk | Entegrasyon aktif | AppShell | PASS |
| Başlık | ERP Entegrasyon Merkezi | Aynı | PASS |
| KPI şeridi | %98,6 · 12 hata · 86 kuyruk | Bire bir | PASS |
| Sekmeler + tablo | 4 sekme, LOGO/SAP/NETSİS | Yapı uyumlu | PASS |
| Sağ panel | NETSİS çevrimdışı, API Uyarı | Eşleşiyor | PASS |
| Sayfalama metni | Toplam 1.246 kayıt | Toplam 12.458 kayıt | FAIL |
| Canvas | Açık operasyon | Uyumlu | PASS |

---

## 3. Metin ve veri (mock)

| Alan | Referans | Uygulama | Sonuç |
|------|----------------|----------|-------|
| Hata Sayısı | 12 Bugün | 12 Bugün | PASS |
| Bekleyen | 86 Kuyrukta | 86 Kuyrukta | PASS |
| NETSİS | Çevrimdışı | online: false | PASS |
| API Servisi | Uyarı | Uyarı | PASS |
| Tablo toplam | 1.246 | 12.458 | FAIL |

---

## 4. Fark listesi

1. Tablo alt bilgisi “Toplam 1.246 kayıt” — mock `EEM_TABLE_TOTAL` 12.458 (kritik).
2. Tablo satır zamanları PNG ile tam eşleşmeyebilir (ikincil).
3. `pnpm build` atlandı.
4. Sekme badge sayıları 12/86 — PASS.
5. Body scroll yok — PASS.

---

## 5. Karar

- [ ] **PASS**
- [x] **FAIL** → REVIZE; `EEM_TABLE_TOTAL` ve sayfalama `…125` → PNG 1.246 kayıt

**Auditor imzası:** PNG okundu; FAIL.
