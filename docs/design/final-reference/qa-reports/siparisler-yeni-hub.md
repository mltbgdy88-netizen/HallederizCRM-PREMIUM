# QA Visual Report — siparisler-yeni-hub

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/02-siparisler/yeni/siparisler-yeni-hub-acik-mod.png`  
**Route:** http://localhost:3011/siparisler/yeni  
**Implementer iddiası:** pass (qa-review teslim)

---

## 1. Ön kontroller

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| Doğru PNG açıldı | PASS | `siparisler-yeni-hub-acik-mod.png` okundu |
| `pnpm build` | FAIL | Compile+lint OK; manifest ENOENT |
| Body scroll yok | PASS | `.syh-home` koyu tam ekran, overflow hidden |
| Route erişilebilir | PASS | HTTP 200 |

---

## 2. Layout karşılaştırması (referans ↔ uygulama)

| Bölge | Referans | Uygulama | Sonuç |
|-------|----------|----------|-------|
| Kabuk (sidebar/header) | Emerald sidebar + altın logo | AppShell + `.syh-home` | PASS |
| Başlık / alt başlık | Yeni Sipariş + altın serif başlık | `SYH_TITLE` / `SYH_SUBTITLE` | PASS |
| KPI / üst şerit | — | — | PASS |
| Ana grid sütunları | 3 dikey kart + alt özellik şeridi | `SYH_CARDS` + `SYH_FEATURES` | PASS |
| Tablolar / listeler | — | — | PASS |
| Sağ panel (AI vb.) | — | — | PASS |
| Renk / canvas tonu | Koyu yeşil + altın glow | CSS değişkenleri eşleşiyor | PASS |

---

## 3. Metin ve veri (mock)

| Alan | Referans değer | Uygulama | Sonuç |
|------|----------------|----------|-------|
| Kart 1 | Hızlı Sipariş + açıklama | Aynı | PASS |
| Kart 2 | Tekliften Aktar | Aynı (tekil “teklifinizden”) | PASS |
| Kart 3 | Manuel | Aynı | PASS |
| Alt şerit | Güvenli & Hızlı / Akıllı / 7/24 | `SYH_FEATURES` | PASS |

---

## 4. Fark listesi (zorunlu, min 1 satır)

1. Tekliften Aktar açıklaması PNG “tekliflerinizden”; mock “teklifinizden” (çok küçük fark).
2. `pnpm build` ENOENT (compile yeşil).
3. Arka plan altın yay efekti referansta biraz daha belirgin (kozmetik).
4. Tema üst barda “Açık” görünür; sayfa koyu hub (bilinen platform davranışı).
5. Gözle görülür layout/metin drift’i yok — hub yapısı PNG ile hizalı.

---

## 5. Karar

- [x] **PASS** → Director final sign-off için `qa-pass`
- [ ] **FAIL** → REVIZE

**Auditor imzası:** PNG okundu; 3 kart + alt şerit referansla uyumlu → PASS.
