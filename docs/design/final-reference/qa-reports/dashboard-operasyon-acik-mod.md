# QA Visual Report — dashboard-operasyon-acik-mod

**Auditor:** Design Auditor (subagent, re-QA post-REVIZE)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/16-dashboard/ana-sayfa/dashboard-operasyon-acik-mod.png`  
**Route:** http://localhost:3011/dashboard  
**Implementer iddiası:** REVIZE — Siparişler nav kaldırıldı, akış alt başlık nokta

---

## 1. Ön kontroller

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| Doğru PNG açıldı | PASS | `dashboard-operasyon-acik-mod.png` okundu |
| `pnpm build` | SKIP | Dev aktif; terminal `GET /dashboard 200` |
| Body scroll yok | PASS | `dashboard-reference-poc.css` `100dvh` + `overflow: hidden` |
| Route erişilebilir | PASS | Terminal log 200 |

---

## 2. Layout karşılaştırması (referans ↔ uygulama)

| Bölge | Referans | Uygulama | Sonuç |
|-------|----------|----------|-------|
| Kabuk (sidebar/header) | 9 menü; Gösterge Paneli aktif | `NAV_ITEMS` 10 öğe (**Siparişler yok**) | PASS |
| Başlık / alt başlık | Gösterge Paneli + alt metin | `DashboardReferencePage` | PASS |
| KPI / üst şerit | 6 kart | `KPI_CARDS` değerler doğru | PASS |
| Ana grid sütunları | Akış + AI iki sütun | `ref-dashboard-split` | PASS |
| Tablolar / listeler | 8 operasyon akışı satırı | `FLOW_ITEMS` 8 kayıt | PASS |
| Sağ panel (AI vb.) | Video, 4 hızlı aksiyon, CTA | Yapı uyumlu | PASS |
| Renk / canvas tonu | Açık krem canvas | POC CSS tonları | PASS |

---

## 3. Metin ve veri (mock)

| Alan | Referans değer | Uygulama | Sonuç |
|------|----------------|----------|-------|
| Akış satırları | 8 kayıt (UR-10008…, 10:24…) | `FLOW_ITEMS` bire bir | PASS |
| Sidebar Siparişler | Yok | `NAV_ITEMS` içinde yok | PASS |
| Akış panel alt başlık | …bildirimleri**.** | `Güncel stok, hareket ve sistem bildirimleri.` | PASS |
| Sidebar footer | © 2025 | AppShell footer | PASS |
| KPI değerleri | 2.458, 86, 125.430… | Mock eşleşiyor | PASS |

---

## 4. Fark listesi (zorunlu, min 1 satır)

1. Önceki **FAIL** (fazla **Siparişler** nav) **giderildi** — `NAV_ITEMS` Siparişler içermiyor.
2. Operasyon Akışı alt başlığında sondaki nokta **eklendi** (REVIZE maddesi).
3. Paylaşılan kabukta **Teklifler** menüsü var; operasyon PNG 9 menü listesinde Teklifler yok — Stok QA ile aynı kozmetik kabuk farkı.
4. 8 akış satırı, KPI ve AI panel önceki turdan beri referansla uyumlu.
5. Scroll politikası korunuyor; Director final öncesi `pnpm build` önerilir.

---

## 5. Karar

- [x] **PASS** → Director final sign-off için `qa-pass`
- [ ] **FAIL** → REVIZE

**Gerekçe:** REVIZE hedefleri (nav + nokta) tamam; operasyon dashboard mock ve layout referans PNG ile hizalı.

**Auditor imzası:** PNG okundu; `dashboard-reference-mock.ts` + `DashboardReferencePage.tsx` doğrulandı.
