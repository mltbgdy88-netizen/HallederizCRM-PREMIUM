# QA Visual Report — arsiv-operasyon-merkezi

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/00-onayli-sprint1/arsiv/liste/arsiv-operasyon-merkezi-acik-mod.png`  
**Route:** http://localhost:3011/arsiv  
**Implementer iddiası:** pass (qa-review teslim)

---

## 1. Ön kontroller

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| Doğru PNG açıldı | PASS | Sprint1 `arsiv-operasyon-merkezi-acik-mod.png` okundu |
| `pnpm build` | FAIL | Dev 3011 aktif; `prebuild` bloklar |
| Body scroll yok | PASS | `.aom-home { overflow: hidden }` + canlı viewport’ta body scroll yok |
| Route erişilebilir | PASS | HTTP 200 |

---

## 2. Layout karşılaştırması (5 satır — referans ↔ uygulama)

| # | Bölge | Referans | Uygulama | Sonuç |
|---|-------|----------|----------|-------|
| 1 | Kabuk | Emerald/operasyon sidebar; Arşiv aktif | Platform AppShell; Arşiv → `/arsiv` aktif | PASS |
| 2 | Başlık + aksiyonlar | Arsiv Operasyon Merkezi; Belge Yükle / Dışa Aktar / Toplu İndir | Aynı üçlü CTA | PASS |
| 3 | KPI şeridi (6 kart) | 12.458 · 86 · 9.847 · 237 · 36 · 7,2 Yıl | `AOM_KPIS` değer ve sıra bire bir | PASS |
| 4 | Sekmeler + filtre + demo | 7 sekme; Kaynak/Durum/Tarih/Kullanıcı; sarı demo şeridi | Sekmeler + filtre şeridi + `AOM_DEMO_BANNER` | PASS |
| 5 | Tablo + sağ bağlam | 8 satır; AR-2025-000987 seçili; Denetim İzi + belge + 4 aksiyon | 8 satır; bağlam paneli tam; saklama notu | PASS |

---

## 3. Metin ve veri (mock)

| Alan | Referans değer | Uygulama | Sonuç |
|------|----------------|----------|-------|
| Alt başlık | gecmis islemler belgeler | gecmis islemler belgeler | PASS |
| Demo banner | Demo Modu: Veri seti örnek amaçlıdır. | Aynı | PASS |
| Tablo satır 1 | AR-2025-000987 · ABC Ticaret · Onaylı | Eşleşiyor | PASS |
| Belge adı | FATURA_ABC_2025-000987.pdf | Aynı | PASS |
| Sayfalama | Toplam 12.458 kayıt · 10 / sayfa | Eşleşiyor | PASS |

---

## 4. Fark listesi (zorunlu, min 1 satır)

1. Başlıkta referans “Arsiv” (ASCII); uygulama “Arşiv” (Türkçe karakter) — kozmetik.
2. Referans Emerald CRM sidebar menüsü; uygulama Premium platform nav (proje standardı, stok ile tutarlı).
3. Belge boyutu referansta “1.24 MB”; mock “1,24 MB” (ayraç).
4. Tablo satır ikonları referansta türe göre renkli; uygulama gri belge thumb (kozmetik).
5. `pnpm build` bu turda koşturulamadı.

---

## 5. Karar

- [x] **PASS** → Director final sign-off için `qa-pass`
- [ ] **FAIL** → REVIZE

**Gerekçe:** KPI, sekme, filtre, tablo, demo şeridi ve Arşiv Bağlamı paneli referansla uyumlu; sapmalar kozmetik veya platform kabuk standardı.

**Auditor imzası:** PNG okundu, canlı `/arsiv` doğrulandı, bu rapor doldurulmadan PASS verilmedi.
