# QA Visual Report — <slug>

**Auditor:** <agent adı>  
**Tarih:** YYYY-MM-DD  
**Referans PNG:** `docs/design/reference/<path>`  
**Route:** http://localhost:3011<route>  
**Implementer iddiası:** pass / fail (önceki tur)

---

## 1. Ön kontroller

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| Doğru PNG açıldı | PASS / FAIL | |
| `pnpm build` | PASS / FAIL | |
| Body scroll yok | PASS / FAIL | `scrollHeight` vs `innerHeight` |
| Route erişilebilir | PASS / FAIL | HTTP 200 |

---

## 2. Layout karşılaştırması (referans ↔ uygulama)

| Bölge | Referans | Uygulama | Sonuç |
|-------|----------|----------|-------|
| Kabuk (sidebar/header) | | | PASS/FAIL |
| Başlık / alt başlık | | | |
| KPI / üst şerit | | | |
| Ana grid sütunları | | | |
| Tablolar / listeler | | | |
| Sağ panel (AI vb.) | | | |
| Renk / canvas tonu | | | |

---

## 3. Metin ve veri (mock)

| Alan | Referans değer | Uygulama | Sonuç |
|------|----------------|----------|-------|
| | | | |

---

## 4. Fark listesi (zorunlu, min 1 satır)

1. 
2. 

*(Fark yoksa: “Gözle görülür layout/metin farkı yok” — yine de 5 layout maddesinin tamamı PASS olmalı.)*

---

## 5. Karar

- [ ] **PASS** → Director final sign-off için `qa-pass`
- [ ] **FAIL** → REVIZE; implementer’a `docs/design/DESIGN_OPS_PLAYBOOK.md` REVIZE şablonu

**Auditor imzası:** Bu raporu doldurmadan PASS işaretleyen auditor uyarılır (Director policy).
