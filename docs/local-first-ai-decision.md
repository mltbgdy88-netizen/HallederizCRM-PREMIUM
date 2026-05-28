# Local-First AI Decision

## 1. Neden Local-First
HallederizCRM-PREMIUM icin AI kararinda birincil hedef kurum ici veri guvenligi, operasyonel denetlenebilirlik ve kanal bagimsiz tutarliliktir. Bu nedenle varsayilan mimari local-first olarak secilmistir.

## 2. OpenAI Neden Opsiyonel
OpenAI ve benzeri harici servisler tamamen kaldirilmamistir; ancak birincil calisma modu degildir. Harici provider:
- Lokal stack yoksa,
- Ozel tenant ihtiyaci varsa,
- Kontrollu pilot/staging senaryosu gerekiyorsa
opsiyonel olarak devreye alinabilir.

## 3. Ortak Davranis Modeli (CRM + WhatsApp + Ses)
Tum AI yuzeylerinde ayni operasyon modeli kullanilir:
1. Bilgi sorusu -> dogrudan yanit
2. Islem talebi -> proposal olusturma
3. Ozet + risk notlari gosterimi
4. Approval istegi
5. Approval sonrasi execution

Approval olmadan mutation dispatch edilmez.

## 4. Guvenlik ve Yetki Ilkeleri
- Read-only default
- Operation plan -> teyit -> execute
- Permission-aware AI
- Finance/privacy bariyerleri
- Kullanici/tenant baglamli actor ve audit izi

## 5. Eski Repo Ilkelerinden Yansitilan Noktalar
`mltbgdy88-netizen/hallederizcrm-wa-clean` ilhami ile asagidaki ilkeler stratejiye alinmistir:
- WhatsApp hybrid workflow (kural + AI + fallback)
- Musteri dogrulama odakli kanal davranisi
- Barkod / OCR / label pipeline dusuncesinin AI operasyon akislariyla uyumu

## 6. Runtime Onceligi
Resmi oncelik sirasi:
1. Local provider
2. External provider
3. Safe fallback

Bu siralama LLM, STT ve TTS katmanlarinin tamaminda gecerlidir.

## 7. Approval Coverage Matrisi (Operator Aksiyonlari)
Asagidaki aksiyonlar operator modunda approval zorunlulugu ile calisir:

| Aksiyon | Approval Gerekir | Execution Baglantisi |
|---|---|---|
| `create_offer` | Evet | Bagli |
| `create_order` | Evet | Bagli |
| `create_payment` | Evet | Bagli |
| `mark_warehouse_ready` | Evet | Bagli |
| `complete_delivery` | Evet | Bagli |
| `create_invoice` | Evet | Bagli |
| `create_return` | Evet | Bagli |
| `send_document_whatsapp` | Evet | Bagli |
| `queue_document_save` | Evet | Bagli |
| `queue_document_print` | Evet | Bagli |

Not:
- Read-only analiz/ozet yanitlari approval gerektirmez.
- Canli/dis provider secimi approval gereksinimini degistirmez.
