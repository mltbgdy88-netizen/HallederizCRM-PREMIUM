# Documents + WhatsApp Delivery Phase 2 Report

## Özet

Faz 2, belge PDF/iletim ve WhatsApp kanal hazırlığını mevcut API/SDK sözleşmesi içinde güçlendirir. Yeni backend endpoint veya bağımlılık eklenmedi. UI’da sahte “PDF oluşturuldu / gönderildi / bağlandı” mesajları üretilmez; indirme yalnızca doğrulanmış HTTP URL ile açılır. WhatsApp outbound için web SDK’da gönderim metodu yok — composer taslak modunda kalır; kanal durumu için `GET /health/whatsapp` okuma bağlandı.

## Değişen modüller

| Alan | Dosyalar |
|------|----------|
| Belgeler | `document-action-feedback.ts`, `document-action-messages.ts`, `document-delivery-utils.ts`, `DocumentsPage.tsx`, `DocumentDetailPage.tsx` |
| WhatsApp | `WhatsAppPage.tsx`, `whatsapp-channel-health.ts`, `whatsapp-action-messages.ts` |
| SDK | `packages/sdk/src/clients/whatsapp.client.ts` → `getChannelHealth()` |
| Test | `document-action-feedback.test.ts`, `whatsapp-channel-health.test.ts` |

## Documents endpoint/SDK haritası

| İşlem | API | SDK | Web kullanımı |
|-------|-----|-----|----------------|
| Liste | `GET /documents` | `documents.list()` | `get-documents.ts` |
| Detay | `GET /documents/:id` | `documents.detail(id)` | Detay sayfası |
| Render | `POST /documents/render` | `documents.render(input)` | Hızlı İşlem / servis katmanı |
| PDF yenile | `POST /documents/:id/regenerate` | `documents.regenerate(id)` | `runDocumentLiveAction("regenerate")` |
| WhatsApp iletim | `POST /documents/:id/send-whatsapp` | `documents.sendWhatsApp(id)` | Canlı modda kuyruk dili |
| E-posta iletim | `POST /documents/:id/send-email` | `documents.sendEmail(id)` | Canlı modda kuyruk dili |
| Arşiv kuyruk | `POST /documents/:id/queue-save` | `documents.queueSave(id)` | `ai-local-output-routes` |
| Yazdırma kuyruk | `POST /documents/:id/queue-print` | `documents.queuePrint(id)` | `ai-local-output-routes` |
| İş listesi | `GET /file-save-jobs`, `GET /print-jobs` | — (web `documents.service`) | Detay paneli |

**Document tipi (`packages/types`):** `previewText`, `deliveries[]` — `pdfUrl` / `downloadUrl` alanı yok.

## PDF render/regenerate/download durumu

- **Regenerate/render:** API `Document` nesnesi döner; binary veya public URL alanı tip tanımında yok.
- **İndirme:** `hasDownloadablePdf` yalnızca `previewText` veya yanıt kaydındaki `pdfUrl` / `downloadUrl` / `fileUrl` / `binaryUrl` / `publicUrl` alanları **HTTPS URL** ise true.
- **UI:** İndir butonu URL yoksa “İndirme bekleniyor”; tıklamada `MSG_DOC_DOWNLOAD_PENDING` (“Belge dosyası hazır olduğunda indirme bağlantısı burada görünecek.”).
- **Canlı regenerate başarı:** “Belge işlemi kuyruğa alındı.” + “PDF hazır olduğunda indirme bağlantısı görünecek.” — “PDF oluşturuldu” yok.
- **Delivery `status: "delivered"`** yalnızca kanal teslim kanıtı varsa “İletim tamamlandı.” (belge teslim kaydı).

## E-posta / WhatsApp belge iletim durumu

- Endpoint ve SDK mevcut; UI `runDocumentLiveAction` ile çağırır.
- Varsayılan başarı: `MSG_DOC_SEND_QUEUE` — “İletim kuyruğa alındı; durum belge ekranından takip edilebilir.”
- `delivered` teslim kaydı olmadan “gönderildi” ifadesi kullanılmaz.
- Demo modda: önizleme toast’ları; canlı gönderim iddiası yok.

## Archive / queue save durumu

- **Arşiv listesi API:** Yok — `ARCHIVE_DEMO_RECORDS` only.
- **queue-save:** API `201` + job `item` (local output store); UI `MSG_DOC_ARCHIVE_QUEUE`. `archiveId` / indirme URL’si yanıtta yoksa sahte arşiv başarısı gösterilmez.
- Faz 2: rapor + güvenli toast; arşiv sayfası değiştirilmedi.

## WhatsApp QR/session/outbound haritası

| İşlem | API | SDK (Faz 2 sonrası) | Web |
|-------|-----|---------------------|-----|
| Konuşma listesi | `GET /whatsapp/conversations` | `listConversations()` | Canlı inbox |
| Detay | `GET /whatsapp/conversations/:id` | `getConversation(id)` | Canlı |
| Kanal sağlık | `GET /health/whatsapp` | `getChannelHealth()` | Bağlantı paneli (canlı) |
| Outbound mesaj | `POST /whatsapp/outbound` | **Yok** | Composer readOnly / taslak |
| Webhook | `GET/POST /whatsapp/webhook` | — | Sunucu |
| QR / session | **Yok** | — | QR placeholder metni |
| Template list | `GET /whatsapp/templates` | **Yok** | Demo şablon |

**Outbound için SDK/API eksik (web send); Faz 2B backend + `WhatsAppClient.sendOutbound` gerekir.**

## Hızlı İşlem belge segmenti uyumu

- Submit sonrası `documentIds` varsa entity link helper ile `/belgeler/{id}` yönlendirmesi Phase 1 ile uyumlu (değişiklik gerekmedi).
- Belge segmenti PDF hazır değilse kullanıcı belge ekranından durum + indirme bekleniyor akışını görür.
- Segment submit sahte gönderim başarısı üretmez.

## Demo / production davranışı

| Mod | Belgeler | WhatsApp |
|-----|----------|----------|
| Demo (`NEXT_PUBLIC_USE_DEMO_DATA=true`) | Tüm mutation toast blok; indirme önizleme | Mock inbox; bağlantı “canlı değil” |
| Production | SDK mutation + güvenli mesajlar | Inbox canlı; health okuma; gönderim yok |

Offline / teknik hata: `mapDocumentActionError`, `mapWhatsAppInboxError` — kullanıcıya teknik metin yok.

## Kalan boşluklar

1. **PDF binary / kalıcı download URL** — Document tipi ve API yanıtında yok; worker/storage Faz 2B.
2. **WhatsApp outbound SDK** — `POST /whatsapp/outbound` API’de var, web SDK’da method yok; UI fake send yapmıyor.
3. **QR / session endpoint** — Yok.
4. **Arşiv canlı API** — Yok.
5. **queue-save → archiveId** — Job store; arşiv UI bağlantısı sonraki faz.

## Faz 2B / Faz 3 önerileri

- **2B:** Document’a `downloadUrl` veya signed URL endpoint; regenerate yanıtında URL.
- **2B:** `WhatsAppClient.sendOutbound` + onaylı gönderim UI (yalnız `outbound_sent` kanıtında “gönderildi”).
- **2B:** QR/session health endpoint veya mevcut health genişletmesi.
- **3:** Arşiv read API + belge queue-save sonucu arşiv detay linki.

## Test sonuçları

| Komut | Sonuç |
|-------|--------|
| `pnpm --filter @hallederiz/web build` | Geçti |
| `pnpm --filter @hallederiz/web typecheck` | Geçti |
| `pnpm smoke:navigation` | 24/24 geçti |
| `pnpm smoke:api-offline` | 24/24 geçti |
| `pnpm smoke:all` | Geçti (production-data API kapalıyken atlandı) |
| `document-action-feedback.test.ts` | 5/5 geçti |
| `whatsapp-action-feedback.test.ts` | 6/6 geçti |
| `whatsapp-channel-health.test.ts` | 3/3 geçti |

Browser hızlı kontrol (`/belgeler`, `/whatsapp`, `/archive`, `/hizli-islem`): bu oturumda manuel tarayıcı doğrulaması yapılmadı; smoke:api-offline route HTTP ve mesaj sabitleri kontrol edildi.
