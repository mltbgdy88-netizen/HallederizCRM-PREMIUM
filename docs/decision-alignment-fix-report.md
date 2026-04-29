# Decision Alignment Fix Report

Tarih: 2026-04-29
Kapsam: Decision Alignment Fix Batch (dokuman + UI metin/etiket hizalama)

## 1. Duzeltilen Karar Uyumsuzluklari

- Uygulamanin erisim modeli netlestirildi:
  - Ana web uygulamasi ic personel cockpit'i olarak konumlandi.
  - Dis bayi/musteri icin ayri portal login olmadigi acikca belirtildi.
  - Dis bilgi akisi kanali olarak WhatsApp + belge paylasimi vurgusu sabitlendi.
- AI strateji metinleri local-first karara hizalandi:
  - Birincil AI local-first, external provider opsiyonel.
  - Mutation islemlerinde approval zorunlulugu korunuyor.

## 2. Guncellenen Canonical Route Referanslari

- Gorevler: `/gorevler` (legacy alias: `/tasks`)
- Onaylar: `/onaylar` (legacy alias: `/approvals`)
- AI Onaylari: `/ai/onaylar` (legacy alias: `/ai/proposals`)
- AI Icgoruler: `/ai/icgoruler` (legacy alias: `/ai/insights`)
- Pilot Hazirlik: `/ayarlar/pilot-hazirlik`
- Staging Kontrol: `/ayarlar/staging-kontrol`

Not: Legacy route adlari dokumanlarda yalnizca alias/not baglaminda birakildi.

## 3. AI Local-First Gorunurlugu Icin Yapilan Duzeltmeler

- AI ekraninda local-first / read-only default / approval zorunlu rozetleri korunup netlestirildi.
- AI toolbar'daki heniz canli olmayan `Prompt Kitapligi` aksiyonu `Foundation` olarak etiketlenip pasiflestirildi.
- Staging metinleri local-first + external opsiyonel davranisiyla uyumlu kalacak sekilde korundu.

## 4. Dis Bayi Login'i / Portal Algisini Onleyen Duzeltmeler

Asagidaki dokumanlarda "ayri dis portal" algisini onleyen net metinler eklendi/guncellendi:

- `docs/master-project-spec.md`
- `docs/architecture.md`
- `docs/module-map.md`
- `docs/roadmap.md`
- `docs/pilot-operator-guide.md`
- `docs/pilot-readiness-status.md`

## 5. Foundation / No-Op Aksiyonlarin Acik Isaretlenmesi

Kullanici beklentisini yaniltmamak icin canli bagli olmayan butonlar `Foundation` etiketiyle pasiflestirildi:

- WhatsApp ekrani:
  - toolbar aksiyonlari
  - cevap/sablon/action request alanlarindaki no-op butonlar
- ERP ekrani:
  - toolbar aksiyonlari
  - baglanti karti/islem butonlari
  - baglanti modal ve template aksiyonlari
- Fabrikalar ekrani:
  - stok/siparis toolbar aksiyonlari
  - siparis detay mutation aksiyonlari
- AI ekrani:
  - `Prompt Kitapligi` aksiyonu

Bu isaretleme "bozuk" hissi olusturmadan, hangi aksiyonlarin foundation oldugunu kurumsal sekilde gorunur kilar.
