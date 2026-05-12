# Approval Inbox — Ürün Spesifikasyonu

## Amaç

Approval Inbox, kiracı içinde **onay bekleyen kritik işlemlerin** tek operasyon yüzeyinde toplandığı ürün katmanıdır. Amaç; policy motorunun `require_approval` kararıyla oluşan kayıtların, platform onay API’si (`GET/POST /platform/approvals`) ve transactional bridge (`executeApprovalWithOutboxBridge`) ile bağlandığı zinciri kullanıcıya **okunabilir, denetlenebilir ve güvenli** şekilde sunmaktır.

Inbox şunları yapar:

- Bekleyen, işlenen, reddedilen ve hata/DLQ durumundaki onayları listeler.
- Her kayıt için aksiyon özeti, risk, gerekçe ve audit/timeline önizlemesi gösterir.
- Yetkili roller için **Onayla / Reddet** kararını UI üzerinden tetikler; karar sonrası execution, outbox ve worker durumunu izler.
- AI çıktısını **yalnızca açıklama ve bağlam** olarak sunar; doğrudan mutation yapmaz.

Bu doküman backend foundation (policy, pending approval repository, outbox, worker, audit/timeline) tamamlanırken paralel ürün ve UX standardını tanımlar. Uygulama kodu bu fazda kapsam dışıdır.

**İlgili mimari referanslar:** [approval-execution-flow.md](../approval-execution-flow.md), [audit-timeline-model.md](../audit-timeline-model.md), [POLICY_ENGINE_GAP_REPORT.md](../architecture/POLICY_ENGINE_GAP_REPORT.md), [WORKER_OUTBOX_RETRY_DLQ.md](../architecture/WORKER_OUTBOX_RETRY_DLQ.md).

---

## Kullanıcı rolleri

Rol adları tenant RBAC ile eşlenir; UI her ekranda **izin + tenant modülü** birlikte değerlendirilir.

| Rol | Amaç | Inbox yetkileri |
|-----|------|-----------------|
| **owner / admin** | Kiracı politikası ve operasyon denetimi | Tüm durumları görür; onay/red; execution/outbox/DLQ durumunu izler; yüksek riskli aksiyonlarda ikinci onay politikası varsa yapılandırma bağlamını görür |
| **manager / approver** | Günlük onay kararı | Bekleyen ve kendi karar geçmişini görür; yetkili `actionKey` setinde onay/red |
| **operator** | Kanal ve operasyon icrası | Çoğunlukla okuma + ilgili kayda git; onay gerektiren işlemi başlatabilir; onay kararı yalnızca atanmış approver yetkisi varsa |
| **viewer** | Salt okunur denetim | Liste ve detay (hassas alanlar maskeli); onay/red yok |

**Fail-closed:** `approvals.read` olmadan liste/detay yok; `approvals.approve` / `approvals.write` olmadan karar CTA’ları gösterilmez veya devre dışı kalır. Production’da tenant uyuşmazlığı veya süresi dolmuş kayıt için mutation CTA’sı asla aktif edilmez.

---

## Ana ekran bölümleri

### 1. Pending approvals listesi

- Varsayılan görünüm: `status=pending`, tarihe göre azalan.
- Satırda: `actionKey` (insan okunur etiket), talep eden, `requestedAt`, risk rozeti, modül/entity kısa bağlamı.
- İlk açılışta veri varken **ilk satır seçili**; sağ detay paneli dolu (kabul edilmiş CRM liste sayfalarıyla aynı kural).
- Yoğunluk: masaüstünde kompakt satır; en az 5 satır ilk görünümde hedeflenir (1920×1080).

### 2. Approval detail panel

- Seçili `approvalRequestId` için tam metadata, bağlı entity önizlemesi, policy `reasons`, karar geçmişi.
- Deep link: `/approvals/[approvalRequestId]` (uygulama route eşlemesi bkz. [APPROVAL_INBOX_UI_FLOW.md](./APPROVAL_INBOX_UI_FLOW.md)).

### 3. Action risk summary

- `risk level`, `auditRequired`, `timelineRequired`, handler modu (`dry_run` / gerçek icra), dış yazım (`externalWrite`) göstergeleri.
- Kritik aksiyonlarda üst bantta sabit uyarı; düşük riskte kompakt şerit.

### 4. AI explanation panel

- Proposal veya operatör komutundan gelen **read-only** özet: neden önerildi, hangi veriye dayandı, alternatifler.
- Onay/red kararını otomatik vermez; “AI önerisi — insan onayı gerekir” etiketi zorunlu.
- Dashboard ana sayfasındaki tam AI kolonundan farklı olarak inbox’ta **bağlama özel dar panel** (öneri metni + kaynak işaretleri).

### 5. Audit / timeline preview

- Onay kaydı ve (varsa) `executionId` için son N audit/timeline taslağı.
- Olay tipleri: `approval.approve`, `approval.reject`, `approval.execution.*`, domain write-back.
- Tam zaman çizelgesi entity sayfasına veya genişletilmiş drawer’a link.

### 6. Approve / reject CTA

- Birincil: **Onayla**; ikincil: **Reddet** (gerekçe isteğe bağlı veya zorunlu — tenant policy).
- Karar gönderilirken butonlar `approving` / `rejecting` durumuna kilitlenir; çift tıklama engeli.
- Başarılı karar sonrası toast + disabled state (mutation buton kuralı).

### 7. Duplicate / idempotency indicator

- Aynı `idempotencyKey` veya tekrarlanan onay denemesinde: “Bu işlem zaten işlendi” bandı.
- İkinci outbox job oluşturulmadığı backend sözleşmesi UI’da görünür (ikon + kısa açıklama + önceki `executionId` / `outboxJobId`).

### 8. Worker / outbox status indicator

- Onay sonrası: `approved_waiting_execution` → `executing` → `completed` | `failed` | `dead_letter`.
- Outbox job durumu: `pending`, `processing`, `failed` (retry), `dead_letter`.
- Retry planı: sonraki `availableAt`, deneme sayısı, `[RETRYABLE]` / `[NON_RETRYABLE]` etiketi (execution mesajından).

---

## Approval item alanları

UI ve API sözleşmesinde her öğe aşağıdaki alanları taşır veya türetilmiş gösterim sunar:

| Alan | Açıklama |
|------|----------|
| `approvalRequestId` | Birincil anahtar; liste seçimi ve deep link |
| `tenantId` | Kiracı kapsamı; UI’da genelde gizli, güvenlik kontrollerinde zorunlu |
| `actionKey` | Registry anahtarı (ör. `create_order`, `platform.settings.update`) |
| `requestedBy` | `actorId` + görünen ad |
| `requestedAt` | ISO zaman; liste sıralama |
| `status` | UI state machine ile hizalı (bkz. UI flow dokümanı) |
| `reasons` | Policy karar gerekçeleri (dizi veya yapılandırılmış metin) |
| `risk level` | `low` \| `medium` \| `high` \| `critical` (veya tenant eşlemesi) |
| `auditRequired` | Audit yazımı bekleniyor / tamamlandı göstergesi |
| `timelineRequired` | Timeline yazımı bekleniyor / tamamlandı göstergesi |
| `outboxJobId` | Bridge sonrası kuyruk kaydı; yoksa “henüz kuyruğa alınmadı” |
| `executionId` | Onay sonrası execution kaydı; dispatcher izi |

İsteğe bağlı genişletme (detay paneli): `entityType`, `entityId`, `idempotencyKey`, `handlerKey`, `handlerMode`, `persistenceMode`, kanal kaynağı (WhatsApp / web / AI).

---

## Liste filtreleri

| Filtre | Davranış |
|--------|----------|
| **status** | `pending`, `approved_waiting_execution`, `executing`, `completed`, `failed`, `dead_letter`, `rejected`, `expired`, `cancelled` |
| **action type** | `actionKey` veya gruplanmış modül aksiyonları |
| **requester** | `requestedBy` / kullanıcı seçici |
| **date range** | `requestedAt` veya karar tarihi |
| **risk level** | Çoklu seçim |
| **module** | Cari, teklif, sipariş, tahsilat, stok, depo, teslimat, belge, platform, AI proposal |

Filtre sıfırlama erişilebilir (ikon-only ise `title` + `aria-label`). Filtre değişince seçili kayıt dışarıda kalırsa **ilk uygun kayıt** seçilir.

---

## Empty / error / loading standartları

### Loading

- Liste: satır iskeleti (skeleton), header sabit.
- Detay: bölüm bazlı skeleton; CTA’lar disabled.
- Outbox/execution alt durumu: küçük inline spinner + “Durum güncelleniyor”.

### Empty

- **Gerçekten kayıt yok:** “Bekleyen onay yok” + son senkron zamanı; viewer için bilgilendirici metin.
- **Filtre sonucu boş:** “Bu filtreyle eşleşen onay yok” + filtreyi sıfırla.
- **Yetki yok:** empty yerine permission denied (aşağıda).

### Error

- Liste API hatası: kart içi hata + yeniden dene.
- Detay kısmi hata: audit/outbox blokları bağımsız hata; çekirdek metadata varsa panel açık kalır.
- Karar gönderimi hatası: inline mesaj + CTA’ları kilitlemeden önce net geri bildirim.

---

## Security UX

| Senaryo | UI davranışı |
|---------|----------------|
| **Tenant mismatch** | Tam sayfa veya modal: “Bu onay kaydı mevcut kiracınıza ait değil.” Liste/detay gizlenir; fail-closed. |
| **Permission denied** | `403` eşleniği: aksiyonlar gizli; salt okunur alanlar varsa maskeli özet. |
| **Expired approval** | Durum `expired`; Onayla/Reddet disabled; yeniden talep yalnızca kaynak akıştan (inbox’tan re-open yok). |
| **Already approved / rejected** | Idempotent yanıt: mevcut durum rozeti; tekrar gönderimde bilgi bandı, ikinci bridge tetiklenmez. |
| **Bridge / worker failure** | `failed` veya `dead_letter`; hata özeti, retry/DLQ bağlamı; operatör için “ilgili kayıt” ve destek referansı (`executionId`, `outboxJobId`). |

Tüm mutation benzeri UI aksiyonları demo/backend yoksa **demo toast** + disabled-after-success; gerçek API’de yanıt gövdesindeki metadata (`persistenceSkipped`, `unsupported`) kullanıcıya açık gösterilir.

---

## Mobile / responsive davranış

- **Geniş ekran (≥1280px):** Sol liste + sağ detay; outbox/audit blokları detay içinde iki sütun olabilir.
- **Orta (768–1279px):** Liste tam genişlik; satır seçimi detayı alt sayfa veya tam ekran drawer açar.
- **Dar (<768px):** Tek kolon; filtreler sheet içinde; Onayla/Reddet yapışkan alt çubuk (`ApprovalDecisionBar`).
- Yatay scroll hedeflenmez; aksiyon kolonu kırpılmaz.
- Touch: satır dokunma alanı ≥44px; karar öncesi onay diyaloğu yüksek riskte zorunlu.

---

## Kapsam dışı (bu ürün spec fazı)

- Gerçek API route veya React implementasyonu.
- DLQ replay admin ekranı (ayrı operasyon aracı; inbox yalnızca durum gösterir).
- WhatsApp `ONAY`/`RED` komutlarının inbox UI’si (kanal bağlama sonraki faz).

**Sonraki dokümanlar:** [APPROVAL_INBOX_UI_FLOW.md](./APPROVAL_INBOX_UI_FLOW.md), [APPROVAL_INBOX_COMPONENT_MAP.md](./APPROVAL_INBOX_COMPONENT_MAP.md), [OPERATOR_WORKSPACE_PRODUCT_SPEC.md](./OPERATOR_WORKSPACE_PRODUCT_SPEC.md).

## 2026-05-13 — Approval Inbox UI foundation (web)

- `/onaylar` route API-backed Approval Inbox shell ile calisir; sahte production onay verisi gosterilmez.
- Approve/reject aksiyonlari mevcut platform approval API contract'ina baglidir; mutation guvenligi backend gate'e baglidir.
- Worker/safety metadata read-only gosterilir.
- Sonraki is: UI polish, operator workflow, notification badge, realtime refresh.

## 2026-05-13 — Approval Inbox navigation polish

- Sidebar `Onaylar` linki `/onaylar` route'una baglidir; dashboard hizli erisim karti eklendi.
- Filtre, arama ve siralama mevcut API listesi uzerinden client-side calisir; fake count gosterilmez.
- Approve/reject UX pending disi durumda disabled kalir; runtime action guvenligi backend gate'e baglidir.

## 2026-05-13 — Operator UI runtime integration (sandbox)

- Local/demo/test ortaminda `GET /platform/approvals/sandbox/availability` ve `POST /platform/approvals/sandbox/seed` ile **idempotent** sandbox pending kayitlari olusturulabilir; production `NODE_ENV` veya auth production modunda **kapalidir** (403 / route flag false).
- UI `ApprovalSandboxToolbar` yalnizca development build ve API `sandboxSeedAvailable` true iken gorunur; client-side fake liste uretmez.
- Liste/detay `normalizeApproval` ile API contract alanlarina maplenir; approve/reject sonrasi **refetch** zorunludur; reject icin bos reason API `400 reject_reason_required` doner.
- Worker health + safety/DLQ ozeti inbox ust bandinda read-only kartlarda gosterilir.
