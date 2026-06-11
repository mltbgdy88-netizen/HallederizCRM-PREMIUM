# Bölüm B — Ticari ve destek modül listeleri

## Teslimatlar Operasyon Masası — `teslimatlar-operasyon-masasi-acik-mod.png`
**Route:** `/teslimatlar`, `/teslimatlar/liste`

**Bu ekran ne?** Sevkiyat ve saha teslimatlarının planlandığı ve tamamlandığı operasyon masasıdır.

**Gördüğü veriler:** Teslim no, cari, durum, belge; KPI; seçili kayıtta adres, şoför, doğrulama uyarıları.

**Yapabildiği işler:** Yeni/hızlı teslim, filtre, tamamlama, belge/etiket, dışa aktar.

**Tipik senaryo:** Lojistik geciken teslimi bulur, imza eksikliğini tamamlar.

**Kritik UI öğeleri:** KPI, liste + AKSİYON, sağ «Teslim Bağlamı».

---

## Teslimat Rota Masası — `teslimatlar-rota-operasyon-masasi-acik-mod.png`
**Route:** `/teslimatlar/rota`

**Bu ekran ne?** Günlük araç rotalarının planı ve durak takibidir.

**Gördüğü veriler:** Rota no, şoför, duraklar, mesafe; rota özeti ve timeline.

**Yapabildiği işler:** Yeni rota, harita, düzenleme, dışa aktar.

**Tipik senaryo:** 6 duraklı hatta 4. durağın gecikmesi yeniden planlanır.

**Kritik UI öğeleri:** Rota şeridi, şoför kartları, durak timeline.

---

## Fatura Operasyon Masası — `faturalar-operasyon-masasi-acik-mod.png`
**Route:** `/faturalar`, `/faturalar/liste`

**Bu ekran ne?** Kesilen ve vadesi geçen faturaların yönetim merkezidir.

**Gördüğü veriler:** Fatura no, cari, tutar, fatura/ödeme durumu; KPI.

**Yapabildiği işler:** Yeni fatura, PDF, tahsilat talebi, hatırlatma, iptal.

**Tipik senaryo:** Muhasebe vadesi geçeni süzer, hatırlatma ve kısmi ödeme girer.

**Kritik UI öğeleri:** Çift durum rozetleri, sağ belge/ödeme aksiyonları.

---

## İade Operasyon Masası — `iadeler-operasyon-masasi-acik-mod.png`
**Route:** `/iadeler`

**Bu ekran ne?** İade taleplerinin onay ve stok/finans etkisinin izlendiği masadır.

**Gördüğü veriler:** İade no, sipariş, cari, tutar, durum; stok etki özeti.

**Yapabildiği işler:** Yeni iade, onayla/reddet, not, dışa aktar.

**Tipik senaryo:** Hasarlı ruloda depo onaylar, stok artışını doğrular.

**Kritik UI öğeleri:** Satır Onayla/Reddet, sağ «İade Bağlamı».

---

## Depo Hazırlık Masası — `depo-hazirlik-masasi-acik-mod.png`
**Route:** `/depo`

**Bu ekran ne?** Sipariş fişlerinin raftan toplanıp sevke hazırlandığı hazırlık masasıdır.

**Gördüğü veriler:** Belge no, cari, durum, raf; bekleyen/hazırlanan KPI.

**Yapabildiği işler:** Toplama başlat, kontrol, sevke hazır, eksik listesi.

**Tipik senaryo:** 36 ruloluk fişte toplama başlatılır, eksik desen işaretlenir.

**Kritik UI öğeleri:** Durum sekmeleri, raf kolonu, kapasite çubuğu.

---

## Fabrika Stok Operasyon Masası — `fabrikalar-stok-operasyon-masasi-acik-mod.png`
**Route:** `/fabrikalar/stoklar`

**Bu ekran ne?** Fabrika stok ile CRM/ERP senkron sağlığının izlendiği entegrasyon masasıdır.

**Gördüğü veriler:** Ürün, fabrika mevcudu, senkron %, entegrasyon durumu.

**Yapabildiği işler:** Manuel senkron, eşleştir, hata inceleme, rapor.

**Tipik senaryo:** %80 senkronlu satır eşleştirilerek hizalanır.

**Kritik UI öğeleri:** Uyarı şeridi, entegrasyon rozetleri, sağ sağlık paneli.

---

## Fabrika Sipariş Operasyon Masası — `fabrikalar-siparis-operasyon-masasi-acik-mod.png`
**Route:** `/fabrikalar/siparisler`

**Bu ekran ne?** Satış siparişlerinin fabrika üretim emrine aktarım masasıdır.

**Gördüğü veriler:** Fabrika sipariş no, bağlı satış, üretim durumu, tutar.

**Yapabildiği işler:** Aktar, senkron, durum sekmeleri, hata geçmişi.

**Tipik senaryo:** Sorunlu üretimde kalite gecikmesi ERP loguyla eşleştirilir.

**Kritik UI öğeleri:** Bağlı satış kolonu, sağ senkron paneli.

---

## Belgeler Operasyon Masası — `belgeler-operasyon-masasi-acik-mod.png`
**Route:** `/belgeler`, `/belgeler/liste`, `/belgeler/arsiv`

**Bu ekran ne?** Ticari belgelerin yüklendiği ve arşivlendiği merkezdir.

**Gördüğü veriler:** Belge no, tür, cari, durum; önizleme ve geçmiş.

**Yapabildiği işler:** Yükle, arşivle, paylaş, sil, filtre.

**Tipik senaryo:** İmzalı irsaliye yüklenir ve etiketlenir.

**Kritik UI öğeleri:** Tür kolonu, önizleme, aktivite geçmişi.

---

## Görevler Operasyon Masası — `gorevler-operasyon-masasi-acik-mod.png`
**Route:** `/gorevler`

**Bu ekran ne?** Operasyon görevlerinin atanıp tamamlandığı görev masasıdır.

**Gördüğü veriler:** Başlık, atanan, öncelik, vade; checklist.

**Yapabildiği işler:** Yeni görev, tamamla, takvim, filtre.

**Tipik senaryo:** Geciken stok sayımı checklist ile kapatılır.

**Kritik UI öğeleri:** Öncelik rozetleri, sağ checklist paneli.

---

## Kullanıcılar Operasyon Masası — `kullanicilar-operasyon-masasi-acik-mod.png`
**Route:** `/kullanicilar`

**Bu ekran ne?** CRM kullanıcı hesap ve rol özetinin yönetildiği masadır.

**Gördüğü veriler:** Ad, rol, son giriş, durum; yetki özeti.

**Yapabildiği işler:** Yeni kullanıcı, parola sıfırla, filtre.

**Tipik senaryo:** Yeni depo sorumlusuna rol atanır.

**Kritik UI öğeleri:** Rol rozetleri, sağ yetki listesi.

---

## Rol ve Yetki Matrisi — `kullanicilar-roller-matris-acik-mod.png`
**Route:** `/kullanicilar/roller`

**Bu ekran ne?** Rollerin modül bazında erişim matrisidir.

**Gördüğü veriler:** Rol × modül tam/kısıtlı/yok hücreleri.

**Yapabildiği işler:** Matris düzenleme, şablon, dışa aktar.

**Tipik senaryo:** Satış rolüne ayarlar modülü kapatılır.

**Kritik UI öğeleri:** Renk efsanesi, geniş matris tablosu.

---

## ERP Entegrasyon Masası — `erp-entegrasyon-masasi-acik-mod.png`
**Route:** `/erp`

**Bu ekran ne?** ERP bağlantı kuyruğu ve hatalarının izlendiği teknik merkezdir.

**Gördüğü veriler:** Olay tipi, durum, zaman; bağlantı sağlığı.

**Yapabildiği işler:** Yeniden dene, kuyruk sekmeleri, rapor.

**Tipik senaryo:** SAP fatura aktarım hatası retry edilir.

**Kritik UI öğeleri:** Hata kuyruğu, çevrimiçi rozetleri.

---

## Ayarlar Hub — `ayarlar-hub-acik-mod.png`
**Route:** `/ayarlar`, `/ayarlar/*`

**Bu ekran ne?** Ayar alt modüllerine giden kart menüsü hub’ıdır.

**Gördüğü veriler:** Genel, kullanıcı, entegrasyon, WA, AI, onay, yazdırma kartları.

**Yapabildiği işler:** İlgili alt sayfaya geçiş.

**Tipik senaryo:** Sezon öncesi WA ve onay limitleri sırayla açılır.

**Kritik UI öğeleri:** Yedi kartlı grid.

---

## Onay Kuralları Matrisi — `onaylar-kurallar-matris-acik-mod.png`
**Route:** `/onaylar/kurallar`, `/onaylar/limitler`

**Bu ekran ne?** İşlem tipine göre onay eşik ve rol kurallarının tanımlandığı matristir.

**Gördüğü veriler:** Kural adı, limit, rol, onay adedi, aktif/pasif.

**Yapabildiği işler:** Yeni kural, toggle, kopyala, detay paneli.

**Tipik senaryo:** %20 üzeri iskontoda genel müdür onayı tanımlanır.

**Kritik UI öğeleri:** Kural KPI, satır toggle, sağ detay.
