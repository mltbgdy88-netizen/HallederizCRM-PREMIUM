# Production-safe Right Rail AI Assistant UI

## Amaç
Dashboard sağ kolonundaki AI Asistan paneli: premium hero → mesaj listesi → composer; sahte video, zamanlayıcı, ses transkripti veya sahte API başarısı yok.

## Görünüm
- Başlık: yalnızca "AI Asistan" + renkli durum noktası (yazılı rozet yok); alt ince ayırıcı.
- Üst hero: 16/10, yükseklik ~220–240px, 16px radius; koyu zemin + radial glow + kenar vignette; merkezde ring + orb + devre dışı play (tıklama yok, metin yok).
- Sohbet yüzeyi: hero ile composer arasını dolduran yumuşak arka plan; kaydırma yalnız mesaj listesinde; kesik çerçeve / boş kutu yok.
- Karşılama: `Merhaba! Size nasıl yardımcı olabilirim?` yalnızca istemci tarafı UI metni; API yanıtı gibi sunulmaz.
- Mesajlar: kullanıcı sağda (mor gradient), asistan solda (beyaz/soft); sistem uyarıları kısa amber ton; küçük gri zaman damgası.
- Yükleme: asistan satırında beyaz balon içinde üç nokta animasyonu.
- Dipnot: uygun yanıtlarda asistan balonunun altında `öneri modu · canlı işlem yapılmadı` (mutation / provider / durum bilgisinin tek satırlık özeti); ayrı debug chip yok.
- Composer: boş placeholder; `aria-label="AI asistana mesaj yaz"`; Enter gönderir; mikrofon servis dışıysa `disabled` + `title="Ses servisi hazır değil"` (ekranda bu cümle basılmaz).

## Davranış
- `chatSalesAssistant` gerçek çağrı; kullanıcı mesajı anında listelenir, ardından yükleme balonu, sonra API yanıtı veya hata / sistem mesajı.
- Suggested actions otomatik execute edilmez.
- Ses: `speakSalesVoice`; TTS hazır değilse mikrofon pasif, sahte kayıt yok.

## Güvenlik
- Cookie tabanlı auth (`credentials: include` SDK ile); panelde localStorage/sessionStorage token yok.

## Bilerek yapılmayanlar
- Gerçek video stream veya sahte oynatma
- Otonom AI execution
- Tam mikrofon streaming / transkript simülasyonu
- WhatsApp live auto-send
