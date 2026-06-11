# Cursor Görevi — Emerald Gold UI Standardına Geçiş

## Görev Adı

HallederizCRM arayüzünü zümrüt/altın/krem açık mod ve siyah cam/neon koyu mod tasarım diline geçirmek.

## Amaç

Tüm sayfaları aynı kurumsal tasarım diline yaklaştırmak; taşan, kaydırmaya zorlayan, soluk, hizası dağınık veya oyuncak gibi boyanmış UI parçalarını temizlemek.

Referans doküman:

- `docs/product/UI_DESIGN_LANGUAGE_EMERALD_GOLD.md`

Başlangıç token katmanı:

- `apps/web/app/styles/brand-design-language.css`

## Dokunulabilecek Dosyalar

- `apps/web/app/(platform)/**`
- `apps/web/app/styles/**`
- `apps/web/src/features/**`
- `apps/web/src/components/platform-shell.tsx`
- `apps/web/src/components/platform-route-meta.ts`
- `packages/ui/src/styles/**`
- `packages/ui/src/components/**` sadece ortak UI primitive gerekiyorsa

## Dokunulmaması Gereken Dosyalar

- `apps/api/**`
- `packages/database/**`
- `packages/domain/**`
- `apps/worker/**`
- migration dosyaları
- auth/env/secret/deployment dosyaları

## Tasarım Kararı

Açık mod:

- Zümrüt yeşili ana aksiyon.
- Altın sarısı vurgu ve seçili durum.
- Krem zemin.
- Net çizgili, premium, sade kartlar.

Koyu mod:

- Siyah parlak cam hissi.
- Zümrüt ve altın neon ışık hüzmeleri.
- Açık moddaki kart/ikon yerleşiminin aynı ama sade, teknolojik versiyonu.
- Büyük boya blokları yok; çizgiler, glow ve kontrollü kontrast var.

## Zorunlu Ölçü Kuralları

1. 1920x1080 viewport’ta sayfa ana gövdesi ekrana sığmalı.
2. Body scroll olmamalı.
3. Yatay scroll olmamalı.
4. Sayfa kökü `height: 100%`, `min-height: 0`, `overflow: hidden` zincirini korumalı.
5. Liste/table body scroll alabilir, ama ilk görünümde en az 5 satır görünmeli.
6. Kart içindeki yazı/sayı taşmamalı; ellipsis, min-width ve kompakt satır yüksekliği kullanılmalı.
7. Sağ panel varsa ilk açılışta veri varken boş olmamalı.
8. Sağ panel grafik vitrini değil, bulunduğu sayfanın bağlam/uyarı/bilgilendirme alanı olmalı.
9. Grafikler büyük yer kaplamamalı; gerekiyorsa yalnızca kompakt mini trend/özet olarak kullanılmalı.

## Sağ Kolon Standardı

Sağ kolon her sayfada sayfanın mevcut içeriğine bağlı çalışır:

- Liste sayfasında seçili ilk kayıt özeti, uyarılar, ilgili hızlı aksiyonlar ve sonraki adım.
- Detay sayfasında kayıt özeti, onay/risk durumu, timeline, belge/WhatsApp/tahsilat/teslimat etkisi.
- Dashboard’da genel AI/chat kolonu kalabilir; diğer sayfalarda AI chat kolonu oluşturulmaz.
- Rapor sayfasında bile sağ kolon büyük grafik değil; filtre özeti, riskli bulgular, dışa aktarım durumu ve önemli notlar için kullanılır.
- Veri yoksa boş panel yerine sayfaya özel boş durum ve sonraki adım gösterilir.

Kaçınılacaklar:

- Büyük pasta/donut/gauge grafikler.
- Sağ paneli sadece KPI veya grafikle doldurmak.
- Ana liste satırlarını azaltan üst/sağ analiz blokları.
- Sayfa içeriğinden kopuk genel performans grafikleri.

## Aksiyon Kuralları

Kaydet, sil, gönder, onayla, reddet, teklif oluştur, tahsilat işle, WhatsApp gönder gibi butonlarda:

1. Tıklama sonrası kullanıcıya toast/durum bildirimi göster.
2. Mesaj Türkçe ve net olsun.
3. Aynı veri üzerinde mükerrer iş riski varsa başarılı işlemden sonra butonu disabled yap.
4. Gerçek backend/policy/audit bağlı değilse `Kaydedildi` deme; `Taslak hazırlandı`, `Onay sonrası işlenecek` gibi doğru metin kullan.
5. Disabled state sadece opacity değil; cursor, border ve gerekiyorsa açıklama ile anlaşılır olsun.

## Hızlı İşlem Özel Kararı

`/hizli-islem` tek ekranlı **Hızlı Satış Masası** olarak sadeleşir.

Olması gereken aksiyonlar:

- `Tekliften Çağır`
- `Yeni Fiş`
- `Önizle`
- `Satış Kaydet`
- `Teklif Olarak Kaydet`
- `Tahsilat Kaydet`
- `Onaya Gönder`

İş kuralları:

- Ürün satırı varsa satış/sipariş taslağı hazırlanır.
- Ürün satırı varsa `Teklif Olarak Kaydet` teklif taslağı hazırlar.
- Tekliften çağırılan fiş satışa dönüştürülebilir.
- Ürün satırı yok ama ödeme bilgisi doluysa tahsilat akışı çalışır.
- Ürün yok + ödeme yok ise eksik bilgi uyarısı verilir.
- Gerçek kritik mutation approval/policy/audit olmadan yapılmaz.

## Uygulama Sırası

1. Shell ve global tema tokenlarını doğrula.
2. Dashboard/Ana Sayfa açık ve koyu mod uyumunu düzelt.
3. Hızlı İşlem ekranını tek Hızlı Satış Masası kararına göre yeniden toparla.
4. Onaylar, WhatsApp, Cariler, Stok, Raporlar gibi kabul edilmiş sayfalarda sadece ölçü/renk/taşma polish yap.
5. Siparişler, Teklifler, Tahsilatlar, İadeler gibi ayrı modül sayfalarını hızlı işlem kopyası olmaktan çıkar; liste/detay modülü olarak bırak.
6. Her sayfa için 1920x1080 ve mobil smoke kontrolü yap.

## Kabul Kriterleri

- Açık mod zümrüt/altın/krem kimliği net.
- Koyu mod siyah cam/neon kimliği net.
- Aynı sayfa açık/koyu modda aynı ölçü kontratını koruyor.
- Body scroll yok.
- Yatay scroll yok.
- Kart içinde yazı/sayı taşması yok.
- İlk görünümde listeli sayfalarda en az 5 satır görünüyor.
- Sağ kolon sayfaya bağlı özet/uyarı/bilgilendirme paneli olarak çalışıyor.
- Büyük grafikler liste/işlem alanını ezmiyor.
- Kaydet/sil/gönder aksiyonları toast veriyor.
- Mükerrer riskli butonlar başarılı işlem sonrası pasifleşiyor.
- Türkçe metinler profesyonel.
- Emoji ikon yok.

## Test Komutları

```powershell
pnpm --filter @hallederiz/web typecheck
pnpm --filter @hallederiz/ui typecheck
pnpm smoke:navigation
```

## Geri Alma Notu

UI standardı token katmanı geri alınacaksa önce şu dosyalar incelenir:

- `apps/web/app/styles/brand-design-language.css`
- `apps/web/app/globals.css`
- `docs/product/UI_DESIGN_LANGUAGE_EMERALD_GOLD.md`

Sayfa bazlı polish değişiklikleri ayrı commit/PR halinde tutulmalıdır.
