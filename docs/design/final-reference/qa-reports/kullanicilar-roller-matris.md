# QA Visual Report — kullanicilar-roller-matris

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/12-kullanicilar/roller/kullanicilar-roller-matris-acik-mod.png`  
**Route:** http://localhost:3011/kullanicilar/roller  
**Implementer iddiası:** qa-review (W6 teslim)

---

## 1. Ön kontroller

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| Doğru PNG açıldı | PASS | PNG okundu |
| `pnpm build` | FAIL | Dev 3011 aktif |
| Body scroll yok | PASS | Matris overflow hidden |
| Route erişilebilir | PASS | HTTP 200 |

---

## 2. Layout karşılaştırması

| Bölge | Referans | Uygulama | Sonuç |
|-------|----------|----------|-------|
| Kabuk | Rol ve Yetki Matrisi aktif | AppShell | PASS |
| Başlık / alt | “Rollerin modül ve işlemlere göre…” | “Rol bazında modül yetkilerini görüntüleyin…” | FAIL |
| KPI / filtre | Modül Grubu + 4 filtre | 4 filtre; Modül Grubu yok | FAIL |
| Matris tablosu | 8 rol × 12 modül | 8 rol, 12 sütun | PASS |
| Legend | Tam / Kısıtlı / Yok | 3 durum | PASS |
| Footer bilgi | Mavi bilgi kutusu (önbellek) | Kısa metin satırı | FAIL |
| Canvas | Açık | Uyumlu | PASS |

---

## 3. Metin ve veri (mock)

| Alan | Referans | Uygulama | Sonuç |
|------|----------------|----------|-------|
| Başlık | Rol ve Yetki Matrisi | Aynı | PASS |
| Yönetici satırı | Tüm yeşil | full | PASS |
| Misafir | Dashboard kısıtlı | none/limited | PASS |
| Dışa aktar | Raporu Dışa Aktar | Butonlar mevcut | PASS |

---

## 4. Fark listesi

1. Alt başlık PNG cümlesi mock’ta farklı.
2. Filtre şeridinde “Modül Grubu” dropdown referansta var; uygulamada yok.
3. Alt bilgi kutusu (cache uyarısı) referansta belirgin mavi panel; uygulama sadeleştirilmiş.
4. `pnpm build` atlandı.
5. Matris yatay kaydırma iç scroll ile — body scroll yok (PASS).

---

## 5. Karar

- [ ] **PASS**
- [x] **FAIL** → REVIZE; `KRM_SUBTITLE`, filtre şeridi (`Modül Grubu`), footer bilgi kutusu PNG ile hizalansın

**Auditor imzası:** PNG okundu; FAIL.
