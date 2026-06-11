# Referans görsel — sayfa rehberi (kullanıcı senaryoları)

**Amaç:** Kodlamadan önce her PNG'nin işlevini, kullanıcı eylemlerini ve veri bağlamını netleştirmek.  
**Görseller:** `docs/design/reference/` · **Katalog:** [UI_REFERENCE_CATALOG.md](UI_REFERENCE_CATALOG.md) · **Zip paket:** `docs/design/export/HallederizCRM-Referans-Gorseller.zip`

## İçindekiler

| Bölüm | Kapsam | Ekran sayısı |
|-------|--------|--------------|
| [A](#bölüm-a--onaylı-çekirdek--çekirdek-liste-masaları) | Stok, arşiv, rapor, WA + teklif/sipariş/cari/tahsilat listeleri | 8 |
| [B](#bölüm-b--ticari-ve-destek-modül-listeleri) | Teslimat, fatura, iade, depo, fabrika, belge, görev, kullanıcı, ERP, ayar, onay kuralları | 14 |
| [C](#hallederizcrm--cari-ve-sipariş-detay--katman-referansı) | Cari + sipariş detay kök ve katman sekmeleri | 19 |
| [D](#bölüm-d--teklif-detaykatman-komut-masaları-diğer-detaylar-formlar-sistem) | Teklif detay/katman, dashboard, hızlı işlem, onay, AI, diğer detay/form/sistem | 35 |

**Toplam:** 76 katalog PNG (her biri aşağıda bir başlık altında).

> **AI:** Öneri/taslak üretir; doğrudan mutation yapmaz. **Onaylı işlemler** backend policy + insan onayından geçer.

---


---

# Bölüm A — Onaylı çekirdek + çekirdek liste masaları

## Stok Operasyon Masası — `stok-operasyon-masasi-acik-mod.png`
**Route:** `/stok`

**Bu ekran ne?**
Merkez, fabrika, depo ve raf bazında ürün stoklarının izlendiği ana envanter operasyon masasıdır.

**Gördüğü veriler:**
- Toplam ürün, kritik stok, lokasyon özetleri, fiyat grubu sayısı
- Ürün kodu, merkez/fabrika/raf stokları, birim fiyat, durum
- Seçili üründe barkod, marka, kategori, rezerv, raf kapasitesi

**Yapabildiği işler:**
- Yeni ürün, stok hareketi, transfer; filtreleme ve arama
- Satırda detay/stok/etiket; sağ panelden etiket ve transfer

**Tipik senaryo:**
Depo sorumlusu kritik stok KPI’sına bakar, fabrikada düşen deseni bulur, transfer talebi veya etiket basımı yapar.

**Kritik UI öğeleri:**
KPI şeridi, filtre bandı, liste + AKSİYON kolonu, sağ «Stok Bağlamı».

---

## Arşiv Operasyon Merkezi — `arsiv-operasyon-merkezi-acik-mod.png`
**Route:** `/archive`

**Bu ekran ne?**
Geçmiş ticari belgelerin ve denetim izinin arandığı merkezi arşivdir.

**Gördüğü veriler:**
- Kayıt no, cari, işlem türü, tarih, onay durumu, sorumlu
- Seçili belgede dosya meta, etiketler, denetim izi

**Yapabildiği işler:**
- Belge yükleme, indirme, dışa aktarma; tür/durum/tarih filtreleri
- Görüntüleme, bağlantı kopyalama, arşiv notu

**Tipik senaryo:**
Muhasebe geçmiş ay faturasını bulur, onay geçmişini doğrular, belgeyi indirir.

**Kritik UI öğeleri:**
KPI, kategori sekmeleri, liste, sağ «Arşiv Bağlamı».

---

## Rapor Operasyon Merkezi — `rapor-operasyon-merkezi-acik-mod.png`
**Route:** `/raporlar`

**Bu ekran ne?**
Ciro, tahsilat, stok ve kanal KPI’larının hedef–gerçekleşen tablosuyla izlendiği rapor merkezidir.

**Gördüğü veriler:**
- Üst metrikler, dönem karşılaştırması, performans tablosu
- Seçili metrikte ilerleme ve AI öneri notları (salt okunur)

**Yapabildiği işler:**
- Sekme ve dönem filtreleri; PDF/Excel; özel rapor tanımı

**Tipik senaryo:**
Yönetici açık bakiye artışını görür, AI önerisini okuyup tahsilat ekibine yönlendirir.

**Kritik UI öğeleri:**
KPI, filtre, metrik listesi, sağ «Rapor Bağlamı».

---

## WhatsApp Operasyon Paneli — `whatsapp-operasyon-paneli-acik-mod.png`
**Route:** `/whatsapp`

**Bu ekran ne?**
Bayi WhatsApp yazışmalarının SLA ve onay kurallarıyla yönetildiği omnichannel panelidir.

**Gördüğü veriler:**
- Bekleyen, okunmamış, SLA aşım sayıları; konuşma listesi
- Seçili görüşmede özet, AI taslak yanıtlar (öneri)

**Yapabildiği işler:**
- Şablon mesaj, onaylı gönderim, filtreleme, belge ekleme

**Tipik senaryo:**
Operasyon SLA aşımını filtreler, stok sorusuna yanıt verir, fiyat mesajını onaya bırakır.

**Kritik UI öğeleri:**
KPI, filtre, liste + AKSİYON, sağ «Konuşma Bağlamı».

---

## Teklifler Operasyon Masası — `teklifler-operasyon-masasi-acik-mod.png`
**Route:** `/teklifler`, `/teklifler/liste`

**Bu ekran ne?**
Tekliflerin listelendiği, durum ve dönüşümün izlendiği satış operasyon masasıdır.

**Gördüğü veriler:**
- Açık/cevap bekleyen adetler, aylık hacim, dönüşüm %
- Teklif no, cari, tutar, durum, geçerlilik; sağ panel uyarıları

**Yapabildiği işler:**
- Yeni/hızlı teklif, filtre, düzenle, e-posta, takip, dışa aktar

**Tipik senaryo:**
Temsilci cevap bekleyen teklifleri süzer, süresi dolan için revizyon açar.

**Kritik UI öğeleri:**
KPI, filtre, liste + AKSİYON, sağ «Teklif Bağlamı».

---

## Siparişler Operasyon Masası — `siparisler-operasyon-masasi-acik-mod.png`
**Route:** `/siparisler`, `/siparisler/liste`

**Bu ekran ne?**
Kesinleşmiş siparişlerin teslimat ve ödeme aşamasında yönetildiği merkez masadır.

**Gördüğü veriler:**
- Açık sipariş, teslimat bekleyen, riskli sayıları; sipariş satırları
- Seçili siparişte ödeme, kalem, toplamlar

**Yapabildiği işler:**
- Yeni sipariş, sevkiyat, fatura, mesaj; filtre ve dışa aktar

**Tipik senaryo:**
Operasyon teslimat bekleyenleri seçer, sevkiyat başlatır, riskli cariye hatırlatır.

**Kritik UI öğeleri:**
KPI, filtre, durum rozetleri, sağ «Sipariş Bağlamı».

---

## Cariler Operasyon Masası — `cariler-operasyon-masasi-acik-mod.png`
**Route:** `/cariler`, `/cariler/liste`

**Bu ekran ne?**
Bayi ve proje müşterilerinin bakiye, risk ve limit bilgilerinin yönetildiği cari masasıdır.

**Gördüğü veriler:**
- Toplam/aktif cari, riskli bakiye, limit aşımı
- Cari kodu, unvan, şehir, bakiye, risk; sağda limit ve vade

**Yapabildiği işler:**
- Yeni cari, tahsilat, ekstre; arama ve risk filtresi

**Tipik senaryo:**
Tahsilat yüksek riskli cariyi seçer, vadesi geçeni görür, tahsilat kaydı açar.

**Kritik UI öğeleri:**
KPI, filtre, liste + AKSİYON, sağ «Cari Bağlamı».

---

## Tahsilatlar Operasyon Masası — `tahsilatlar-operasyon-masasi-acik-mod.png`
**Route:** `/tahsilatlar`, `/tahsilatlar/liste`

**Bu ekran ne?**
Tahsilat kayıtları ve vadesi geçen alacakların takip edildiği finans masasıdır.

**Gördüğü veriler:**
- Bugün tahsilat, bekleyen, vadesi geçen KPI’ları
- Makbuz no, müşteri, tutar, durum, tarih

**Yapabildiği işler:**
- Yeni/hızlı tahsilat, hatırlatma, onay, yazdır, dışa aktar

**Tipik senaryo:**
Finans vadesi geçeni süzer, hatırlatma gönderir, havaleyi onaylar.

**Kritik UI öğeleri:**
KPI, filtre, liste + AKSİYON, sağ «Tahsilat Bağlamı».

---

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

---

# HallederizCRM — Cari ve Sipariş detay / katman referansı

Kaynak PNG'ler: `docs/design/reference/*-acik-mod.png`  
Route sözleşmesi: `apps/web/src/features/ui-inventory/utils/entity-layer-nav.ts`

---

## Detay kök ile katman sekmesi

| Kavram | Route örneği | Ne değişir? |
|--------|----------------|-------------|
| **Detay kök** | `/cariler/{customerId}`, `/siparisler/{orderId}` | Entity kabuğu: üst başlık (ünvan/no, durum rozeti), `EntityLayerNav` içinde **Detay** sekmesi aktif, orta alan “masa” görünümü. |
| **Katman sekmesi** | `/cariler/{customerId}/finans`, `/siparisler/{orderId}/satirlar` | Aynı kabuk ve sekme çubuğu kalır; yalnızca orta gövde + sağ **Bağlam** paneli katmana göre değişir. |
| **Liste** | `/cariler`, `/siparisler` | Entity seçilmeden önceki operasyon masası; bu dokümanın kapsamı dışındadır. |

Kısa kural: **Kök = kimlik + hızlı operasyon masası; katman = tek konuya derinlemesine bakış** (finans, satırlar, teslimat vb.). Sekmeler arası geçiş tam sayfa yenilemesi değil, aynı entity altında route değişimidir.

---

# CARİLER

## Cari Detay Masası — `cariler-detay-masasi-acik-mod.png`

**Route:** `/cariler/{customerId}`

**Bu ekran ne?**  
Seçili carinin detay **kök** ekranıdır. Operasyon masası düzeninde üst KPI, katman sekmeleri ve özet gövde bir arada sunulur.

**Gördüğü veriler:**  
Cari ünvanı, kod, vergi bilgisi, durum (Aktif), iletişim özeti, risk/limit KPI'ları, performans özeti, uyarılar ve sonraki adımlar.

**Yapabildiği işler:**  
Cari düzenleme, yeni işlem başlatma (+ Yeni İşlem), katman sekmelerine geçiş, uyarı ve görev takibi.

**Tipik senaryo:**  
Kullanıcı listeden cariyi açar; önce kök detayda genel durumu görür, ardından Finans veya Siparişler katmanına gider.

**Kritik UI öğeleri:** Entity header (avatar/ünvan, durum rozeti), `EntityLayerNav` (**Detay** aktif), üst KPI şeridi, kart grid'i.

---

## Cari Özet Katmanı — `cariler-katman-ozet-acik-mod.png`

**Route:** `/cariler/{customerId}/ozet`

**Bu ekran ne?**  
Cariye ait 360° **özet katmanı**dır. Kök detaydan daha kart odaklı; finans ve ilişkili kayıt önizlemeleri öne çıkar.

**Gördüğü veriler:**  
Kimlik ve adres, risk limiti, açık bakiye (vadesi geçmiş vurgusu), yıllık alış/tahsilat, açık sipariş; alt sekmeli ilgili kayıtlar (fatura, teklif, sipariş, tahsilat, iletişim).

**Yapabildiği işler:**  
Özet metrikleri okuma, ilgili kayıt listesinde gezinme, sağ panel kısayollarıyla hızlı teklif/sipariş/tahsilat başlatma (demo/onay akışına uygun).

**Tipik senaryo:**  
Satış veya finans, müşteriyle görüşmeden önce borç, limit ve son hareketleri tek ekranda toplar.

**Kritik UI öğeleri:** Entity header, **Özet** sekmesi aktif, 5'li metrik kartları, ilgili kayıtlar alt sekmeleri, sağ **Cari Katman Bağlamı** paneli.

---

## Cari İletişim Katmanı — `cariler-katman-iletisim-acik-mod.png`

**Route:** `/cariler/{customerId}/iletisim`

**Bu ekran ne?**  
Cariye bağlı iletişim kanalları ve **yetkili kişiler** katmanıdır.

**Gördüğü veriler:**  
Özet telefon/e-posta/adres kartları, iletişim kişileri tablosu (rol, telefon, e-posta), WhatsApp bağlantı durumu ve son mesaj bilgisi.

**Yapabildiği işler:**  
Kişi ekleme/düzenleme/silme, WhatsApp sohbeti açma, şablon/hızlı mesaj gönderme (kanal policy'sine bağlı).

**Tipik senaryo:**  
Satış temsilcisi doğru yetkiliyi bulur ve WhatsApp üzerinden teklif veya hatırlatma gönderir.

**Kritik UI öğeleri:** Entity header, **İletişim** sekmesi, kişi tablosu + satır aksiyonları, sağ **İletişim Bağlamı** (WhatsApp, hızlı işlemler).

---

## Cari Finans Katmanı — `cariler-katman-finans-acik-mod.png`

**Route:** `/cariler/{customerId}/finans`

**Bu ekran ne?**  
Cari **finans masası** katmanıdır. Alacak, vade ve limit odaklıdır.

**Gördüğü veriler:**  
Açık bakiye, vadesi gelen/geçen, kredi limiti, kullanım oranı, risk skoru, yaşlandırma tablosu; sağda tahsilat önerisi ve finansal KPI'lar.

**Yapabildiği işler:**  
Yaşlandırma inceleme, detaylı rapor, tahsilat planı oluşturma (onaylı mutation zinciri UI'da demo olabilir).

**Tipik senaryo:**  
Finans sorumlusu vadesi geçen tutarı ve limit doluluk oranını kontrol ederek tahsilat planı çıkarır.

**Kritik UI öğeleri:** Entity header, **Finans** sekmesi, 6'lı finans KPI kartları, yaşlandırma tablosu, sağ **Finans Bağlamı**.

---

## Cari Teklifler Katmanı — `cariler-katman-teklifler-acik-mod.png`

**Route:** `/cariler/{customerId}/teklifler`

**Bu ekran ne?**  
Seçili cariye filtrelenmiş **teklif listesi** katmanıdır (modül genel listesinin cari bağlamı).

**Gördüğü veriler:**  
Teklif no, tutar, durum rozeti (gönderildi/kabul/red), tarih; durum chip sayıları ve filtre alanları.

**Yapabildiği işler:**  
Yeni teklif, dışa aktarma, satırdan detay/hızlı aksiyon, sağ panel filtreleri.

**Tipik senaryo:**  
Satış, müşterinin açık ve kabul edilen tekliflerini görür; yeni teklif taslağı açar.

**Kritik UI öğeleri:** Entity header, **Teklifler** sekmesi, durum badge'leri, liste + sağ **Teklif Bağlamı**.

---

## Cari Siparişler Katmanı — `cariler-katman-siparisler-acik-mod.png`

**Route:** `/cariler/{customerId}/siparisler`

**Bu ekran ne?**  
Cariye bağlı **sipariş geçmişi** katmanıdır.

**Gördüğü veriler:**  
Sipariş no, tutar, durum, teslim tarihi; seçili satır için sağda sipariş bağlamı (adres, kargo, onaylayan).

**Yapabildiği işler:**  
Yeni sipariş, listeden seçimle önizleme, sipariş detay köküne gitme (`/siparisler/{orderId}`).

**Tipik senaryo:**  
Operasyon, müşterinin son siparişinin kargo durumunu listeden seçerek sağ panelden kontrol eder.

**Kritik UI öğeleri:** Entity header, **Siparişler** sekmesi, durum badge'leri, liste + **Sipariş Bağlamı** sağ panel.

---

## Cari Tahsilatlar Katmanı — `cariler-katman-tahsilatlar-acik-mod.png`

**Route:** `/cariler/{customerId}/tahsilatlar`

**Bu ekran ne?**  
Cariye ait **tahsilat hareketleri** katmanıdır.

**Gördüğü veriler:**  
Tahsilat no, tutar, ödeme yöntemi (havale/KK/nakit/çek), durum; sağda toplam/bekleyen/iptal özetleri.

**Yapabildiği işler:**  
Yeni tahsilat, ödeme planı, hatırlatma, tahsilat raporu.

**Tipik senaryo:**  
Finans, gelen ödemeyi kaydeder veya bekleyen tahsilatları listeler.

**Kritik UI öğeleri:** Entity header, **Tahsilatlar** sekmesi, yöntem ikonları, durum badge'leri, sağ **Tahsilat Bağlamı**.

---

## Cari Zaman Çizelgesi Katmanı — `cariler-katman-timeline-acik-mod.png`

**Route:** `/cariler/{customerId}/timeline`

**Bu ekran ne?**  
Cari **audit ve etkileşim** kronolojisi katmanıdır.

**Gördüğü veriler:**  
Olay tipi filtreleri (not, arama, e-posta, toplantı, görev, teklif, ödeme), zaman gruplu akış; sağda açık fırsat/teklif/sözleşme/ödeme özetleri.

**Yapabildiği işler:**  
Geçmişi filtreleme, kayıt detayına gitme, cari düzenleme.

**Tipik senaryo:**  
Satış, arama öncesi son görüşme ve gönderilen teklifi timeline'dan okur.

**Kritik UI öğeleri:** Entity header, **Zaman çizelgesi** sekmesi, olay badge'leri, üç sütun (filtre / akış / bağlam).

---

## Yeni Cari Kaydı — `cariler-yeni-form-acik-mod.png`

**Route:** `/cariler/yeni`

**Bu ekran ne?**  
Yeni cari oluşturma **form** ekranıdır; entity detay kabuğu yoktur.

**Gördüğü veriler:**  
Boş form alanları: ünvan, vergi no, il/ilçe, adres, yetkili, telefon, e-posta.

**Yapabildiği işler:**  
Kaydet (onay sonrası toast + disabled), vazgeç (listeye dönüş).

**Tipik senaryo:**  
Satış yeni müşteri kartını operasyon masasından veya cari listesinden açarak kaydeder.

**Kritik UI öğeleri:** Merkezi form kartı, ikonlu input'lar, birincil **Kaydet** / ikincil **Vazgeç** (entity header ve katman sekmesi yok).

---

# SİPARİŞLER

## Sipariş Detay Masası — `siparisler-detay-masasi-acik-mod.png`

**Route:** `/siparisler/{orderId}`

**Bu ekran ne?**  
Sipariş **detay kök** ekranıdır. Finans KPI şeridi, sipariş meta verisi ve satır özeti tek masada toplanır.

**Gördüğü veriler:**  
Sipariş no, durum (Onaylandı), tutar/iskonto/KDV/ödenen/kalan; sipariş bilgileri grid'i, kısa satır tablosu ve toplamlar.

**Yapabildiği işler:**  
Düzenle, yeni sipariş, teslimatları görüntüle, fatura oluştur, yazdır; katman sekmelerine geçiş.

**Tipik senaryo:**  
Kullanıcı listeden siparişi açar; kök detayda tutar ve onay durumunu görür, gerekirse Satırlar veya Ödeme katmanına iner.

**Kritik UI öğeleri:** Entity header (sipariş no + durum), `EntityLayerNav` (**Detay** aktif), 6'lı finans KPI şeridi, sağ onay süreci / teslimat / fatura kartları.

---

## Sipariş Özet Katmanı — `siparisler-katman-ozet-acik-mod.png`

**Route:** `/siparisler/{orderId}/ozet`

**Bu ekran ne?**  
Sipariş **yaşam döngüsü özet** katmanıdır. Müşteri ve finans akışı timeline ile birleşir.

**Gördüğü veriler:**  
Müşteri kartı, sipariş/teslimat/tahsilat/kalan tutar widget'ları, durum timeline'ı (taslak → tamamlandı), proje ve koşul bilgisi.

**Yapabildiği işler:**  
Düzenle, irsaliye/fatura/tahsilat/iade kısayolları, yazdır, not ekleme, diğer katmanlara geçiş.

**Tipik senaryo:**  
Yönetici onaylı siparişin ne kadarının teslim ve tahsil edildiğini tek bakışta kontrol eder.

**Kritik UI öğeleri:** Entity header, **Özet** sekmesi, 4'lü üst bilgi kartları, dikey durum timeline'ı, sağ **Sipariş Katman Bağlamı**.

---

## Sipariş Satırlar Katmanı — `siparisler-katman-satirlar-acik-mod.png`

**Route:** `/siparisler/{orderId}/satirlar`

**Bu ekran ne?**  
Sipariş **kalem yönetimi** katmanıdır.

**Gördüğü veriler:**  
Ürün, miktar, birim, fiyat, iskonto, satır tutarı; seçili satır için stok kontrolü ve raf bilgisi.

**Yapabildiği işler:**  
Satır ekle/düzenle/sil, stok hareketi ve ürün kartına gitme, etiket yazdırma; ara toplam/KDV/genel toplam.

**Tipik senaryo:**  
Operasyon sevkiyat öncesi satırları ve stok yeterliliğini sağ panelden doğrular.

**Kritik UI öğeleri:** Entity header, **Satırlar** sekmesi, satır tablosu + satır aksiyonları, sağ **Satır Bağlamı**, alt toplam kutusu.

---

## Sipariş Ödeme Katmanı — `siparisler-katman-odeme-acik-mod.png`

**Route:** `/siparisler/{orderId}/odeme-tahsilat`

**Bu ekran ne?**  
Siparişe bağlı **tahsilat ve bakiye** katmanıdır.

**Gördüğü veriler:**  
Sipariş tutarı, tahsil edilen (%), kalan; tahsilat listesi (tarih, yöntem, kalan bakiye); tahsilat dağılım grafiği.

**Yapabildiği işler:**  
Tahsilat ekle, ödeme planı, rapor, yazdır/düzenle.

**Tipik senaryo:**  
Muhasebe müşteri ödemesini kaydeder ve sipariş kapanış oranını kontrol eder.

**Kritik UI öğeleri:** Entity header, **Ödeme** sekmesi, özet kartları, tahsilat tablosu, sağ **Ödeme Bağlamı**.

---

## Sipariş Teslimat Katmanı — `siparisler-katman-teslimat-acik-mod.png`

**Route:** `/siparisler/{orderId}/teslimat`

**Bu ekran ne?**  
Sipariş **sevkiyat / teslimat** katmanıdır.

**Gördüğü veriler:**  
Teslimat no, durum (planlandı/yolda/teslim), tarih; rota haritası, sürücü ve araç; teslimat özeti (adet oranı).

**Yapabildiği işler:**  
Yeni teslimat, irsaliye, rota detayı, sürücüyle WhatsApp.

**Tipik senaryo:**  
Lojistik kısmi sevkiyatları ve kalan miktarı takip eder.

**Kritik UI öğeleri:** Entity header, **Teslimat** sekmesi, durum badge'leri, sağ harita + **Teslimat Bağlamı**.

---

## Sipariş Fatura Katmanı — `siparisler-katman-fatura-acik-mod.png`

**Route:** `/siparisler/{orderId}/fatura`

**Bu ekran ne?**  
Siparişe bağlı **faturalama** katmanıdır.

**Gördüğü veriler:**  
Fatura listesi (no, tarih, vade, tutar, ödeme ve e-fatura durumu); KPI: toplam/ödenen/kalan fatura tutarı.

**Yapabildiği işler:**  
Yeni fatura, e-fatura oluştur/gönder, filtreleme, fatura raporu.

**Tipik senaryo:**  
Finans onaylı sipariş için e-fatura keser ve ödeme durumunu izler.

**Kritik UI öğeleri:** Entity header, **Fatura** sekmesi, 4'lü fatura KPI, filtre bandı, sağ **Fatura Bağlamı**.

---

## Sipariş İade Katmanı — `siparisler-katman-iade-acik-mod.png`

**Route:** `/siparisler/{orderId}/iade`

**Bu ekran ne?**  
Siparişe bağlı **iade kayıtları** katmanıdır.

**Gördüğü veriler:**  
İade no, tutar, durum; stok etkisi özeti (çıkan/iade/net), son iade işlemi.

**Yapabildiği işler:**  
İade detayı ve belgesi, stok hareketlerini görüntüleme.

**Tipik senaryo:**  
Kalite veya satış sonrası iadelerin toplam tutar ve stok etkisini doğrular.

**Kritik UI öğeleri:** Entity header, **İade** sekmesi, iade tablosu, sağ **İade Bağlamı** (stok özeti).

---

## Sipariş Depo / Stok Etkisi Katmanı — `siparisler-katman-depo-stok-acik-mod.png`

**Route:** `/siparisler/{orderId}/depo-stok-etkisi`

**Bu ekran ne?**  
Sipariş kalemlerinin **depo rezerv/çekim/eksik** etkisini gösteren katmandır.

**Gördüğü veriler:**  
Ürün bazlı rezerv, çekim, eksik miktar; depo bağlamı (merkez depo, kapasite); raf uyarıları.

**Yapabildiği işler:**  
Stok hareketi, transfer talebi, rezervasyon, depo raporu; eksik stok satırında aksiyon.

**Tipik senaryo:**  
Depo sorumlusu sevkiyat öncesi eksik ürünleri ve transfer ihtiyacını listeler.

**Kritik UI öğeleri:** Entity header, **Depo** sekmesi, stok etkisi tablosu, **Stok Eksik** vurgusu, sağ **Depo Bağlamı**.

---

## Sipariş Zaman Çizelgesi Katmanı — `siparisler-katman-timeline-acik-mod.png`

**Route:** `/siparisler/{orderId}/timeline`

**Bu ekran ne?**  
Sipariş **denetim izi** katmanıdır (onay, güncelleme, stok, teklif dönüşümü).

**Gördüğü veriler:**  
Kronolojik olaylar (kim, ne zaman, ne değişti); sağda sipariş özeti, hızlı bilgiler, ilgili kayıtlar.

**Yapabildiği işler:**  
Filtreleme/yenileme, ilgili teklif/fatura/sevkiyata gitme, yazdır/fatura/sevkiyat kısayolları.

**Tipik senaryo:**  
Destek veya yönetici anlaşmazlıkta siparişin onay ve güncelleme geçmişini okur.

**Kritik UI öğeleri:** Entity header, **Zaman çizelgesi** sekmesi, dikey olay akışı, sağ bağlam + hızlı işlemler.

---

## Yeni Sipariş Hub — `siparisler-yeni-hub-acik-mod.png`

**Route:** `/siparisler/yeni`

**Bu ekran ne?**  
Sipariş oluşturma **giriş hub**'ıdır; entity detay kabuğu yoktur.

**Gördüğü veriler:**  
Üç giriş kartı: Hızlı Sipariş, Tekliften Aktar, Manuel.

**Yapabildiği işler:**  
Oluşturma yolunu seçme (sonraki adım ekranına yönlendirme).

**Tipik senaryo:**  
Kullanıcı tekliften dönüşüm veya sıfırdan manuel sipariş için doğru akışı seçer.

**Kritik UI öğeleri:** Üç büyük seçim kartı, global header; entity header ve katman sekmesi yok.

---

## Hızlı route tablosu

| PNG (kısa ad) | Route |
|---------------|--------|
| `cariler-detay-masasi` | `/cariler/{customerId}` |
| `cariler-katman-ozet` | `/cariler/{customerId}/ozet` |
| `cariler-katman-iletisim` | `/cariler/{customerId}/iletisim` |
| `cariler-katman-finans` | `/cariler/{customerId}/finans` |
| `cariler-katman-teklifler` | `/cariler/{customerId}/teklifler` |
| `cariler-katman-siparisler` | `/cariler/{customerId}/siparisler` |
| `cariler-katman-tahsilatlar` | `/cariler/{customerId}/tahsilatlar` |
| `cariler-katman-timeline` | `/cariler/{customerId}/timeline` |
| `cariler-yeni-form` | `/cariler/yeni` |
| `siparisler-detay-masasi` | `/siparisler/{orderId}` |
| `siparisler-katman-ozet` | `/siparisler/{orderId}/ozet` |
| `siparisler-katman-satirlar` | `/siparisler/{orderId}/satirlar` |
| `siparisler-katman-odeme` | `/siparisler/{orderId}/odeme-tahsilat` |
| `siparisler-katman-teslimat` | `/siparisler/{orderId}/teslimat` |
| `siparisler-katman-fatura` | `/siparisler/{orderId}/fatura` |
| `siparisler-katman-iade` | `/siparisler/{orderId}/iade` |
| `siparisler-katman-depo-stok` | `/siparisler/{orderId}/depo-stok-etkisi` |
| `siparisler-katman-timeline` | `/siparisler/{orderId}/timeline` |
| `siparisler-yeni-hub` | `/siparisler/yeni` |

Dosya adlarında `-acik-mod` soneki katalogda standarttır; implementasyon referansı için tam ad kullanılır.

---

# Bölüm D — Teklif detay/katman, komut masaları, diğer detaylar, formlar, sistem

> **AI kuralı:** AI ekranları yalnızca öneri/taslak üretir; doğrudan CRM mutation yapmaz. Gerçek işlem onay + backend zincirinden geçer.

## Teklif Detayı — `teklifler-detay-masasi-acik-mod.png`
**Route:** `/teklifler/[offerId]` (çoğu akış `/ozet`e yönlenir)

**Bu ekran ne?** Teklif kaydının kök detay masası; tüm katman sekmelerinin girişi.

**Gördüğü veriler:** Teklif no, cari, tutar, geçerlilik, KPI, özet bağlam.

**Yapabildiği işler:** Düzenle, yazdır, katmanlara geçiş, siparişe dönüşüm yolu.

**Tipik senaryo:** Listeden teklif açılır; tutar doğrulanır, satırlar sekmesine inilir.

**Kritik UI öğeleri:** Entity header, sekme şeridi, sağ «Teklif Bağlamı».

---

## Teklif Özet Katmanı — `teklifler-katman-ozet-acik-mod.png`
**Route:** `/teklifler/[offerId]/ozet`

**Bu ekran ne?** Teklifin finansal ve operasyonel özet katmanı (varsayılan sekme).

**Gördüğü veriler:** Tutar/KDV/toplam, meta, sağ özet dökümü.

**Yapabildiği işler:** PDF, kopyala, düzenle, diğer katmanlar.

**Tipik senaryo:** Müşteri araması öncesi tutar ve vade kontrol edilir.

**Kritik UI öğeleri:** **Özet** sekmesi aktif, KPI kartları.

---

## Teklif Satırlar Katmanı — `teklifler-katman-satirlar-acik-mod.png`
**Route:** `/teklifler/[offerId]/satirlar`

**Bu ekran ne?** Teklif kalemlerinin fiyatlandırıldığı katman.

**Gördüğü veriler:** Kalem tablosu, toplamlar, stok uyarıları.

**Yapabildiği işler:** Satır ekle, onaya gönder, PDF/e-posta.

**Tipik senaryo:** Metraj ve iskonto satır satır girilir; stok uyarısı değerlendirilir.

**Kritik UI öğeleri:** Kalem tablosu, alt toplam, stok uyarı kartı.

---

## Teklif Müşteri Katmanı — `teklifler-katman-musteri-acik-mod.png`
**Route:** `/teklifler/[offerId]/musteri`

**Bu ekran ne?** Teklifin bağlı carisinin limit/risk ve geçmiş teklifleri.

**Gördüğü veriler:** Cari özet, teklif geçmişi tablosu, iletişim.

**Yapabildiği işler:** Geçmiş teklife git, cari detayına geç.

**Tipik senaryo:** Limit uyarısı görülür, eski teklifler karşılaştırılır.

**Kritik UI öğeleri:** **Müşteri** sekmesi, cari snapshot.

---

## Teklif Dönüşüm Katmanı — `teklifler-katman-donusum-acik-mod.png`
**Route:** `/teklifler/[offerId]/siparise-donusturme`

**Bu ekran ne?** Onaylı teklifin siparişe dönüşüm sihirbazı.

**Gördüğü veriler:** Adımlar, kalem bazlı stok, dönüşüm özeti.

**Yapabildiği işler:** Stok kontrol, taslak, sipariş oluştur (onaylı).

**Tipik senaryo:** Kısmi stokta alternatif veya kısmi sipariş kararı.

**Kritik UI öğeleri:** Adım göstergesi, «Sipariş Oluştur» CTA.

---

## Teklif Belgeler Katmanı — `teklifler-katman-belgeler-acik-mod.png`
**Route:** `/teklifler/[offerId]/belgeler`

**Bu ekran ne?** Teklife bağlı PDF ve ekler.

**Gördüğü veriler:** Belge listesi, önizleme.

**Yapabildiği işler:** Yükle, indir, paylaş (onaylı kanal).

**Tipik senaryo:** Teklif PDF ve şartname arşivlenir.

**Kritik UI öğeleri:** **Belgeler** sekmesi, önizleme paneli.

---

## Teklif Timeline Katmanı — `teklifler-katman-timeline-acik-mod.png`
**Route:** `/teklifler/[offerId]/timeline`

**Bu ekran ne?** Teklif audit kronolojisi.

**Gördüğü veriler:** Olay akışı, filtreler, notlar.

**Yapabildiği işler:** Olay inceleme, not ekleme.

**Tipik senaryo:** «Kim fiyatı değiştirdi?» sorusu yanıtlanır.

**Kritik UI öğeleri:** **Timeline** sekmesi, dikey olay listesi.

---

## Yeni Teklif Hub — `teklifler-yeni-hub-acik-mod.png`
**Route:** `/teklifler/yeni`

**Bu ekran ne?** Hızlı veya detaylı teklif akışı seçim hub’ı.

**Gördüğü veriler:** İki büyük kart, son taslaklar.

**Yapabildiği işler:** Akış seçimi, taslağa devam.

**Tipik senaryo:** Telefon talebinde hızlı teklif seçilir.

**Kritik UI öğeleri:** Seçim kartları, taslak şeridi.

---

## Gösterge Paneli — `dashboard-operasyon-acik-mod.png`
**Route:** `/dashboard`

**Bu ekran ne?** Günlük operasyon vitrini; AI kolonu yalnızca burada tam genişlikte.

**Gördüğü veriler:** Stok KPI, operasyon akışı, AI video alanı ve öneriler.

**Yapabildiği işler:** Akışı yenile; AI ile özet iste (mutation yok).

**Tipik senaryo:** Sabah kritik stok taranır, AI günlük özet okunur.

**Kritik UI öğeleri:** KPI, akış listesi, sağ AI asistan (video çerçevesi).

---

## Hızlı İşlem Satış Masası — `hizli-islem-satis-masasi-acik-mod.png`
**Route:** `/hizli-islem`

**Bu ekran ne?** Tek ekranda hızlı satış fişi; ana operasyon girişi.

**Gördüğü veriler:** Son işlemler, cari formu, satırlar, toplamlar.

**Yapabildiği işler:** Kaydet, onaya gönder, satır ekle.

**Tipik senaryo:** Saha siparişi cari + satırlarla onaya gönderilir.

**Kritik UI öğeleri:** Ürün tablosu, sağ toplam, «Onaya Gönder».

---

## Onaylar Komut Masası — `onaylar-komut-masasi-acik-mod.png`
**Route:** `/onaylar`, `/onaylar/bekleyenler`, `/onaylar/inceleme`, `/onaylar/tamamlananlar`

**Bu ekran ne?** Bekleyen onayların üç kolonlu komut merkezi.

**Gördüğü veriler:** KPI, kuyruk listesi, talep detayı.

**Yapabildiği işler:** Onayla, reddet, incele.

**Tipik senaryo:** Yönetici sabah kuyruğu işler.

**Kritik UI öğeleri:** Liste / detay / karar kolonları.

---

## Onay Karar Detayı — `onaylar-detay-karar-acik-mod.png`
**Route:** `/onaylar/[approvalId]`

**Bu ekran ne?** Tek yüksek riskli onayın karar masası.

**Gördüğü veriler:** Mevcut vs talep, risk, tutar etkisi, audit.

**Yapabildiği işler:** Onayla / reddet / incele, ek indir.

**Tipik senaryo:** Fiyat artışı yıllık etkiyle değerlendirilir.

**Kritik UI öğeleri:** Karşılaştırma kartları, sabit alt aksiyon çubuğu.

---

## AI Operatör Merkezi — `ai-operator-hub-acik-mod.png`
**Route:** `/ai`, `/ai/onaylar`

**Bu ekran ne?** AI plan kuyruğu; salt okunur inceleme.

**Gördüğü veriler:** Bekleyen plan, yerel işleme oranı, öneri listesi.

**Yapabildiği işler:** Plan incele, onay kuyruğuna yönlendir.

**Tipik senaryo:** Stok planı okunur; kabul için insan onayı istenir.

**Kritik UI öğeleri:** «Öneri İncele», güvenlik bandı.

---

## AI İçgörüler — `ai-icgoruler-acik-mod.png`
**Route:** `/ai/icgoruler`

**Bu ekran ne?** Risk/fırsat içgörüleri; mutation yok.

**Gördüğü veriler:** KPI, öncelikli içgörü listesi, detay.

**Yapabildiği işler:** Filtrele, önerilen adımları ekibe ilet (manuel).

**Tipik senaryo:** Vadesi geçen tahsilat uyarısı tahsilat ekibine aktarılır.

**Kritik UI öğeleri:** Sol liste / sağ detay, öneri kutusu.

---

## Tahsilat Detayı — `tahsilatlar-detay-masasi-acik-mod.png`
**Route:** `/tahsilatlar/[paymentId]`

**Bu ekran ne?** Tahsilat eşleşme ve dekont detayı.

**Gördüğü veriler:** Özet, zaman çizelgesi, fatura dağılımı.

**Yapabildiği işler:** Dekont, not, yazdır, yeni tahsilat.

**Tipik senaryo:** Kısmi havale hangi faturada netleşir.

**Kritik UI öğeleri:** Dağılım tablosu, sağ bağlam.

---

## Teslimat Detayı — `teslimatlar-detay-masasi-acik-mod.png`
**Route:** `/teslimatlar/[deliveryId]`

**Bu ekran ne?** Saha teslimat kalemleri ve kanıtı.

**Gördüğü veriler:** Durum, şoför, kalemler, imza/foto.

**Yapabildiği işler:** İrsaliye, iptal, sipariş bağlantısı.

**Tipik senaryo:** Şantiye teslimi imzayla arşivlenir.

**Kritik UI öğeleri:** Kanıt paneli, kalem tablosu.

---

## Fatura Detayı — `faturalar-detay-masasi-acik-mod.png`
**Route:** `/faturalar/[invoiceId]`

**Bu ekran ne?** Fatura özeti ve e-fatura durumu.

**Gördüğü veriler:** Meta, toplamlar, GİB durumu.

**Yapabildiği işler:** PDF, e-fatura, iptal (yetkili).

**Tipik senaryo:** E-fatura iletimi doğrulanır.

**Kritik UI öğeleri:** Sekmeler, sağ işlemler.

---

## İade Detayı — `iadeler-detay-masasi-acik-mod.png`
**Route:** `/iadeler/[returnId]`

**Bu ekran ne?** İade kalemleri ve onay süreci.

**Gördüğü veriler:** Bağlı sipariş, stok etki, onay adımları.

**Yapabildiği işler:** Onayla/reddet, not, para iadesi.

**Tipik senaryo:** Arızalı ürün iadesi onaylanır.

**Kritik UI öğeleri:** Onay timeline, stok KPI.

---

## Belge Detayı — `belgeler-detay-masasi-acik-mod.png`
**Route:** `/belgeler/[documentId]`

**Bu ekran ne?** Tek belge meta ve önizleme.

**Gördüğü veriler:** Tür, cari, PDF önizleme.

**Yapabildiği işler:** Arşivle, yazdır, WA/e-posta, sil.

**Tipik senaryo:** Tedarikçi faturası arşive alınır.

**Kritik UI öğeleri:** PDF viewer, işlem yığını.

---

## Görev Detayı — `gorevler-detay-masasi-acik-mod.png`
**Route:** `/gorevler/[taskId]`

**Bu ekran ne?** Görev checklist ve yorumları.

**Gördüğü veriler:** Atanan, vade, checklist, bağlantılar.

**Yapabildiği işler:** Tamamla, madde işaretle, yorum.

**Tipik senaryo:** Stok sayımı maddeleri kapatılır.

**Kritik UI öğeleri:** Checklist sekmesi.

---

## Depo Fiş Detayı — `depo-fis-detay-masasi-acik-mod.png`
**Route:** `/depo/emirler/[id]`

**Bu ekran ne?** Toplama fişi satırları ve kapasite.

**Gördüğü veriler:** Raf, toplanan, kapasite grafikleri.

**Yapabildiği işler:** Toplama rehberi, barkod, transfer.

**Tipik senaryo:** Raf doluluk uyarısıyla toplama tamamlanır.

**Kritik UI öğeleri:** Toplama tablosu, kapasite paneli.

---

## Fabrika Sipariş Detayı — `fabrikalar-siparis-detay-acik-mod.png`
**Route:** `/fabrikalar/siparisler/[id]`

**Bu ekran ne?** Fabrika emri senkron ve kalemler.

**Gördüğü veriler:** Senkron durumu, üretim kalemleri, hata logu.

**Yapabildiği işler:** Yeniden dene, satış siparişine dön.

**Tipik senaryo:** Birim dönüşüm hatası logdan iletilir.

**Kritik UI öğeleri:** Entegrasyon hataları paneli.

---

## Gelen Kutu Üç Panel — `gelen-kutu-uc-panel-acik-mod.png`
**Route:** `/gelen-kutu`

**Bu ekran ne?** Omnichannel gelen kutu (klasör / liste / sohbet).

**Gördüğü veriler:** Klasörler, konuşmalar, mesajlar, müşteri özeti.

**Yapabildiği işler:** Mesaj, şablon, not, cari detay.

**Tipik senaryo:** WA fiyat sorusu şablonla yanıtlanır.

**Kritik UI öğeleri:** 3 panel, kanal rozetleri.

---

## Gelen Kutu Konuşma Detayı — `gelen-kutu-konusma-detay-acik-mod.png`
**Route:** `/gelen-kutu/konusma/[id]`

**Bu ekran ne?** Tek konuşma + ürün bağlamı.

**Gördüğü veriler:** Mesajlar, barkod/fiyat/stok, son etkileşimler.

**Yapabildiği işler:** Teklif/sipariş, stok kontrol.

**Tipik senaryo:** «50 rulman» mesajından hızlı teklif.

**Kritik UI öğeleri:** Hızlı işlem ızgarası.

---

## Workflow Timeline — `workflow-timeline-detay-acik-mod.png`
**Route:** `/workflow/[type]/[id]`

**Bu ekran ne?** Kayıt tipinden bağımsız denetim izi.

**Gördüğü veriler:** Olay akışı, bağlam özeti.

**Yapabildiği işler:** Filtre, onay kaydına git.

**Tipik senaryo:** Fiyat ve stok güncellemesi tek yerde izlenir.

**Kritik UI öğeleri:** Dikey timeline.

---

## Yeni Tahsilat Formu — `tahsilatlar-yeni-form-acik-mod.png`
**Route:** `/tahsilatlar/yeni`

**Bu ekran ne?** Tahsilat girişi ve fatura mahsup tablosu.

**Gördüğü veriler:** Tutar, yöntem, cari, dağılım satırları.

**Yapabildiği işler:** Kaydet, onaya gönder.

**Tipik senaryo:** Havale açık faturalara mahsup edilir.

**Kritik UI öğeleri:** Dağılım tablosu, özet çubuğu.

---

## Yeni Fatura Formu — `faturalar-yeni-form-acik-mod.png`
**Route:** `/faturalar/yeni`

**Bu ekran ne?** Tam fatura kesim formu.

**Gördüğü veriler:** Cari, satırlar, KDV, toplam.

**Yapabildiği işler:** Taslak, önizleme, oluştur.

**Tipik senaryo:** Sevkiyat sonrası fatura taslağı.

**Kritik UI öğeleri:** Satır tablosu, genel toplam.

---

## Yeni İade Formu — `iadeler-yeni-form-acik-mod.png`
**Route:** `/iadeler/yeni`

**Bu ekran ne?** Çok adımlı iade sihirbazı.

**Gördüğü veriler:** Sipariş satırları, depo etki önizlemesi.

**Yapabildiği işler:** Satır seç, adımlarla ilerle.

**Tipik senaryo:** Arızalı kalem seçilir, depo etkisi görülür.

**Kritik UI öğeleri:** Stepper, depo önizleme.

---

## Yeni Teslimat Formu — `teslimatlar-yeni-form-acik-mod.png`
**Route:** `/teslimatlar/yeni`

**Bu ekran ne?** Teslimat oluşturma formu.

**Gördüğü veriler:** Adres, şoför, araç, satırlar.

**Yapabildiği işler:** Satır ekle, teslimat oluştur.

**Tipik senaryo:** Siparişe bağlı teslimat fişi açılır.

**Kritik UI öğeleri:** Ürün tablosu, özet paneli.

---

## Yeni Belge Formu — `belgeler-yeni-form-acik-mod.png`
**Route:** `/belgeler/yeni`

**Bu ekran ne?** Belge yükleme formu.

**Gördüğü veriler:** Meta alanları, dropzone, yükleme listesi.

**Yapabildiği işler:** Dosya seç, kaydet.

**Tipik senaryo:** PDF cari klasörüne yüklenir.

**Kritik UI öğeleri:** Dropzone, format limitleri.

---

## Giriş — `login-split-acik-mod.png`
**Route:** `/login`

**Bu ekran ne?** Kimlik doğrulama; marka sol, form sağ.

**Gördüğü veriler:** E-posta, şifre, demo bilgisi.

**Yapabildiği işler:** Giriş, şifremi unuttum, demo.

**Tipik senaryo:** Operatör sabah oturum açar.

**Kritik UI öğeleri:** Split layout, altın Giriş butonu.

---

## Yetkisiz — `unauthorized-state-acik-mod.png`
**Route:** `/unauthorized`

**Bu ekran ne?** İzin yokken fail-closed bilgi ekranı.

**Gördüğü veriler:** Kilit mesajı.

**Yapabildiği işler:** Geri dön, ana sayfa.

**Tipik senaryo:** Yetkisiz URL engellenir.

**Kritik UI öğeleri:** Ortalanmış kart.

---

## API Çevrimdışı — `offline-api-state-acik-mod.png`
**Route:** `/offline-api`

**Bu ekran ne?** Backend erişilemediğinde bağlantı ekranı.

**Gördüğü veriler:** Offline mod açıklaması.

**Yapabildiği işler:** Yeniden dene.

**Tipik senaryo:** Şube interneti kesilince retry.

**Kritik UI öğeleri:** Sarı uyarı bandı.

---

## Demo Modu — `demo-mode-state-acik-mod.png`
**Route:** `/demo-mode`

**Bu ekran ne?** Sandbox uyarısı; gerçek kayıt etkilenmez.

**Gördüğü veriler:** Demo açıklaması, toggle.

**Yapabildiği işler:** Demo aç/kapa.

**Tipik senaryo:** Eğitimde demo, sonra canlı mod.

**Kritik UI öğeleri:** DEMO modal, toggle.

---

## Canlı Veri Yok — `live-empty-state-acik-mod.png`
**Route:** `/live-empty`

**Bu ekran ne?** Canlı veri bağlanırken geçici boş durum.

**Gördüğü veriler:** Bağlanıyor mesajı.

**Yapabildiği işler:** Bekleme (otomatik yenileme).

**Tipik senaryo:** İlk açılışta liste sonra dolar.

**Kritik UI öğeleri:** Spinner, empty-state kartı.
