# Permission Key Standard

Hedef isimlendirme standardı. Mevcut API’de legacy key’ler (`customers.read`, `orders.write`, `ai.actions.write`, `users.manage`) bir süre **alias** ile desteklenmeli; yeni kod hedef key kullanır.

## Format

```text
<domain>.<resource>.<verb>
```

- **domain:** `customer`, `order`, `finance`, `stock`, `document`, `ai`, `approval`, `channel`, `erp`, `factory`, `platform`, `report`
- **verb:** `read`, `create`, `update`, `delete`, `approve`, `cancel`, `execute`, `send`, `sync`, `export`

Platform namespace: `platform.users.read`, `platform.settings.write`.

## Fiil anlamları

| Verb | Anlam |
|------|--------|
| `read` | Liste/detay/rapor okuma |
| `create` | Yeni kayıt |
| `update` | Mevcut kayıt güncelleme |
| `delete` | Silme / arşivleme |
| `approve` | İnsan onayı verme |
| `cancel` | İptal / geri alma başlatma |
| `execute` | Onaylı veya policy’li icra (dispatcher) |
| `send` | Kanal/belge gönderimi |
| `sync` | Entegrasyon senkronu |

**Kural:** `execute` doğrudan UI’dan kritik mutation için tek başına yeterli değildir; **approval policy** ayrı çalışır.

## Örnek key listesi

### Cari / ticari

- `customer.read`, `customer.create`, `customer.update`, `customer.delete`
- `offer.read`, `offer.create`, `offer.update`
- `order.read`, `order.create`, `order.update`, `order.approve`, `order.cancel`

### Finans

- `finance.payment.read`, `finance.payment.create`, `finance.payment.approve`, `finance.payment.reverse`
- `invoice.read`, `invoice.create`, `invoice.issue`, `invoice.cancel`

### Stok / depo

- `stock.read`, `stock.adjust`, `stock.transfer`
- `warehouse.read`, `warehouse.assign`, `warehouse.execute`

### Belge

- `document.read`, `document.render`, `document.send`

### AI (ayrı namespace)

- `ai.proposal.create` — proposal üretimi / onay talebi oluşturma
- `ai.proposal.read`
- `ai.action.execute` — onaylı execution tetikleme (insan zinciri sonrası)
- `ai.voice.use` — STT/TTS yüzeyi

**Eski alias:** `ai.actions.write` → `ai.proposal.create` + `ai.action.execute` ayrımına migrate.

### Onay

- `approval.request` — onay kaydı oluşturma
- `approval.decide` — approve/reject
- `approval.execute` — dispatcher (alias: `approvals.execute`)

### Kanal

- `channel.whatsapp.read`, `channel.whatsapp.reply`, `channel.whatsapp.send`
- `channel.instagram.reply`, `channel.facebook.reply`, `channel.email.send`, `channel.sms.send`

### Entegrasyon

- `erp.sync.read`, `erp.sync.write`
- `factory.order.read`, `factory.order.create`

### Platform

- `platform.users.read`, `platform.users.write`
- `platform.roles.read`, `platform.settings.read`, `platform.settings.write`

## Modül vs action permission

| Tür | Örnek | Kullanım |
|-----|--------|----------|
| Modül erişimi | `modules.whatsapp.enabled` (config) | Feature flag / plan |
| Action permission | `channel.whatsapp.send` | Kullanıcı/rol |

Modül kapalıysa action permission **true olsa bile** erişim reddedilir.

## Role kullanımı

Role yalnızca permission paketidir. Route’ta `if (role === 'admin')` yerine `assertPermission(context, 'order.approve')`.

## Kritik mutation

Gerekli: uygun **write/execute** permission **ve** approval policy **ve** audit. Permission tek başına finansal kesinleştirme için yeterli sayılmaz.

## Legacy → hedef eşleme (özet)

| Legacy (mevcut) | Hedef |
|-----------------|--------|
| `customers.read` | `customer.read` |
| `customers.write` | `customer.update` / `customer.create` |
| `orders.write` | `order.create`, `order.update` |
| `approvals.approve` | `approval.decide` |
| `approvals.execute` | `approval.execute` |
| `whatsapp.write` | `channel.whatsapp.send` |
| `erp.write` | `erp.sync.write` |
| `users.manage` | `platform.users.write` |

Registry dosyası hedefi: `packages/domain/src/auth/permission-registry.ts` (henüz yok — gap).
