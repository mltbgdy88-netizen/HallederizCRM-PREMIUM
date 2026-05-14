# Production-safe Right Rail AI Assistant UI

## Amac
Dashboard sag kolonundaki AI Asistan paneli: premium hero + gercek sohbet + composer; fake video/voice/success yok.

## Gorunum
- Baslik: yalnizca "AI Asistan" + renkli durum noktasi (yazi etiketi yok).
- Ust hero: 16/10, ~220-250px bandi, CSS gradient + glow + orb + merkez play (disari asset yok, oynatma yok).
- Sohbet: bos durumda metin yok; hafif bos canvas / pulse. Mesajlar kullanici sag / asistan sol; zaman damgasi kucuk gri.
- Yukleme: uc nokta animasyonu.
- Dipnot (API oneri modu): yalniz `oneri modu · canli islem yapilmadi` uygun cevaplarda.
- Composer: bos placeholder; `aria-label="AI asistana mesaj yaz"`; Enter / gonder; mikrofon yalniz `title` ile "Ses servisi hazir degil" veya seslendirme.

## Davranis
- `chatSalesAssistant` gercek cagri; demo modda bile SDK/demo stub, sahte client-side cevap yok.
- Suggested actions otomatik execute edilmez.
- Ses: `speakSalesVoice`; provider yoksa disabled, fake kayit yok.

## Guvenlik
- Cookie tabanli auth (`credentials: include` SDK ile); panelde token storage yok.

## Bilerek yapilmayanlar
- Gercek video stream
- Otonom AI execution
- Full mikrofon streaming
- WhatsApp live auto-send
