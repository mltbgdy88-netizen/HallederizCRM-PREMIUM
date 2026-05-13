# Production UI Real Screen Completion

## Amac
Bu paket, UI tarafinda demo/placeholder/fake-success algisini azaltip production-safe ekran dili ile gercek durum gostermeyi hedefler.

## Uygulanan Standard
- Gercek API sonucu olmadan canli basari dili kullanilmaz.
- `policy`, `approval`, `productionGate`, `degraded/not_configured` durumlari basari gibi sunulmaz.
- Empty/error/permission benzeri durumlar acik metinlerle ayrilir.
- Moduller arasi tablo + filtre + detay + aksiyon dili korunur.

## Dengelenen Ekranlar
- Customers: demo toast metinleri production-safe hale getirildi; yeni/import aksiyonlari gercek route'a baglandi.
- Stock: demo basari metinleri blocked/degraded odakli dile cevrildi.
- Quick Operations: mutation-success gibi gorunen toast metinleri taslak/onay zinciri diline cekildi.
- WhatsApp: canli gonderim olmayan aksiyonlarda fake-success kaldirildi.
- Tasks: filtre paneli artik gercekten listeyi etkiliyor; "Filtre Foundation" metni kaldirildi.
- AI secondary sayfalari, Documents ve Factories filtre metinleri non-deceptive hale getirildi.

## Fake/Demo/Placeholder Temizligi
- "(demo)", "yakinda" ve "foundation" ile canli basari hissi veren kritik metinler azaltildi.
- Ozellikle mutation/send benzeri aksiyonlarda "tamamlandi" algisi yerine "taslak/policy-onay gerekli" dili kullanildi.

## ProductionGate UI Standardi
- Canli execution veya provider send icermeyen adimlarin basari oldugu varsayilmaz.
- Kullaniciya neden-sonuc metni: blocked_not_configured / policy-onay / execution gereksinimi.

## Kalan Alanlar
- Bazi modullerde mock veri kaynagi teknik olarak hala foundation seviyesinde.
- Canli provider ve tum domain mutation wiring ayrik fazlarda tamamlanacak.
- Bu PR, canliya hazir olmayan adimlarin basari gibi gorunmesini azaltir; tum entegrasyonlari canliya acmaz.
