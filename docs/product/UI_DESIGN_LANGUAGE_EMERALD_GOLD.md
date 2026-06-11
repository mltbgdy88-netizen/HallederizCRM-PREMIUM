# HallederizCRM UI Tasarım Dili

Bu doküman tüm ürün arayüzü için referans tasarım kararını sabitler. Yeni UI işleri bu standarda göre yapılır; tek sayfalık farklı görsel denemeler yerine aynı ölçü, renk, aksiyon ve yoğunluk kuralları uygulanır.

## Ana Karar

HallederizCRM iki tema ile ilerler:

- **Açık mod:** zümrüt yeşili ana aksiyon, altın sarısı detaylar, krem zemin, net çizgili beyaz/krem kartlar.
- **Koyu mod:** siyah parlak cam zemin, zümrüt/altın neon ışık hüzmeleri, aynı kart ve ikonların sade ama teknolojik versiyonu.

Koyu mod ayrı bir ürün değil, açık modun bire bir aynı yerleşim ve ölçü kontratıyla çalışan cam/neon yorumudur.

## Renk Kimliği

### Açık Mod

- Zemin: `#f8f1df`, `#fffaf0`, `#fbf3df`
- Ana marka: `#047857`, `#065f46`
- Koyu zümrüt/sidebar: `#063f32`, `#022c22`
- Altın vurgu: `#d4af37`, `#f2c94c`
- Metin: `#102a24`, ikincil `#42564c`
- Border: net ama yumuşak `#d8cdb5`, `#c7b98f`

### Koyu Mod

- Zemin: `#020604`, `#06110d`, `#081813`
- Cam kart: yarı saydam siyah/zümrüt yüzey
- Ana neon: `#2cff9a`, `#00d47e`
- Altın neon: `#ffd166`, `#f2c94c`
- Metin: `#f5fff8`, ikincil `#b8c8bf`
- Border: cam çizgisi + zümrüt/altın ışık

## Görsel Kurallar

1. Sayfa 1920x1080 ekrana sığmalı; body scroll ve yatay scroll üretilmemeli.
2. Ana içerik alanları `height: 100%`, `min-height: 0`, `overflow: hidden` zinciriyle kurulmalı.
3. İç listeler/table body dikey scroll alabilir; fakat ilk görünümde en az 5 satır görünmeli.
4. Kart, tablo ve input içindeki yazı taşmamalı; `min-width: 0`, `text-overflow: ellipsis`, kontrollü satır yüksekliği kullanılmalı.
5. Yazılar soluk olmamalı. Başlıklar 800/900, ana sayılar 800/900, gövde metni en az 600 ağırlıkta olmalı.
6. Renkli alanlar net border ile ayrılmalı; büyük düz boya blokları kullanılmamalı.
7. Emoji ikon kullanılmaz. Çizgisel ikonlar açık modda sade, koyu modda neon çizgi etkili görünür.
8. Koyu moddaki kart/ikon kompozisyonu açık mod ile aynı ölçüde kalır; sadece yüzey, ışık ve kontrast değişir.
9. Grafikler ana tasarım dili değildir. Grafik yalnızca karar vermeye yardım ediyorsa küçük trend/özet olarak kullanılır; sayfanın liste, işlem veya bağlam alanını ezemez.

## Sağ Kolon Kullanımı

Sağ kolon her sayfada bulunduğu sayfanın **bağlam paneli** olarak çalışır. Grafik vitrini veya boş dekor alanı değildir.

Sağ kolonda öncelik sırası:

1. Seçili kayıt / sayfa bağlamı özeti.
2. Önemli uyarılar: vade, limit, stok, risk, eksik bilgi, onay ihtiyacı.
3. Sonraki önerilen adım.
4. İlgili kişi/cari/belge/sipariş bağlantıları.
5. Onay, belge, WhatsApp, tahsilat veya teslimat etkisi.
6. En altta gerekiyorsa çok kompakt mini metrik veya mini trend.

Sağ kolonda kaçınılacaklar:

- Büyük pasta/donut/gauge grafikler.
- Sırf görsel doluluk için grafik.
- Ana listeyi daraltan veya ekranı taşıran analiz blokları.
- Sayfa içeriğinden kopuk genel KPI kartları.

Boş sağ panel kabul edilmez. Veri yoksa bile sayfaya özel net boş durum, eksik bilgi veya sonraki adım gösterilir.

## Ölçü Kontratı

- Shell yüksekliği: `100vh`
- Dış içerik max genişlik: `1604px`
- Sayfa gutter: `12-16px`
- Header: `50-56px`
- KPI/uyarı strip: `38-48px`
- Filtre/context satırı: `42-52px`
- Tablo header: `28-32px`
- Tablo satırı: `42-52px`
- Sağ panel: `320-360px`
- Alt aksiyon barı: `56-64px`
- Border radius: kart `14-18px`, input `9-11px`, buton `10-12px`

## Aksiyon Davranışı

Kaydet, sil, gönder, onayla, reddet, teklif oluştur, tahsilat işle, WhatsApp gönder gibi önemli aksiyonlarda:

1. Kullanıcıya görünür durum bildirimi verilir.
2. Bildirim teknik değil, Türkçe ve net olur: `Kaydedildi`, `Silindi`, `Gönderildi`, `Onaya gönderildi`, `Taslak hazırlandı`.
3. Aynı veri üzerinde ikinci kez çalıştırılması riskli aksiyonlar başarılı işlemden sonra disabled/pasif moda alınır.
4. Disabled state yalnızca opacity düşürmez; imleç, border ve açıklama ile pasif olduğu anlaşılır.
5. Gerçek backend mutation bağlı değilse başarı iddiası yapılmaz; `Taslak hazırlandı`, `Onay sonrası işlenecek` gibi doğru metin kullanılır.

## Hızlı İşlem Kararı

`/hizli-islem` artık ayrı teklif/tahsilat/iade kopyaları değildir. Ana ekran **Hızlı Satış Masası** olur:

- Ürün satırı varsa satış/sipariş taslağı hazırlanır.
- Ekrandaki bilgiler `Teklif Olarak Kaydet` ile teklif taslağına dönüşür.
- `Tekliften Çağır` mevcut teklif satırlarını satış masasına taşır.
- Ürün satırı yok ama ödeme bilgisi doluysa `Tahsilat Kaydet` tahsilat akışı olarak değerlendirilir.
- Riskli veya gerçek mutation gerektiren işler onay/policy/audit zinciri olmadan execute edilmez.

## Cursor Uygulama Talimatı

Her sayfa için çalışma sırası:

1. Önce sayfa kökü ve layout zincirini ekrana sığacak hale getir.
2. Sonra tablo/listenin satır görünürlüğünü düzelt.
3. Sonra sağ panelin ilk açılışta dolu, sayfaya bağlı ve uyarı/özet odaklı olmasını sağla.
4. Sonra aksiyon butonlarında toast + disabled-after-success davranışını kur.
5. En son renk, border, icon ve micro polish uygula.

Bir sayfa bitmiş sayılmaz:

- Body scroll varsa.
- Yatay scroll varsa.
- Kart içinde metin/sayı taşıyorsa.
- Aksiyon butonu ikinci kez riskli işlem çalıştırabiliyorsa.
- Açık ve koyu mod aynı ölçü kontratını korumuyorsa.
- Typecheck ve navigation smoke doğrulanmadıysa.
