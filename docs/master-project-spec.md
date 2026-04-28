# HallederizCRM-PREMIUM Master Project Spec

## 1. Dokumanin Amaci ve Kapsami
Bu dokuman, HallederizCRM-PREMIUM projesinin resmi baslangic referansidir. Amaci, urun vizyonunu, cekirdek prensipleri ve platform sinirlarini netlestirerek ekiplerin ayni teknik ve urunsel dilden ilerlemesini saglamaktir.

Bu metin:
- Urunun ne oldugunu ve ne olmadigini tanimlar.
- Mimari ve modul kararlarini yonlendirir.
- Veri, otomasyon, entegrasyon ve yapay zeka yaklasimlarina ortak zemin olusturur.
- Yol haritasi ve uygulama ayrintilari icin ust seviye sozlesme gorevi gorur.

## 2. Urun Tanimi
HallederizCRM-PREMIUM; duvar kagidi sektoru icin gelistirilen, CRM cekirdegi, operasyon motoru, fabrika ve ERP entegrasyonlari, WhatsApp otomasyonu, insan onayli lokal yapay zeka, belge uretimi ve rol bazli mobil kullanim iceren cok kiracili bir platformdur.

Platformun hedefi yalnizca kayit tutan bir CRM olmak degil; tekliften tahsilata, depodan teslimata, iletisimden belgeye kadar tum ticari ve operasyonel zinciri tek sistemde orkestre etmektir.

## 3. Ana Prensipler
Platformun tum teknik ve urunsel kararlarinda asagidaki prensipler baglayicidir:

1. Kanonik veri kaynagi PostgreSQL'dir.
2. Sistem web tabanlidir ancak masaustu uygulama gibi kullanilacak sekilde tasarlanir.
3. On yuz sade, tutarli ve hizli; arka plan islem motoru guclu, olceklenebilir ve denetlenebilir olacaktir.
4. Yapay zeka varsayilan olarak read-only calisir; dogrudan mutation yapmaz.
5. Mutation etkisi ureten islemler insan onay adimindan gecer.
6. WhatsApp akislarinda hybrid workflow (kural + AI + fallback rules) kullanilir.
7. Mimari bastan multi-tenant olarak tasarlanir; sonradan eklenen bir ozellik olarak ele alinmaz.

## 4. Cekirdek Moduller
Platform cekirdegi asagidaki ana modul aileleri uzerine kurulur:

1. Platform Core
- Kimlik dogrulama, oturum, rol ve izin yonetimi
- Tenant ve tenant modulu yonetimi
- Global ayarlar, tema, sistem parametreleri

2. Cekirdek CRM
- Cari, iletisim, adres, hesap ve fiyatlandirma profili
- Musteri iliski takibi ve ticari gecmis baglami

3. Urun ve Stok
- Marka, koleksiyon, urun varyanti
- Barkod, alias ve QR ile urun kimlikleme
- Depo bazli stok, raf ve hareket kayitlari

4. Ticari Akis
- Teklif, siparis, tahsilat, depo emri, teslimat, fatura, iade
- Fiyat snapshot, kaynak plani, tahsilat dagitim (allocation)

5. Operasyon Motoru
- Workflow instance/step
- Gorev (task), yorum, uyari ve onay mekanizmalari

6. Entegrasyon ve Otomasyon
- ERP ve fabrika baglantilari
- WhatsApp kanal yonetimi ve aksiyon talepleri
- Belge uretim ve dagitim zinciri

7. Yapay Zeka Katmani
- Lokal model orkestrasyonu
- Proposal uretimi, onay kaydi, server-side execution
- Icerik analizi, oneriler, audit izi

## 5. Operasyon ve Otomasyon Yaklasimi
Sistem, operasyonel isleri manuel takipten cikarip izlenebilir gorev akislarina cevirir.

Temel yaklasim:
- Her kritik is adimi workflow step olarak temsil edilir.
- Kullaniciya is listesi yerine onceliklendirilmis gorev merkezi sunulur.
- Otomasyonlar tetiklenebilir, durdurulabilir ve geri izlenebilir olur.
- Uyari ve istisna yonetimi ilk sinif vatandas olarak ele alinir.

Otomasyon seviyeleri:
1. Kural tabanli otomasyon
2. Kural + AI destekli onerili otomasyon
3. AI proposal + insan onayi + kontrollu icra

## 6. Entegrasyonlar
Entegrasyonlar bagimsiz adapter mantigi ile ele alinir; cekirdek domain entegrasyon teknolojisine bagimli olmaz.

Ana entegrasyon alanlari:
- ERP: cari, urun, stok, siparis, fatura ve finansal senkronizasyon
- Fabrika: anlik stok gorunurlugu, siparis iletimi, durum geri bildirimleri
- WhatsApp: musteri, personel ve yonetici akislarinin kanal bazli yonetimi
- Belge iletimi: PDF/rapor ciktilarinin paylasimi ve teslim kayitlari

Her entegrasyon icin:
- Mapping katmani
- Senkronizasyon loglari
- Hata/fallback stratejisi
- Tekrar deneme ve operator mudahalesi mekanizmasi bulunur.

## 7. Yapay Zeka Yaklasimi
Platformdaki AI kullanimi, karar destek ve operasyon hizlandirma odaklidir; kontrolsuz otomasyon degildir.

Ilkeler:
1. AI varsayilan read-only davranir.
2. AI tarafindan onerilen domain aksiyonlari proposal olarak uretilir.
3. Proposal, approval policy'ye gore insan onayina sunulur.
4. Onaylanan aksiyonlar server-side ve audit izli sekilde calistirilir.
5. Reddedilen veya supersede edilen oneriler kayit altinda tutulur.

Hedeflenen faydalar:
- Personelin karar kalitesini arttirmak
- Operasyon hizini yukseltmek
- Kurumsal denetlenebilirlikten odun vermemek

## 8. Belge ve Cikti Sistemi
Belge sistemi, ticari sureclerin resmi cikti katmanidir.

Kapsam:
- Teklif, siparis, teslimat, fatura ve iade baglamli belgeler
- PDF/print ve dijital arsivleme
- Belge dagitim kanali kayitlari (kime, ne zaman, hangi kanaldan)
- Belge surumleri ve tekrar uretim izi

Prensip:
- Her belge bir domain kaydina bagli uretilir.
- Her dagitim eylemi ayri bir iz kaydina donusur.
- Belge sureci audit ve timeline uzerinden izlenebilir olur.

## 9. Multi-Tenant ve Paketleme Yaklasimi
Multi-tenant yaklasim platformun temelidir.

### 9.1 Tenant Izolasyonu
- Tenant kimligi tum domain varliklarinda baglamsal olarak mevcuttur.
- Erisim kontrolu tenant + rol + izin bileşimi ile calisir.
- Ortak kod tabani kullanilir, tenant verisi lojik olarak ayrilir.

### 9.2 Tenant Module Modeli
- Her tenant icin aktif/pasif modul seti tanimlanir.
- Modul bazli acma-kapama ve konfigurasyon desteklenir.
- Lisanslama/paketleme bu katman uzerinden yonetilir.

### 9.3 Paketleme Stratejisi
Ornek paketleme:
1. Core Paket: platform + temel CRM
2. Operations Paket: siparis, depo, teslimat, belgeler
3. Automation Paket: WhatsApp, workflow, gorev motoru
4. Intelligence Paket: AI proposal ve onayli aksiyon akislar

## 10. Baslangicta Bilincli Olarak Disarida Tutulanlar
Asagidaki alanlar bu dokumanin kapsaminda stratejik seviyede tanimlanir ancak implementasyon detayi bu asamada hedeflenmez:
- Marka/kurum ozel custom ekranlar
- Ileri seviye raporlama ve BI urunlestirme
- Gelismis mobil offline senaryolari
- Tenant bazli ileri duzey no-code konfigurasyon

Bu alanlar roadmap fazlarinda olgunlastirilir.

