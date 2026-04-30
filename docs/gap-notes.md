# Gap Notes

Bu notlar pilot oncesi bilincli olarak foundation seviyesinde birakilan alanlari ve sonraki oncelikleri listeler.

## 1. Bilincli Placeholder Foundation Alanlari

- Gercek auth/token dogrulama henuz mock session uzerindedir.
- Form mutation'lari UI seviyesinde foundation olarak durur; kalici backend persistence sonraki turda baglanacaktir.
- PDF render, e-fatura, WhatsApp provider ve ERP secret yonetimi gercek adapter'a bagli degildir.
- AI model cagrilari mock adapter uzerindedir; proposal/approval/execution kontrati gercek entegrasyona hazirdir.
- Local agent yazdirma ve dosya kaydetme handler'lari OS seviyesinde gercek cikti uretmez; queue ve policy kontrati hazirdir.

## 2. Pilot Icin Kapatilan Kritik Kopukluklar

- Cari karti aksiyonlari ilgili teklif, siparis, tahsilat, belge ve WhatsApp route'larina baglandi.
- Yeni teklif ekrani cari query baglamindan fiyat grubu snapshot'i uretebilir hale getirildi.
- Siparis detayindaki teslim ve fatura aksiyonlari uygun mock kayit varsa dogrudan detay route'una gider.
- Belge merkezi secili belge baglamiyla entity navigasyonu, queue save ve queue print aksiyonlarini gosterir.
- WhatsApp belge aksiyonu belge merkezine document query parametresiyle gider.
- Fabrika siparis listesinde detay acma tek tik ve acik aksiyonla gorunur hale getirildi.

## 3. Sonraki Yuksek Oncelikli Isler

1. Deliveries/Invoices/Returns/Documents line-level SQL parity'si icin line tablolarini migration tarafinda tamamlama.
2. Warehouse order line-level DB parity'yi tamamlamak.
3. DB-mode integration testlerini gercek test veritabaniyla CI'da kosmak.
4. UI'da conflict (409 stale update) handling deneyimini form seviyesinde iyilestirmek.
5. Document detail route'u ekleyip belge preview ve delivery history'yi detay sayfasina tasimak.
6. Approval execution sonucunu audit/timeline mock verisine yazmak.

## 4. Core Completion Batch Sonrasi Durum

- Auth context'te tenant mismatch guard'i aktiflestirildi.
- Payments ve warehouse orders icin DB-first read/write path genisletildi.
- Approval execution failure/cancel audit izi guclendirildi.
- Local output print/file lifecycle audit eventleri eklendi.
- Document render ve document delivery DB kayit semantigi guclendirildi.

## 2026-04-29 Pilot Blocker Follow-up
- `/approvals/:id/execute` no longer stays status-only for supported actions; it now creates/runs approval execution dispatch and writes execution result back to approval record.
- Unsupported approval execute paths now return explicit `execution_action_not_active` instead of silent no-op.
- Detail helpers for approvals/tasks/workflows/documents/deliveries/factory orders now avoid falling back to unrelated first records when an invalid id is provided.
- Pilot readiness items now expose `readinessState` (`go_live_blocker`, `demo_gap`, `warning`, `ready`) to separate real go-live blockers from demo gaps.

## P1 UX Reliability Notes (2026-04-29)
- Gorevler/Belgeler/ERP/WhatsApp/AI/Fabrikalar filtre panellerinde no-op davranis acikca foundation olarak etiketlendi.
- Gorevler ve Fabrikalar listelerinde secili satir -> sag panel senkronizasyonu guclendirildi.
- Kritik listelerde gorunur Detay/Ac aksiyonlari standardize edilmeye devam ediyor.

## Local-First AI Correction (2026-04-29)
- AI runtime varsayilan provider modeli local-first olarak netlestirildi (local -> external -> fallback).
- OpenAI baglantisi zorunlu yol olmaktan cikarilip opsiyonel provider olarak konumlandi.
- CRM/WhatsApp/sesli AI davranis modelinde proposal + approval zorunlulugu korunarak ortaklasma guclendirildi.

## Decision Alignment Fix (2026-04-29)
- Canonical route sozlugu `/gorevler`, `/onaylar`, `/ai/onaylar`, `/ai/icgoruler`, `/ayarlar/pilot-hazirlik`, `/ayarlar/staging-kontrol` uzerinde sabitlendi.
- Dokuman ve UI metinlerinde web uygulamanin ic personel cockpit'i oldugu netlestirildi; dis bayi/musteri akisinda ayri portal login yerine WhatsApp + belge paylasimi modeli vurgulandi.
- ERP / Fabrika / WhatsApp / AI tarafindaki no-op toolbar ve aksiyon butonlari `Foundation` etiketiyle pasiflestirilerek yanlis canli-islem beklentisi azaltildi.
- Not: ` /approvals/:id/execute ` gibi ifadeler API endpoint adidir; web canonical route karsiligi `/onaylar` olarak korunur.

## Pilot Acceptance Polish (2026-04-30)
- `.env.example` production/pilot kritik flag aciklamalariyla guncellendi:
  - demo auth / demo fallback
  - postgres mode zorunlu alanlari
  - webhook secret gereksinimleri
  - local AI ve local agent alanlari
- Hizli Islem delivery/return execution baglantisi sonrasi manuel QA planlari eklendi:
  - `docs/qa/quick-operation-manual-test-plan.md`
  - `docs/qa/whatsapp-workflow-manual-test-plan.md`
- Pilot kabul kontrol listesi eklendi:
  - `docs/implementation/016-pilot-acceptance-checklist.md`
