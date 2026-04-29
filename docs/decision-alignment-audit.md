# Decision Alignment Audit

Tarih: 2026-04-29  
Kapsam: Dokuman + UI + kod hizalama denetimi (buyuk kod degisikligi olmadan)

## Metod
- Dokumanlar: `master-project-spec`, `architecture`, `module-map`, `roadmap`, `gap-notes`, `local-first-ai-decision`, `pilot-readiness-status`, `pilot-operator-guide`, `manual-test-report`
- Kod/UI odaklari: Settings, AI, WhatsApp, ERP, Fabrika, Pilot Hazirlik, Staging Kontrol, auth/session

---

## Karar Bazli Denetim

### 1) AI yonu: Local-first mi, external-first mi?
- Su anki net karar: Local-first birincil; external provider (OpenAI vb.) opsiyonel.
- Uyum durumu: Kismen uyumlu (buyuk oranda evet).
- Sorun nerede:
  - `docs/module-map.md` icinde AI akis orneginde hala legacy `/ai/proposals` ifadesi geciyor.
  - `docs/openai-live-setup.md` ve `docs/live-provider-setup.md` varligi tek basina okunursa "external-first" algisi olusturabilir.
- Ne duzeltilmeli:
  - AI akis orneklerinde canonical route ve "opsiyonel external" notu birlikte gecmeli.
  - OpenAI dokumanlarinin basina "ikincil provider" etiketi konmali.

### 2) Dis bayi/musteri login'i var mi?
- Su anki net karar: Web tarafinda dis bayi/musteri portal login'i yok.
- Uyum durumu: Kismen uyumlu.
- Sorun nerede:
  - Kodda yalniz `/login` var ve platform core (ic personel) oturumu aciyor.
  - Dokumanlarda "bayi self-service" geciyor ama bunun portal mi, WhatsApp kanali mi oldugu her yerde ayni netlikte degil.
- Ne duzeltilmeli:
  - Dokumanlarda "bayi self-service = WhatsApp kanali" ifadesi standartlastirilmali.

### 3) Sistem sadece ic personel icin mi?
- Su anki net karar: Ana web uygulamasi ic personel odakli; dis taraf kanal entegrasyonlariyla temsil ediliyor.
- Uyum durumu: Uyumlu.
- Sorun nerede:
  - Bazi metinlerde (genel) bu ayrim acik yazilmiyor.
- Ne duzeltilmeli:
  - Operator guide ve module map icinde bir satirla "web app ic personel cockpit" tanimi eklenmeli.

### 4) WhatsApp dis kanal mi, ana operasyon yuzeyi mi?
- Su anki net karar: WhatsApp dis kanal + operasyon tetikleyici yuzey (hybrid workflow), tek basina ana backoffice yuzeyi degil.
- Uyum durumu: Kismen uyumlu.
- Sorun nerede:
  - UI'da bircok aksiyon foundation/no-op (mesaj gonder, action request ac vb.);
  - Bu nedenle "ana operasyon" izlenimi ile "gercek etki" arasinda bosluk var.
- Ne duzeltilmeli:
  - Foundation aksiyonlara acik rozet/metin eklenmeli veya canliya baglanmali.

### 5) Demo/fallback ile production davranisi ayrismi
- Su anki net karar: Ayrim var; health/readiness ile gorunur olmaya baslamis.
- Uyum durumu: Kismen uyumlu.
- Sorun nerede:
  - Bircok modulde gorunen aksiyonlarin bir kismi hala foundation.
  - Kullanici her ekranda net "canli mi fallback mi" sinyali almiyor.
- Ne duzeltilmeli:
  - Kritik aksiyon satirlarinda (ERP/Factory/WhatsApp/AI) mode badge standardi uygulanmali.

### 6) UI parity simdi mi, sonra mi?
- Su anki net karar: Kompakt parity hedefi var ama kademeli tamamlanma yaklasimi uygulanmis.
- Uyum durumu: Uyumlu.
- Sorun nerede:
  - Filtre ve test butonlarinin bir bolumu foundation oldugu icin parity goruntusu var, parity davranisi eksik.
- Ne duzeltilmeli:
  - Dokumanlara "gorsel parity + davranissal parity" ayrimi acikca yazilmali.

### 7) Canli entegrasyonlar simdi mi, sonra mi?
- Su anki net karar: Opsiyonel canli, varsayilan guvenli fallback/local.
- Uyum durumu: Uyumlu.
- Sorun nerede:
  - UI tarafinda Test Et aksiyonlari ile gercek baglanti etkisi her modulde ayni olgunlukta degil.
- Ne duzeltilmeli:
  - Test sonuc formati tum servislerde tek tiplestirilmeli (live/fallback/misconfigured + sonraki adim).

### 8) Portal var mi, yok mu?
- Su anki net karar: Ayrik web portal yok (bu repoda).
- Uyum durumu: Kismen uyumlu.
- Sorun nerede:
  - Dokumanlarda "bayi self-service" ifadesi portal algisina acik.
- Ne duzeltilmeli:
  - "Portal yok; dis erisim kanali WhatsApp" notu spec ve architecture'da net satir olmali.

### 9) Route sozlugu (dokuman vs uygulama)
- Su anki net karar: Canonical TR route seti (`/gorevler`, `/onaylar`, `/ai/onaylar`, `/ai/icgoruler`).
- Uyum durumu: Uyumsuzluk var.
- Sorun nerede:
  - `docs/module-map.md` icinde halen legacy path gecen satirlar var (`/approvals`, `/ai/proposals`).
- Ne duzeltilmeli:
  - Tek bir canonical route tablosu korunmali; legacy isimler sadece alias notu olarak kalmali.

### 10) AI ayarlari ve runtime kararinin UI gorunurlugu
- Su anki net karar: Local-first runtime (kodda), approval zorunlulugu (dokumanda).
- Uyum durumu: Kismen uyumlu.
- Sorun nerede:
  - `/ayarlar` icinde AI provider secimi/stt/tts alanlari tam form olarak degil, bilgi karti seviyesinde.
- Ne duzeltilmeli:
  - Ayarlar ekraninda en azindan provider secimi + davranis lock'lari (read-only default, approval required) konfig görünürlugune alinmali.

### 11) Approval zorunlulugu (AI + WhatsApp mutation)
- Su anki net karar: Mutasyonlar approval olmadan execute edilmez.
- Uyum durumu: Kismen uyumlu.
- Sorun nerede:
  - Manual test ve gap notlari bazi zincirlerde hala foundation/no-op veya kismi bagli oldugunu belirtiyor.
- Ne duzeltilmeli:
  - Approval -> execution coverage matrisi dokuman/ekran/API'de tek kaynaktan izlenmeli.

---

## Netlesmis Kararlar
- AI stratejisi local-first; external provider opsiyonel.
- AI mutation'larinda insan onayi zorunlu.
- Platform core cok kiracili ve ic personel odakli web cockpit.
- WhatsApp hybrid workflow (kural + AI + fallback) prensibi gecerli.
- Pilot readiness ve staging kontrol ekranlari operasyonel karar paneli olarak konumlandirildi.

## Duzeltilmesi Gereken Karar Uyumsuzluklari
- `docs/module-map.md` icindeki legacy route referanslari (ozellikle `/approvals`, `/ai/proposals`).
- Bayi self-service ifadesinin "portal" yerine "WhatsApp kanali" olarak standartlastirilmamasi.
- Ayarlar ekraninda AI provider karari/runtime secimi dokuman kadar acik konfig seviyesinde degil.
- Bazi kritik UI aksiyonlarinda foundation/no-op ile operasyonel metin arasinda beklenti farki.

## Sonraya Birakilabilecek Kararlar
- Ayrik dis portal ihtiyaci (eger isletme bunu isterse) bu repo icinde acil degil.
- Tam davranissal parity (tum filtrelerin canli sorguya baglanmasi) etapli ilerleyebilir.
- Tum canli entegrasyon testlerinin production-grade derinligi (opsiyonel canli mod politikasiyla birlikte) fazli tamamlanabilir.
