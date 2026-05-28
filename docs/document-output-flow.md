# Document Output Flow

## 1) Entity -> Document

Belge olusturma iki yoldan tetiklenir:
- `POST /documents/render`
- `POST /documents/:id/regenerate`

Route katmani:
- auth + permission guard uygular (`documents.write`, `documents.render`)
- `DocumentGenerationService` cagirir.

Service katmani:
- document type -> title/preview semantics uygular.
- mock/persistence store'a kayit yazar (mevcut batchte foundation seviyesi).

## 2) Document -> Queue

Belge aksiyonlari:
- `POST /documents/:id/queue-save`
- `POST /documents/:id/queue-print`

Bu endpointler:
- local output permission guard ile korunur
- file save / print job kuyruklarina kayit olusturur.
- print/file job status gecisleri audit olaylarina yazilir:
  - `local_output.print.start|completed|failed`
  - `local_output.file_save.start|completed|failed`

## 3) Queue -> Local Agent

Local agent dongusu:
1. `GET /print-jobs`
2. `GET /file-save-jobs`
3. queued joblari al
4. `start` endpointi ile job status guncelle
5. file save / print handler calistir
6. `complete` veya `fail` endpointi ile sonucu yaz

Kullanilan endpointler:
- `POST /print-jobs/:id/start|complete|fail`
- `POST /file-save-jobs/:id/start|complete|fail`

## 4) Local Agent -> Status

Local agent heartbeat:
- `POST /local-agent/status`
- `GET /local-agent/status`

Durum alanlari:
- `online`
- `safe_mode`
- `offline`
- `error`

## 5) UI Bağlantısı

Belge listesi:
- `/belgeler`
- satir secimi + aksiyonlar

Belge detayi:
- `/belgeler/[documentId]`
- preview
- gonderim gecmisi
- queue save/print
- regenerate
- WhatsApp/E-posta aksiyonlari

## 6) Security

Tum document/local output endpointleri:
- authenticated context
- tenant/user headers
- permission guard
ile korunur.

Ek olarak render path'te entity baglantisi (`entityId`, `entityNo`) zorunlu dogrulanir.
