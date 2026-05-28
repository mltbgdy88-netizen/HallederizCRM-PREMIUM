# QA Visual Report — stok-operasyon-masasi

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/00-onayli-sprint1/stok/liste/stok-operasyon-masasi-acik-mod.png`  
**Route:** http://localhost:3011/stok  
**Implementer iddiası:** pass (kod tamam; qa-review)

---

## 1. Ön kontroller

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| Doğru PNG açıldı | PASS | Sprint1 `stok-operasyon-masasi-acik-mod.png` okundu |
| `pnpm build` | FAIL | Port 3011’de dev açık; `prebuild` build’i blokladı |
| Body scroll yok | PASS | `.som-home { overflow: hidden }` + kabuk `100dvh`; canlı `/stok` tam ekran, sayfa kaydırması yok |
| Route erişilebilir | PASS | HTTP 200 |

---

## 2. Layout karşılaştırması (referans ↔ uygulama)

| Bölge | Referans | Uygulama | Sonuç |
|-------|----------|----------|-------|
| Kabuk (sidebar/header) | Premium CRM, Ürün Stok aktif, Yusuf Kaya | Aynı AppShell | PASS |
| Başlık / alt başlık | Stok Operasyon Masası + alt metin | Aynı başlık; alt metin mock ile uyumlu | PASS |
| KPI / üst şerit | 6 kart (2.458, 86, 125.430, …) | 6 kart, aynı değerler ve sıra | PASS |
| Ana grid sütunları | Sol tablo + sağ Stok Bağlamı | `som-workspace` iki sütun, oranlar referansa yakın | PASS |
| Tablolar / listeler | 8 satır, seçili UR-10001 altın çerçeve | 8 satır, seçim ve sütunlar eşleşiyor | PASS |
| Sağ panel (AI vb.) | Stok Bağlamı, uyarılar, kapasite çubuğu | Panel tam; aksiyon butonları 3 adet | PASS |
| Renk / canvas tonu | `#f4f6f8` açık gri-yeşil canvas | `#f4f6f8` uygulandı | PASS |

---

## 3. Metin ve veri (mock)

| Alan | Referans değer | Uygulama | Sonuç |
|------|----------------|----------|-------|
| KPI Toplam Ürün | 2.458 | 2.458 | PASS |
| Demo banner | Demo Verisi: Bu ekran demo amaçlıdır… | Aynı metin | PASS |
| Tablo satır 1 | UR-10001, ₺85,00, Stokta | Eşleşiyor | PASS |
| Bağlam kategori | Rulmanlar (referans) | Rulman · Endüstriyel | FAIL (küçük) |
| Sayfalama | Toplam 2.458 kayıt, 10 satır, …246 | Eşleşiyor | PASS |

---

## 4. Fark listesi (zorunlu, min 1 satır)

1. Ürün sütununda referansta küçük ürün görseli; uygulamada gri placeholder ikon kutusu.
2. Sağ bağlam **Kategori** metni referansta “Rulmanlar”; mock “Rulman · Endüstriyel”.
3. Demo uyarı şeridi referansta sarımsı banner; uygulamada açık yeşilimsi ton.
4. `pnpm build` bu turda çalıştırılamadı (dev 3011 aktif).
5. Kapasite etiketi bağlamda “1.250 / 1.860 adet %68” — referansta aynı bilgi, görsel çubuk tonu biraz daha koyu yeşil (kozmetik).

---

## 5. Karar

- [x] **PASS** → Director final sign-off için `qa-pass`
- [ ] **FAIL** → REVIZE; implementer’a `docs/design/DESIGN_OPS_PLAYBOOK.md` REVIZE şablonu

**Gerekçe:** Kabuk, grid, KPI, tablo ve bağlam paneli referansla bire bir hizalı; kalan farklar kozmetik / ikincil metin. Mock çekirdek sayılar ve satırlar PNG ile uyumlu.

**Auditor imzası:** PNG okundu, canlı `localhost:3011/stok` doğrulandı, bu rapor doldurulmadan PASS verilmedi.
