# 014 — Quick Operation Side Actions Foundation

## Bu PR ne ekledi
Bu adimda Hizli Islem submit sonucuna uc yan aksiyon foundation'i eklendi:
- Belge Onizle (document preview)
- WhatsApp Taslagi
- AI Operasyon Notu/Uyarisi

`/quick-operations/submit` response'u artik `sideActions` alani donebilir.

## Belge onizleme foundation davranisi
- Her operation type icin (offer, sale_order, delivery, payment, return) typed belge onizleme taslagi uretilir.
- Onizleme satir, toplam ve referans bilgisi icerir.
- Bu turda gercek PDF binary render yoktur.

## WhatsApp draft foundation davranisi
- Operation type'a gore metin taslagi uretilir.
- `sendEnabled: false` ile acikca gercek gonderim disi oldugu belirtilir.
- Bu turda gerçek WhatsApp send yoktur.

## AI insight template/local fallback yaklasimi
- AI insight bu turda template tabanli uretilir (`source: "template"`).
- Satir kaynak tiplerine gore uyarilar ve oneriler olusturulur.
- Local AI provider cagirmasi bu turda zorunlu degildir.

## Frontend davranisi
- Submit sonrasi gelen `sideActions` state'e alinir.
- "Belge Onizle" ve "WhatsApp Taslagi" butonlari taslak paneli acar.
- AI insight operasyon etkisi panelinde gorunur.
- Kullaniciya acik mesaj: gercek gonderim/PDF bu turda aktif degildir.

## Bu turda bilincli olarak yapilmayanlar
- Gercek PDF render/uretimi
- Gercek WhatsApp gonderimi
- AI execution/mutation baglantisi
- delivery/return full execution

## Sonraki is
- delivery/return execution binding
- real document render + WhatsApp send approval entegrasyonu
