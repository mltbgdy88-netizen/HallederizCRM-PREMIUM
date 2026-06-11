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
