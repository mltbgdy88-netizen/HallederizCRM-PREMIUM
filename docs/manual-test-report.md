# Manual Test Report

Tarih: 2026-04-29  
Proje: HallederizCRM-PREMIUM  
Test tipi: Manuel kullanıcı odaklı uçtan uca doğrulama + teknik komut doğrulaması

## 1. Test edilen modüller

- Dashboard (`/`)
- Görevler (`/gorevler`)
- Onaylar (`/onaylar`)
- Cariler (`/cariler`)
- Stok (`/stok`)
- Teklifler (`/teklifler`)
- Siparişler (`/siparisler`)
- Tahsilatlar (`/tahsilatlar`)
- Depo (`/depo`)
- Teslimatlar (`/teslimatlar`)
- Faturalar (`/faturalar`)
- İadeler (`/iadeler`)
- Fabrikalar (`/fabrikalar/stoklar`, `/fabrikalar/siparisler`)
- ERP (`/erp`)
- WhatsApp (`/whatsapp`)
- AI (`/ai`, `/ai/onaylar`, `/ai/icgoruler`)
- Belgeler (`/belgeler`)
- Raporlar (`/raporlar`)
- Kullanıcılar (`/kullanicilar`)
- Roller (`/kullanicilar/roller`)
- Ayarlar (`/ayarlar`)
- Pilot Hazırlık (`/ayarlar/pilot-hazirlik`)
- Staging Kontrol (`/ayarlar/staging-kontrol`)
- Kurulum/İçe Aktarım (`/kurulum/veri-yukleme`)

Not: Yukarıdaki rota seti HTTP render testinde 200 döndü.

## 2. Sorunsuz çalışan akışlar

- Root teknik doğrulama komutları temiz:
  - `pnpm typecheck` başarılı
  - `pnpm build` başarılı
  - `pnpm run smoke:routes` başarılı
  - `pnpm run smoke:navigation` başarılı
- Temel ekran açılışı, sol menü navigasyonu, kart/tablo render zinciri stabil.
- Pilot hazırlık ekranı genel checklist ve rol kartlarıyla görüntüleniyor.
- Import merkezi (CSV/XLSX yüzeyleri dahil) görünür ve erişilebilir.
- Health/staging ekranları erişilebilir ve fallback/live durumu için temel sinyal üretiyor.

## 3. Bulunan kırık/eksik akışlar

- `approval -> execution` zincirinde kısmi kopukluklar var:
  - AI proposal onayı sonrası bazı senaryolarda execution’a güvenilir geçiş eksik.
  - Onay ekranındaki bazı aksiyon butonları foundation/no-op davranıyor.
- AI tarafında proposal/approval ilişkisi görsel olarak mevcut ancak her durumda tam domain dispatch garantisi yok.
- Belge/local output tarafında queue yaşam döngüsü var; gerçek OS yazdırma/kaydetme davranışı çoğunlukla foundation seviyesinde.
- ERP/Factory/WhatsApp ekranlarında bazı “Test Et/Gönder” aksiyonları operasyonel görünüp kısmen mock/fallback çalışıyor.
- Dokümanlarda geçen bazı legacy route adları ile mevcut route isimleri uyumsuz:
  - Örn. `/tasks`, `/approvals` doküman beklentisi; uygulama `/gorevler`, `/onaylar`.

## 4. Kullanılabilirlik problemleri

- Bazı sayfalarda filtreler görsel olarak var ama etkisi sınırlı veya no-op hissi veriyor.
- Sağ panel seçimi ile ana tablo seçimi bazı ekranlarda tam senkron değil.
- Bazı aksiyon isimleri “çalışır” hissi verirken fallback davranışına düştüğü kullanıcıya yeterince erken anlatılmıyor.
- Dokümantasyon-UI route terminolojisi farklı olduğunda operatör tarafında öğrenme maliyeti artıyor.

## 5. Teknik riskler

- API dağıtım çıktısı (`dist`) ile kaynak route kayıtları arasında eşleşme riski:
  - Kaynakta olan bazı route’lar belirli runtime denemelerinde görünmeyebiliyor (build artefact/runtime farkı riski).
- Approval execution idempotency ve hata sınıflandırması (retryable/non-retryable) tüm aksiyonlarda eşit olgunlukta değil.
- Local agent gerçek ortamda yazıcı/sürücü/izin farkları nedeniyle demo dışına geçişte operasyonel sürpriz üretebilir.
- Entegrasyonlarda (AI/ERP/Factory/WhatsApp) fallback aşırı sessiz kalırsa canlı geçiş öncesi yanlış “hazır” algısı oluşabilir.

## 6. Pilot için bloklayıcılar

Kritik (go-live öncesi kapanmalı):
- Approval sonrası execution zincirinde tüm hedef aksiyonların gerçek ve doğrulanabilir çalışması.
- Onay ekranındaki mutation etkili butonların no-op/foundation kalanlarının tamamlanması.
- Belge save/print işlerinin local agent üzerinden en az bir gerçek staging senaryosunda uçtan uca doğrulanması.

Yüksek (pilot verimini ciddi etkiler):
- ERP/Factory/WhatsApp “test bağlantı” aksiyonlarında gerçek/fallback ayrımının daha net kullanıcı mesajlarıyla verilmesi.
- Route terminolojisi için tek sözlük: doküman ve UI’nin aynı path/isimleri kullanması.

## 7. Önceliklendirilmiş düzeltme listesi

### Kritik
- Approval execution state machine ve dispatch kapsamını tüm aksiyon tiplerinde tamamla.
- Onay UI aksiyonlarını gerçek mutation sonuçlarına bağla (durum/audit/timeline geri beslemesi dahil).
- Document output + local agent zinciri için staging e2e kanıt senaryosu ekle.

### Yüksek
- Entegrasyon test butonlarında canlı/fallback/misconfigured mesajlarını standartlaştır.
- API runtime artefact doğrulaması: kaynak route ve çalışır build çıktısı birebir kontrol checklist’i.

### Orta
- Filtrelerin etkisiz olduğu ekranlarda davranışı netleştir veya UI’den kaldır.
- Sağ panel seçim senkronizasyonunu tablo satır etkileşimiyle tutarlı hale getir.

### Düşük
- Legacy route referanslarını dokümanlarda güncelle.
- Küçük metin/boş durum iyileştirmeleriyle operatör onboarding netliğini artır.

---

## Ek teknik not

Bu turda kapsam önceliği gereği büyük kod değişikliği yapılmadı; önce kullanıcı odaklı geniş kapsamlı tespit çıkarıldı. Küçük düzeltmeler bir sonraki hedefli hardening turunda düşük riskli patch seti olarak ayrıştırılmalı.
