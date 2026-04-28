# HallederizCRM-PREMIUM Yol Haritasi

## Genel Yaklasim
Bu roadmap, projeyi teknik olarak saglam ve urunsel olarak olculu bir sekilde buyutmek icin fazlara bolunmus resmi delivery planidir. Fazlar birbirini tamamlar; her faz bir sonrakine veri, davranis ve deneyim altyapisi tasir.

---

## Faz 0: Urun kapsami, modul sinirlari, bilgi mimarisi, tasarim sistemi

### Amac
Urunun neyi cozecegini, hangi modullerle cozecegini ve bunu hangi bilgi mimarisiyle sunacagini netlestirmek.

### Ana moduller
- Product discovery
- Domain ve bounded context haritasi
- Information architecture
- Tasarim sistemi ve app shell kurallari

### Tasinacak fikirler
- Duvar kagidi sektoru odakli CRM + operasyon modeli
- Masaustu benzeri web deneyimi
- Multi-tenant ve paketleme mantigi

### Yeniden yazilacak kisimlar
- Baslangicta cizilen dağinik ekran akislari
- Tutarsiz terminoloji ve modul isimlendirmeleri
- Ad-hoc tasarim denemeleri

### Beklenen cikti
- Resmi urun dokumanlari
- Modul haritasi
- Tasarim token ve component prensipleri
- Faz bazli uygulama plani

---

## Faz 1: Platform core

### Amac
Kimlik, oturum, rol/izin, tenant ve app shell temellerini kurmak.

### Ana moduller
- Auth ve session
- RBAC (rol/izin)
- Tenant + tenant modules
- App shell (sol menu, header, tema)
- Temel ayarlar

### Tasinacak fikirler
- Auth guard + protected route yaklaşimi
- Light/dark tema ve kurumsal sade UI
- Kullanicilar ve roller sayfa iskeleti

### Yeniden yazilacak kisimlar
- Gelecekte mock auth katmani gercek token mekanizmasina gecirilecek
- Basit permission kontrolu policy motoruna tasinacak

### Beklenen cikti
- Calisan platform kabugu
- Login sayfasi
- Kullanicilar, roller, ayarlar iskeleti
- API tarafinda platform-core endpoint temel seti

---

## Faz 2: Urun / stok / fiyatlandirma

### Amac
Urun katalogu, depo bazli stok takibi ve esnek fiyatlandirma altyapisini devreye almak.

### Ana moduller
- Urun yonetimi
- Barkod/alias/QR kimlikleme
- Depo ve raf takibi
- Stok hareket ve rezervasyon
- Kur ve fiyat slot altyapisi

### Tasinacak fikirler
- 6 esnek fiyat slotu
- 4 esnek kategori alani
- Depo bazli stok ve lokasyon modeli

### Yeniden yazilacak kisimlar
- Ilk asamada sade tutulan urun karti UI'lari
- Gelecekte performans icin stok sorgu optimizasyonu

### Beklenen cikti
- Urun/stok sayfalari
- Fiyatlandirma konfigurasyon panelleri
- Siparis oncesi fiyat snapshot altyapisi

---

## Faz 3: Cariler / teklifler / siparisler

### Amac
Satis oncesi ve satis anini kapsayan cekirdek ticari akis modelini tamamlamak.

### Ana moduller
- Cari kart ve iliski yonetimi
- Teklif olusturma ve takip
- Tekliften siparise donusum
- Siparis satir ve kaynak plani

### Tasinacak fikirler
- Cariye ozel fiyat profili
- Teklif takip adimlari
- Siparisin depo/fabrika kaynak planina baglanmasi

### Yeniden yazilacak kisimlar
- Teklif editor deneyimi (ilk surumden sonra iyilestirme)
- Siparis satiri performans modeli

### Beklenen cikti
- Cari modulu uretim hazir
- Teklif->siparis donusum mekanizmasi
- Siparis merkezli operasyon baglanti noktasi

---

## Faz 4: Tahsilatlar / depo / teslimat / belgeler

### Amac
Siparis sonrasi finansal ve lojistik sureci uc uca izlenebilir hale getirmek.

### Ana moduller
- Tahsilat ve allocation
- Depo emirleri
- Teslimat planlama ve cikis
- Belge uretimi ve dagitimi

### Tasinacak fikirler
- Payment allocation ve payment reversal
- Teslimat-belge bagliligi
- Siparisten belgeye kadar tek zincir izleme

### Yeniden yazilacak kisimlar
- Belge template editorunun ilk versiyonu
- Depo operasyon ekranlarinin hiz odakli revizyonu

### Beklenen cikti
- Tahsilat dagitim mekanizmasi
- Depo->teslimat akislari
- Ticari belgelerin sistematik uretimi

---

## Faz 5: Workflow engine / task engine / dashboard gorev kartlari

### Amac
Operasyonel surecleri manuel takvimden cikarip workflow ve gorev merkezi uzerine tasimak.

### Ana moduller
- Workflow tanim ve calistirma
- Task atama ve takip
- Alert uretimi
- Dashboard kart/aksiyon mantigi

### Tasinacak fikirler
- Kart -> modal -> kayit navigasyonu
- Rol bazli gorev onceliklendirme
- Istisna yonetimi

### Yeniden yazilacak kisimlar
- Ilk task listesi UI'si, gercek is yukune gore optimize edilecek
- Workflow editorun detayli kural katmani

### Beklenen cikti
- Gorev Merkezi aktif kullanim
- Operasyonel sureclerde gorunurluk
- Gecikme ve istisna yonetimi

---

## Faz 6: Approval engine

### Amac
Kritik mutation islemlerini politika tabanli insan onayi ile guvenceye almak.

### Ana moduller
- Approval policies
- Approval kayitlari
- Onay kuyrugu ekranlari
- Domain aksiyon icra baglantisi

### Tasinacak fikirler
- Cift kontrollu onay senaryolari
- Rol bazli onay yetki matrisi
- Onay red gerekcesi ve audit izi

### Yeniden yazilacak kisimlar
- Baslangic policy setleri
- Onay ekranlarinin karar ergonomisi

### Beklenen cikti
- Kurumsal governance katmani
- Denetlenebilir karar kaydi
- AI ve WhatsApp mutation akislarina ortak kontrol noktasi

---

## Faz 7: WhatsApp gateway

### Amac
WhatsApp'i yalnizca mesajlasma kanali degil, operasyonel aksiyon tetikleyicisi olarak konumlandirmak.

### Ana moduller
- WhatsApp kontak ve konusma yonetimi
- Template ve kanal politikasi
- Action request akisi
- Domain kayit baglantilari

### Tasinacak fikirler
- Bayi self-service kanali
- Personel gorev mesajlari
- Yonetici komut/onay kanali

### Yeniden yazilacak kisimlar
- Ilk surum cevap kurallari
- Kanal bazli fallback stratejileri

### Beklenen cikti
- WhatsApp merkezli operasyon akislari
- Mesaj -> domain aksiyon koprusu
- Takip edilebilir mesaj teslim ve etki analizi

---

## Faz 8: ERP ve fabrika entegrasyonu

### Amac
Platformu dis sistemlerle cift yonlu ve denetlenebilir veri akisina kavuşturmak.

### Ana moduller
- ERP baglanti ve mapping
- Senkronizasyon loglama
- Fabrika stok snapshot ve siparis iletimi
- Hata/fallback ve tekrar deneme mekanizmalari

### Tasinacak fikirler
- Adapter tabanli entegrasyon katmani
- Entegrasyon olaylarinda unified log
- Domain tablolariyla kontrollu map stratejisi

### Yeniden yazilacak kisimlar
- Entegrasyon mapping UX'i
- Yuksek hacimli sync isleyicilerinin performans ayarlari

### Beklenen cikti
- ERP/fabrika bagli operasyon
- Senkronizasyon saglik paneli
- Daha dusuk manuel veri tasima maliyeti

---

## Faz 9: Lokal AI stack

### Amac
Yapay zekayi kurum ici veri guvenligi ve denetlenebilirlik hedefleriyle uyumlu lokal bir yigin uzerinde calistirmak.

### Ana moduller
- AI session/message yonetimi
- AI action proposal engine
- AI insight katmani
- Prompt governance ve context policy

### Tasinacak fikirler
- Varsayilan read-only AI
- Proposal tabanli mutation
- Approval ile zorunlu insan kontrolu

### Yeniden yazilacak kisimlar
- Erken prompt setleri
- Model secim ve routing stratejisi

### Beklenen cikti
- Lokal AI ile karar destek altyapisi
- AI kaynakli aksiyonlarda audit guvencesi
- Operasyon hizinda olculebilir artis

---

## Faz 10: Local Print & File Agent

### Amac
Kurumsal masaustu operasyonlarinda belge cikti, dosya kayit ve yerel cihaz entegrasyonlarini guvenli sekilde yonetmek.

### Ana moduller
- Local agent komut yurutme
- Print pipeline
- Dosya kayit ve arsivleme
- Onayli lokal aksiyon kontrolu

### Tasinacak fikirler
- Sunucudan gelen is emrinin lokal onayla calismasi
- Belge dagitim izleriyle birlesik izlenebilirlik
- Cihaz politikalarina uyumlu calisma

### Yeniden yazilacak kisimlar
- Agent dagitim/upgrade mekanizmasi
- Farkli ortamlarda yazici ve dosya yolu soyutlamasi

### Beklenen cikti
- Uc uca belge cikti sureci
- Yerel is akisi + merkezi audit birlikteligi
- Masaustu isletim beklentilerine uygun kurumsal deneyim

---

## Fazlar Arasi Basari Kriteri
Her fazin tamamlanmis sayilmasi icin:
1. Moduller calisir durumda olmali.
2. Yetki, onay ve audit etkisi dogrulanmali.
3. Dokumantasyon guncel tutulmali.
4. Sonraki fazin teknik onkosullari saglanmis olmali.

Bu kural, projenin hizli degil saglam buyumesini garanti etmek icin uygulanir.

