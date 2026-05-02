# HALLEDERIZ CRM - EKRAN BAZLI BACKLOG

Bu dokuman:

- UI tasarimina gore yapilacak isleri parcalara boler.
- Cursor / AI ile gelistirme icin referans saglar.
- Her ekrani moduler gelistirmeye uygun hale getirir.

## Genel prensipler

- Tum aksiyon butonlari basarili islemden sonra toast mesaj gostermelidir.
  - Ornekler: `Kaydedildi`, `Silindi`, `Gonderildi`, `Onaylandi`, `Reddedildi`.
- Basarili mutation sonrasi ilgili buton pasif hale gelmelidir.
  - Amac: mukerrer kayit, ikinci kez gonderim ve tekrarli hata uretimini engellemek.
- Tum liste ekranlari kompakt ve okunabilir olmalidir.
  - Hedef: masaustu gorunumde en az 20 satir gorunebilir.
- Liste satirina tiklaninca belge / kayit detayi modal olarak acilmalidir.
- Modal alt aksiyon bolumunde ilgili isleme gore `Duzenle`, `Sil`, `Kaydet`, `Gonder`, `Onayla`, `Reddet` gibi butonlar yer almalidir.
- AI etkilesim kolonu sadece ana sayfa / gosterge panelinde bulunmalidir.
- AI ayarlari `Ayarlar` sayfasi altinda yer almalidir.
- Sol menude asagi dogru acilan arsiv alt menusu kullanilmayacaktir.
- `Arsiv` tiklandiginda arsiv kategorileri orta icerik alaninda iri yatay butonlar olarak gosterilecektir.

## Temel rota haritasi

| Menu | Route | Sayfa amaci |
| --- | --- | --- |
| Gosterge Paneli | `/dashboard` | Gunluk operasyon kontrol merkezi |
| Hizli Islem | `/quick-actions` | Yeni operasyon baslatma merkezi |
| Onaylar | `/approvals` | Riskli islemleri onaylama / reddetme |
| WhatsApp | `/whatsapp` | Musteri mesajlari ve AI destekli iletisim |
| Cariler | `/customers` | Musteri / cari kartlari |
| Urun / Stok | `/inventory` | Urun, stok ve depo gorunumu |
| Arsiv | `/archive` | Gecmis islemler ve belge arsivi |
| Raporlar | `/reports` | Satis, tahsilat, stok ve operasyon raporlari |
| Ayarlar | `/settings` | Kullanici, yetki, entegrasyon ve AI ayarlari |

---

# 1. Gosterge Paneli (`/dashboard`)

## Amac

Ana sayfa, gunluk operasyon kontrol merkezi olarak calisir. AI etkilesim kolonu yalnizca bu sayfada gorunur.

## Bolgeler

- Sol sidebar
- Top header
- KPI kartlari
- Gorev / onay / tahsilat panelleri
- Gunluk ozet
- Son islemler
- Hizli islem baslat kartlari
- Sag AI Asistan kolonu

## Yapilacaklar

- [ ] Ust KPI kartlari
  - Bugunku ciro
  - Bekleyen tahsilat
  - WhatsApp talepleri
  - Onay bekleyen
  - Stok riski olan
- [ ] One cikan gorevler karti
- [ ] Onay bekleyen islemler listesi
- [ ] Tahsilat bekleyen listesi
- [ ] Gunluk ozet widget'i
- [ ] Son islemler feed'i
- [ ] Hizli islem kartlari
- [ ] Sag AI panel
  - Video oynatabilen ust ekran
  - AI sohbet alani
  - Sesli konusma alani

## AI panel notlari

- Ust bolum kucuk bir video ekrani gibi tasarlanmalidir.
- Avatar alanindan ziyade `video-capable display` hissi vermelidir.
- Play button, timeline, ses / ekran ikonlari gibi video kontrol ipuclari olabilir.
- AI chat ve voice bolumleri bu video ekraninin altinda devam etmelidir.

---

# 2. Hizli Islem (`/quick-actions`)

## Amac

Yeni operasyonlarin baslatildigi ana is uretim merkezi.

## Ana aksiyonlar

- Siparis olustur
- Fiyat ver
- Stok sorgula
- Tahsilat isle
- Iade baslat
- Cari ac
- Belge gonder

## Sayfa yapisi

- Ustte hizli islem kategori kartlari
- Ortada secilen isleme gore form / wizard
- Sagda veya altta islem ozeti
- Alt bolumde kaydet / onaya gonder / iptal aksiyonlari

## Modal / form kurallari

- Basarili `Kaydet` sonrasi toast: `Kaydedildi`.
- Basarili `Gonder` sonrasi toast: `Gonderildi`.
- Basarili buton pasif hale gelir.
- Riskli islemler dogrudan uygulanmaz; approval ticket'a gider.

---

# 3. Onaylar (`/approvals`)

## Amac

Riskli operasyonlarin, AI planlarinin ve kritik mutation'larin onay merkezi.

## Sayfa yapisi

- Ust KPI kartlari
  - Bekleyen onay
  - Kritik onay
  - Bugun onaylanan
  - Reddedilen
- Filtreler
  - Risk seviyesi
  - Islem tipi
  - Talep eden
  - Tarih araligi
- Kompakt tablo / liste
  - En az 20 satir gorunebilir

## Satir tiklama

Satir tiklaninca modal acilir:

- Onay detaylari
- Risk aciklamasi
- AI plan ozeti varsa gosterim
- Ilgili belge / kayit referansi
- Audit gecmisi

## Aksiyonlar

- Onayla
- Reddet
- Incelemeye al

## UX kurallari

- `Onayla` basariliysa toast: `Onaylandi`.
- `Reddet` basariliysa toast: `Reddedildi`.
- Basarili aksiyon sonrasi ilgili butonlar pasif olur.

---

# 4. WhatsApp (`/whatsapp`)

## Amac

Musteri mesajlarini yonetmek, AI destekli cevap taslagi almak ve gerekirse isleme donusturmek.

## Sayfa yapisi

- Sol veya orta-sol musteri / sohbet listesi
- Orta chat alani
- Sag detay paneli
  - Musteri bilgisi
  - Cari bakiye
  - Son siparisler
  - AI onerileri

## Ozellikler

- Mesaj yaz
- Hazir cevap sec
- AI cevap taslagi al
- Konusmadan siparis / teklif / tahsilat hatirlatmasi baslat

## Kurallar

- AI dogrudan mesaj gondermez.
- AI taslak uretir, gonderim policy + approval + outbox akisi ile ilerler.
- `Gonder` basariliysa toast: `Gonderildi` ve buton pasif olur.

---

# 5. Cariler (`/customers`)

## Amac

Musteri / cari kartlarinin listelenmesi, aranmasi ve detaylarinin incelenmesi.

## Sayfa yapisi

- Ust ozet kartlari
  - Toplam cari
  - Riskli cari
  - Alacak bakiyesi
  - Vadesi gecen
- Arama ve filtreler
- Kompakt tablo
  - En az 20 satir

## Satir tiklama

Cari detay modal'i acilir:

- Cari bilgileri
- Iletisim bilgileri
- Bakiye ozeti
- Son siparisler
- Son tahsilatlar
- WhatsApp gecmisi

## Aksiyonlar

- Duzenle
- Sil
- Siparis olustur
- Tahsilat hatirlat

## UX kurallari

- Kaydetme sonrasi toast: `Kaydedildi`.
- Silme sonrasi toast: `Silindi`.
- Silme gibi kritik islemlerde confirmation gerekir.

---

# 6. Urun / Stok (`/inventory`)

## Amac

Urunleri, stok durumunu, kritik stoklari ve depo bazli hareketleri yonetmek.

## Sayfa yapisi

- Ust KPI kartlari
  - Toplam urun
  - Kritik stok
  - Depo sayisi
  - Bugunku stok hareketi
- Urun / stok listesi
- Filtreler
  - Depo
  - Kategori
  - Kritik stok
  - Barkod / urun kodu

## Satir tiklama

Urun detay modal'i acilir:

- Urun bilgileri
- Stok seviyesi
- Depo dagilimi
- Son stok hareketleri
- Fiyat bilgisi

## Aksiyonlar

- Duzenle
- Stok hareketi ekle
- Sil
- Fiyat ver

---

# 7. Arsiv (`/archive`)

## Amac

Gecmis islemler ve belgelerin tek merkezden incelenmesi.

## Onemli tasarim karari

Sol menude arsiv alt menusu acilmayacak. `Arsiv` tek menu item olarak kalacak.

Arsiv sayfasinda, orta icerik alaninin ustunde iri yatay kategori butonlari yer alacak:

- Teklifler
- Siparisler
- Tahsilatlar
- Teslimatlar
- Iadeler
- Faturalar
- Belgeler

## Sayfa yapisi

- Ustte kategori butonlari
- Secili kategori vurgulanir
- Altinda kompakt tablo / liste
- En az 20 satir gorunur
- Pagination veya sanal listeleme olabilir

## Tablo kolonlari

- Belge no
- Tarih
- Musteri
- Tutar
- Durum
- Islem / uc nokta menu

## Satir tiklama

Belge detay modal'i acilir:

- Belge basligi
- Musteri / cari bilgileri
- Belge bilgileri
- Satir kalemleri
- Toplamlar
- Audit / islem gecmisi

## Modal alt aksiyonlari

- Duzenle
- Sil
- Gonder / Yazdir / Indir gibi belge tipine gore aksiyonlar

## UX kurallari

- `Duzenle` sonrasi degisiklik modal/form icinde yapilabilir.
- `Sil` basariliysa toast: `Silindi`.
- Basarili aksiyon sonrasi ilgili buton pasif hale gelir.

---

# 8. Raporlar (`/reports`)

## Amac

Yoneticiler icin satis, tahsilat, stok ve operasyon raporlarini sunmak.

## Sayfa yapisi

- Tarih araligi filtresi
- Rapor tipi secimi
- KPI kartlari
- Grafik alani
- Tablo alani

## Rapor tipleri

- Satis raporu
- Tahsilat raporu
- Stok raporu
- Iade raporu
- WhatsApp performans raporu
- AI operasyon raporu

## Aksiyonlar

- Rapor olustur
- PDF indir
- Excel indir
- E-posta gonder

## UX kurallari

- Rapor olusturma basariliysa toast: `Rapor olusturuldu`.
- Indirme/gonderme basariliysa uygun toast gosterilir.

---

# 9. Ayarlar (`/settings`)

## Amac

Sistem, kullanici, entegrasyon ve AI ayarlarinin merkezi.

## Alt bolumler

- Genel ayarlar
- Kullanici / roller
- Bildirim ayarlari
- Yapay zeka ayarlari
- Entegrasyonlar
- Guvenlik

## Yapay zeka ayarlari

AI ayarlari ana menude ayri bir menu olarak yer almaz. Ayarlar icinde bulunur.

Icerik:

- AI provider secimi
- Local AI endpoint
- Model bilgisi
- Voice / STT / TTS ayarlari
- AI policy limitleri
- Approval gerektiren AI islem tipleri

## UX kurallari

- Kaydet basariliysa toast: `Kaydedildi`.
- Basarisizsa net hata mesaji gosterilir.

---

# Reusable component backlog

## Layout

- [ ] App shell
- [ ] Sidebar
- [ ] Topbar
- [ ] Page container
- [ ] Right AI panel sadece dashboard icin

## UI components

- [ ] KPI card
- [ ] List card
- [ ] Compact table
- [ ] Archive category button
- [ ] Modal / drawer
- [ ] Toast system
- [ ] Confirm dialog
- [ ] Disabled-after-success button state
- [ ] Empty state
- [ ] Loading skeleton

## Data / UX patterns

- [ ] Mutation success toast
- [ ] Duplicate prevention state
- [ ] Row click detail modal
- [ ] Compact 20-row table layout
- [ ] Filter bar
- [ ] Pagination

---

# Gelistirme sirasi onerisi

## Faz 1 - UI shell

- App shell
- Sidebar
- Topbar
- Dashboard layout
- Toast system
- Modal system

## Faz 2 - Ana sayfa

- Dashboard kartlari
- Sag AI panel
- Hizli islem baslat kartlari
- Son islemler

## Faz 3 - Operasyon sayfalari

- Hizli Islem
- Onaylar
- WhatsApp

## Faz 4 - Veri sayfalari

- Cariler
- Urun / Stok

## Faz 5 - Arsiv

- Arsiv kategori butonlari
- 20 satirlik kompakt liste
- Belge detay modal'i

## Faz 6 - Raporlar ve Ayarlar

- Raporlar
- Kullanici / rol ayarlari
- Yapay zeka ayarlari
- Entegrasyon ayarlari

---

# Cursor icin kullanim notu

Cursor'a ekran tasarimi verilirken su dosyalar birlikte referans verilmelidir:

- `crm-ui-blueprint.md`
- `crm-backlog.md`
- `cursor-screen-prompt.md`
- `reference-dashboard-v1.png`

Ilk uygulama onceligi:

1. App shell ve sidebar
2. Dashboard / Gosterge Paneli
3. Toast + modal altyapisi
4. Arsiv ekran yapisi
5. Diger sayfalar
