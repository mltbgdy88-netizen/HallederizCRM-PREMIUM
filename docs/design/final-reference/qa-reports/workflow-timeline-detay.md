# QA Visual Report — workflow-timeline-detay

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/20-workflow/timeline-detay/workflow-timeline-detay-acik-mod.png`  
**Route:** http://localhost:3011/workflow/timeline  
**Implementer iddiası:** qa-review (W7 teslim)

---

## 1. Ön kontroller

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| Doğru PNG açıldı | PASS | PNG okundu |
| `pnpm build` | FAIL | Dev 3011 aktif |
| Body scroll yok | PASS | overflow hidden |
| Route erişilebilir | PASS | HTTP 200 |

---

## 2. Layout karşılaştırması

| Bölge | Referans | Uygulama | Sonuç |
|-------|----------|----------|-------|
| Kabuk | Ürün Stok > Geçmiş | AppShell + breadcrumb | PASS |
| Ürün başlık | UR-10001 + sekmeler | WFT_PAGE | PASS |
| Timeline | 5 olay | WFT_EVENTS 5 | PASS |
| Sağ bağlam | Bağlam özeti + kapasite | WFT_CONTEXT | PASS |
| Olay saatleri | 14:32–15:02 aynı gün | 14:32–16:02 farklı | FAIL |
| Canvas | Açık | Uyumlu | PASS |

---

## 3. Metin ve veri (mock)

| Alan | Referans | Uygulama | Sonuç |
|------|----------------|----------|-------|
| Olay 3 Onaylandı | 14:41 Ahmet | 15:10 Ahmet | FAIL |
| Stok güncelleme | 14:45 2400→2450 | 15:11 | FAIL |
| Fiyat güncelleme | 15:02 82→85 | 16:02 | FAIL |
| Oluşturulma | 10.05.2025 | 10.01.2025 | FAIL |
| Ürün adı | Rulman 6205 2RS | Aynı | PASS |

---

## 4. Fark listesi

1. `WFT_EVENTS` zaman damgaları PNG ile bire bir değil (kritik mock drift).
2. Bağlam oluşturma tarihi 10.05.2025 olmalı.
3. Onay gönderildi adımlarında onaylayıcı listesi PNG’de iki kişi (kozmetik).
4. `pnpm build` atlandı.
5. Timeline dikey çizgi yapısı — layout PASS.

---

## 5. Karar

- [ ] **PASS**
- [x] **FAIL** → REVIZE; `workflow-timeline-mock.ts` `WFT_EVENTS` + `WFT_CONTEXT` PNG saat/tarih

**Auditor imzası:** PNG okundu; FAIL.
