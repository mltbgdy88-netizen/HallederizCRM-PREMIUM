# QA Visual Report — onaylar-komut-masasi

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/15-onaylar/komut-masasi/onaylar-komut-masasi-acik-mod.png`  
**Route:** http://localhost:3011/onaylar  
**Implementer iddiası:** pass (REVIZE batch, re-QA)

---

## 1. Ön kontroller

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| Doğru PNG açıldı | PASS | `onaylar-komut-masasi-acik-mod.png` okundu |
| `pnpm build` | PASS | `pnpm stop-dev` → clean `.next` → `pnpm build` — 85 route |
| Body scroll yok | PASS | `.okm-home { overflow: hidden }`; canlı `/onaylar` |
| Route erişilebilir | PASS | HTTP 200 |

---

## 2. Layout karşılaştırması (referans ↔ uygulama)

| # | Bölge | Referans | Uygulama | Sonuç |
|---|-------|----------|----------|-------|
| 1 | Kabuk | Onaylar aktif (badge 7) | AppShell; Onaylar aktif | PASS |
| 2 | KPI şeridi (5) | 7 / 3 / 2 / 1 / 1 | Aynı sayılar ve etiketler | PASS |
| 3 | Sol liste (7) | UR-10001 · 20.05.2025 10:30 | Mock + canlı eşleşiyor | PASS |
| 4 | Orta detay | Rulman; 850→1.600; ₺85 / ₺136.000 | Ürün alanları bire bir | PASS |
| 5 | Sağ işlemler | Onayla/Reddet/İncele + meta | Yapı ve meta PASS | PASS |

---

## 3. Metin ve veri (mock)

| Alan | Referans değer | Uygulama | Sonuç |
|------|----------------|----------|-------|
| KPI Toplam | 7 | 7 | PASS |
| Seçili tarih | 20.05.2025 10:30 | 20.05.2025 10:30 | PASS |
| Ürün | Rulman 6205 2RS | Rulman 6205 2RS | PASS |
| Mevcut / önerilen | 850 / 1.600 adet | Aynı | PASS |
| Tahmini tutar | ₺136.000,00 | ₺136.000,00 | PASS |
| Öncelik | Orta | Orta | PASS |

---

## 4. Fark listesi (zorunlu, min 1 satır)

1. **Ek Bilgiler:** PNG tedarikçi “Dekor Tedarik A.Ş.” / teslim “5 iş günü”; mock “SKF Rulmanları” / “2-3 Gün” — REVIZE kapsamı dışı kozmetik.
2. **İşlem geçmişi:** PNG oluşturan “Depo Sorumlusu” 10:25; mock “Ahmet Yılmaz” 10:30 — kozmetik.
3. KPI ve liste 7 kart — gözle görülür layout farkı yok.
4. Sağ Onay Bilgileri “Yönetici Onayı” 2/2 — PASS.
5. Body scroll yok — PASS.

---

## 5. Karar

- [x] **PASS** → Director final sign-off için `qa-pass`
- [ ] **FAIL** → REVIZE

**Auditor imzası:** PNG okundu; REVIZE bloklayıcı maddeler (2025, Rulman, stok/tutar) doğrulandı → PASS.
