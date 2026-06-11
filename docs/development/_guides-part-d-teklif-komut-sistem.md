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
