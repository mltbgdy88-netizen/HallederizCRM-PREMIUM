# 04 — Codex Kalite Kontrol Notu

Bu not, Cursor ile ilk teknik starter üretildikten sonra Codex tarafında yapılacak kalite kontrol için kullanılacaktır.

## Amaç

ADAWALL Virtual Flagship teknik starter'ının kod kalitesi, mimari ayrımı, 3D sahne yapısı ve ileride SaaS'a genişleme uygunluğu kontrol edilecektir.

## Kontrol Başlıkları

1. Next.js App Router yapısı doğru mu?
2. TypeScript tipleri net mi?
3. 3D canvas client component olarak ayrılmış mı?
4. React Three Fiber bileşenleri tek dosyaya yığılmamış mı?
5. GLB model bulunmadığında fallback sahne açılıyor mu?
6. T plan fallback geometri ana mağaza ve wallpaper corridor mantığını temsil ediyor mu?
7. 1 pilot loca seçilebilir mi?
8. Renk varyasyonu seçimi duvar materyalini güncelliyor mu?
9. Ürün paneli seçilen varyanta göre SKU, renk, bayi stoğu ve fabrika stoğunu güncelliyor mu?
10. Mock veri ile gerçek entegrasyon birbirine karıştırılmamış mı?
11. Kod ileride tema sistemi ve bayi bazlı veri kullanımına genişleyebilir mi?
12. Mobil ve performans açısından erken risk var mı?

## Çıktı Formatı

Codex çıktısı şu başlıklarla raporlanmalıdır:

```text
# Kalite Kontrol Raporu

## Genel Durum
Uygun / Uyarılı Uygun / Uygun Değil

## Çalıştırılan Komutlar
- install:
- typecheck:
- build:
- lint:

## Kritik Bulgular

## Orta Seviye Bulgular

## İyileştirme Önerileri

## 3D / R3F Mimari Yorumu

## SaaS'a Genişleme Yorumu

## Sonraki Net Görevler
```

## Kabul Kriteri

İlk teknik starter ancak aşağıdakiler sağlandığında bir sonraki faza geçirilecektir:

- Uygulama yerelde açılır.
- 3D sahne görünür.
- 1 loca prototipi görünür.
- En az 3 renk varyasyonu arasında geçiş yapılır.
- Ürün paneli seçilen varyanta göre güncellenir.
- Kod modülerdir.
- Mock veriler açıkça mock olarak ayrılmıştır.
