# QA Visual Report — teslimatlar-yeni-form

**Auditor:** Design Auditor (subagent)  
**Tarih:** 2026-05-27  
**Referans PNG:** `docs/design/reference/05-teslimatlar/yeni/teslimatlar-yeni-form-acik-mod.png`  
**Route:** http://localhost:3011/teslimatlar/yeni  
**Implementer iddiası:** pass

---

## 1. Ön kontroller

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| Doğru PNG açıldı | PASS | |
| `pnpm build` | FAIL | Dev aktif |
| Body scroll yok | PASS | `.tsyf-home` overflow hidden |
| Route erişilebilir | PASS | HTTP 200 |

---

## 2. Layout karşılaştırması

| Bölge | Sonuç |
|-------|-------|
| Kabuk | PASS |
| Başlık Yeni Teslimat Oluştur | PASS |
| 4 üst alan (adres/tarih/şoför/araç) | PASS |
| Ürün tablosu + özet | PASS |
| Satır bağlantısı + İptal/Oluştur | PASS |

---

## 4. Fark listesi

1. Form başlığı, alt başlık ve dört üst alan PNG ile eşleşiyor.
2. Ürün tablosu kolonları ve boş satır placeholder’ları uyumlu.
3. Teslimat Özeti ₺0,00 üçlüsü doğru.
4. `pnpm build` dev nedeniyle atlandı.
5. Gözle görülür layout/metin drift’i yok.

---

## 5. Karar

- [x] **PASS**
- [ ] **FAIL**

**Auditor imzası:** PNG okundu; tam sayfa form referansla hizalı → PASS.
