# HallederizCRM-PREMIUM Architecture

## 1. Mimari Cerceve
HallederizCRM-PREMIUM, monorepo tabanli, domain odakli ve cok kiracili mimari prensiplerle tasarlanmistir. Sistem; sade bir kullanici arayuzu, guclu arka plan islem motoru, denetlenebilir otomasyon ve insan onayli AI akislari uzerine kurulur.

Mimari hedefler:
- Modulerlik ve genisleyebilirlik
- Domain ayrimi ve teknik borc kontrolu
- Islenebilir audit izi
- Entegrasyonlara karsi dayanikli adapter yapisi
- Yol haritasi fazlarina uygun evrimsel buyume

## 2. Ust Seviye Monorepo Yapisi

### 2.1 `apps/*` gorevleri
1. `apps/web`
- Masaustu benzeri kurumsal on yuz
- App shell, sayfa akislari, rol bazli gorunum kontrolu
- Dashboard kartlari, modal gecisleri, kullanici etkileşimi

2. `apps/api`
- Ana HTTP API giris noktasi
- Domain servisleri ve authorization gecitleri
- Platform core ve is modulleri endpoint orkestrasyonu

3. `apps/worker`
- Arka plan gorevleri, queue isleyicileri, zamanlanmis isler
- Senkronizasyon, rapor uretim ve operasyon otomasyonlari

4. `apps/ai-service`
- Lokal model orkestrasyonu
- AI mesaj/proposal akislari
- Prompt, context ve inference yonetimi

5. `apps/local-agent`
- Yerel cihaz yetenekleri (print/save vb.) ile guvenli kopru
- Insan onayli lokal komut icrasi
- Kurumsal cihaz politikalarina uyumlu agent katmani

### 2.2 `packages/*` gorevleri
1. `packages/ui`
- Ortak tasarim dili, app shell ve paylasilan componentler

2. `packages/database`
- Veri erisim soyutlamalari ve DB baglantisi
- Repository veya query katmanina temel hazirlik

3. `packages/domain`
- Domain modelleri, is kurali yardimcilari, policy fonksiyonlari
- Auth/permission ve operasyon karar mantigi

4. `packages/sdk`
- Uygulamalar arasi API iletisim istemci katmani
- Gelecekte harici istemciler icin tekrar kullanilabilir kontratlar

## 3. Sistem Katmanlari
Mimari 6 ana katmanda dusunulur:

1. Platform
- Auth, RBAC, tenant, ayarlar, app shell, temel guvenlik ve audit

2. Cekirdek CRM
- Cari yonetimi, iliski ve ticari kimlik kayitlari

3. Operasyon Motoru
- Workflow, task, alert, approval ve domain aksiyon orkestrasyonu

4. Entegrasyonlar
- ERP, fabrika, WhatsApp ve belge dagitim adapterlari

5. Yapay Zeka
- Read-only analiz, proposal uretimi, approval odakli mutation akislar

6. Mobil ve Yerel Cikti
- Rol bazli mobil kullanim
- Local Print & File Agent ile cihaz bagli cikti senaryolari

Bu katmanlar birbirine bagimli olsa da sorumluluklari ayrik tutulur; ozellikle domain ile entegrasyon katmani arasinda anti-corruption siniri korunur.

## 4. App Shell Prensibi
Web uygulamasinin temel iskeleti tek tip bir app shell uzerine kurulur:

1. Sol menu masaustunde sabittir.
2. Ust bar global baglam (sayfa basligi, arama, bildirim, kullanici) tasir.
3. Icerik alani modul bazli dinamik render edilir.
4. Light/dark tema, sistem geneline etkili ve kullanici bazli tercihle calisir.

Bu yapi, kullanicinin moduller arasi gecis yaparken baglam kaybetmemesini saglar ve ERP benzeri masaustu deneyimi sunar.

## 5. AI + Approval Mimarisi
AI altyapisi, kontrolsuz otomasyon degil kontrollu karar destek modeli uzerine kurulur.

### 5.1 Akis
1. AI proposal uretimi
- AI, ilgili kayit baglamini okuyarak aksiyon onerisi uretir.

2. Approval record olusumu
- Oneri, onay kaydi ile birlikte approval kuyruguna dusurulur.

3. Server-side execution
- Onaylanan oneriler API/worker tarafinda domain komutu olarak calistirilir.

4. Audit
- Oneri, onaylayan, sonuc ve yan etkiler audit olaylarina kaydedilir.

### 5.2 Guvenlik ve denetlenebilirlik
- Varsayilan mod read-only
- Mutation icin zorunlu insan onayi
- Degisikliklerin entity timeline uzerinden geriye donuk incelenebilmesi

## 6. WhatsApp Mimarisi
WhatsApp katmani tek tip mesajlasma degil, rol ve senaryoya gore ayrik kanal mantigiyla kurgulanir.

1. Bayi self-service kanali
- Siparis durumu, belge erisimi, temel bilgi sorgulari

2. Personel gorev mesajlari
- Operasyonel gorev bildirimleri, gecikme/istisna uyarilari

3. Yonetici komut/onay kanali
- Onay bekleyen isler, kritik kararlar, hizli komut mesajlari

Hybrid workflow prensibi:
- Kural tabanli cevaplar
- AI destekli oneriler
- Kural/fallback ile kesintisiz servis

## 7. Dashboard Kart Mimarisi
Dashboard, pasif rapor sayfasi degil aksiyon merkezi olarak tasarlanir.

### 7.1 Kart tipleri
1. Sistem kartlari
- Geciken gorevler, onay bekleyen kayitlar, senkronizasyon hatalari

2. AI kartlari
- AI onerileri, ozetler, risk/uyari sinyalleri

### 7.2 Etkileşim modeli
- Kart secimi -> modal acilisi
- Modal icerigi -> ilgili kayida veya modul sayfasina yonlendirme
- Kullanici, dashboarddan cikmadan hizli karar ve aksiyon verebilir

## 8. Tipik Istek Akisi
Ornek istek zinciri:
1. `apps/web` kullanici etkileşimini toplar.
2. `apps/api` yetki/policy kontrolu yapar.
3. Gerekirse `packages/domain` is kurallari calisir.
4. Veri `packages/database` ile PostgreSQL'e yazilir/okunur.
5. Asenkron isler `apps/worker` tarafina aktarilir.
6. AI veya entegrasyon baglamli isler ilgili servislerde sonuclanir.
7. Tum kritik adimlar audit/timeline kayitlarina islenir.

Bu zincir, urun buyurken de korunacak temel mimari omurgadir.

