# Production-safe Right Rail AI Assistant UI

## Amac
Dashboard sag kolonundaki AI Asistan panelini fake video/fake voice/fake success davranislarindan arindirip gercek endpoint tabanli, production-safe bir UX'e tasimak.

## Component yapisi
- `DashboardAiAssistantPanel` sag rail satis asistani olarak calisir.
- Panel dort bolum: baslik (durum rozeti), kucuk tanitim/hero onizleme (16:9, oynatma yok), sohbet listesi, composer.

## Media panel durust davranis standardi
- Ustte kucuk premium hero/video **onizleme** alani kalir; ortada yalnizca dekoratif play gorunumu (devre disi dugme, tiklaninca oynatma yok).
- Fake playback, fake waveform, fake timer, sahte sure cubugu kullanilmaz.

## Chat ve quick action davranisi
- Chat sonucu endpointten donen yaniti gosterir.
- Bos durumda tek placeholder metni kullanilir.
- Asistan cevabi mutation veya canli kanal gonderimi olarak sunulmaz.
- Suggested action varsa kisa sistem mesaji ile belirtilir, otomatik execute edilmez.

## Voice davranisi
- Composer icindeki mikrofon butonu provider uygun degilse disabled kalir.
- Fake transcript/audio uretilmez.

## Health/degraded state standardi
- Header sadece kisa durum etiketi gosterir: hazir / kisitli / kapali.
- Teknik health detaylari panelde kalabalik yaratmaz; asistan yaniti sonrasi gerekirse tek satir `oneri modu · canli islem yapilmadi` dipnotu.

## Dashboard entegrasyonu
- Panel dashboard split side bolgesinde calisir.
- Desktop sag kolon genisligi 380-440px bandinda tutulur.
- Sohbet listesi scroll alir, composer altta gorunur kalir.
- Mobil/tablet duzende panel full width stack olur.

## Guvenlik kurallari
- API cagrilarinda mevcut cookie tabanli auth modeli korunur.
- localStorage/sessionStorage token kullanimi eklenmez.
- Production gate/degraded cevaplari basari gibi gosterilmez.
- Otonom kritik action veya canli auto-send acilmaz.

## Bilerek yapilmayanlar
- Gercek video stream altyapisi
- Otonom AI execution
- Full mikrofon streaming implementasyonu
- WhatsApp live auto-send
