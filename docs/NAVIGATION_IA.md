# Navigasyon Bilgi Mimarisi (IA)

**Durum:** Uygulandı (sandbox sidebar + hub kapıları)  
**İlke:** Sol menü sade; derinlik hub/katman kapılarıyla; teknik entegrasyon Ayarlar’da.

---

## Sol menü (14 kalem)

| # | Etiket | Route | Rol |
|---|--------|-------|-----|
| 1 | Gösterge Paneli | `/dashboard` | Sıradaki iş, uyarı, kısa yol |
| 2 | Hızlı İşlem | `/hizli-islem` | Fiş / satış-teklif girişi |
| 3 | **Yapay Zeka** | `/ai` | **Sistem 2. beyni** — öneri, içgörü, AI onay kuyruğu |
| 4 | Onaylar | `/onaylar` | Karar masası |
| 5 | WhatsApp | `/whatsapp` | Müşteri konuşması |
| 6 | Cariler | `/cariler` | Cari liste + sağ özet |
| 7 | Teklifler | `/teklifler` | Açık teklifler |
|  8 | Siparişler | `/siparisler` | Açık siparişler |
| 9 | Ürün / Stok | `/stok` | Stok operasyon |
| 10 | Fabrika | `/fabrikalar/siparis` | Üretim/sevkiyat takibi |
| 11 | Muhasebe | `/muhasebe` | Finans hub |
| 12 | Arşiv | `/archive` | Geçmiş kayıtlar |
| 13 | Raporlar | `/raporlar` | Rapor vitrini |
| 14 | Ayarlar | `/ayarlar` | Yönetim + entegrasyon |

**Menüde yok (kapı/hub):** Tahsilat, Teslimat, Fatura, İade, Depo, Belgeler, Görevler, ERP, Gelen Kutu.

### Yapay Zeka kapıları (`/ai` ana; alt route’lar)

| Kapı | Route |
|------|-------|
| Operatör merkezi (ana) | `/ai` |
| İçgörüler | `/ai/icgoruler` |
| AI onay kuyruğu | `/ai/onaylar` |
| İnsan onay masası | `/onaylar` |

`/ai/operator-hub` → `/ai` redirect.

---

## Hub kapıları

### Muhasebe (`/muhasebe`)

| Kart | Route |
|------|-------|
| Faturalar | `/faturalar` |
| Tahsilatlar | `/tahsilatlar` |
| İadeler | `/iadeler` |

Teslimat: Siparişler detay/katman ve Arşiv kapısı.

### Ayarlar (`/ayarlar`)

| Kart | Route |
|------|-------|
| Kullanıcılar | `/kullanicilar` |
| Entegrasyon (ERP) | `/erp` |
| WhatsApp yapılandırma | `/whatsapp` (config bağlamı) |
| Onay kuralları | `/onaylar/kurallar` |
| Operasyon gözlem | `/ayarlar/operasyon-gozlem` |

Fabrika **API** bağlantısı entegrasyon ailesine eklenecek (`/erp` veya `/entegrasyonlar/fabrika` — route eklendiğinde Ayarlar kartından).

### Stok kapıları (sayfa içi / sipariş)

- Depo Hazırlık → `/depo`
- Fabrika stok → `/fabrikalar/stok`

### WhatsApp kapıları

- Gelen Kutu (çok kanallı) → `/gelen-kutu`

### Arşiv

Tek menü kalemi; kategori sekmeleri sayfa içi (Final `ArsivOperasyonMerkeziPage`).

---

## Katman (layer) rotaları

Final referans: teklif/sipariş/cari **katman** sekmeleri sidebar’da değil; entity detay içinde.

Örnek: `/siparisler/katman/ozet?orderId=`, `/teklifler/katman/belgeler?offerId=`

---

## Canonical vs redirect

| Canonical | Alias / redirect |
|-----------|------------------|
| `/fabrikalar/siparis` | `/fabrikalar/siparisler` |
| `/fabrikalar/stok` | `/fabrikalar/stoklar` |
| `/hizli-islem` | `/hizli-satis`, `/hizli-islem/satis-masasi` |
| `/archive` | Final `/arsiv` |

---

## Elenen çift UI (aynı iş)

| Tutulan | Kullanılmayan (route yok / legacy) |
|---------|-------------------------------------|
| `HizliSatisMasasiPage` | `HizliIslemMerkeziPage` (merkezi wizard UI) |
| `DashboardGostergePaneliPage` | `DashboardReferencePage` ana route’ta |
| `ArsivOperasyonMerkeziPage` | Eski archive tablo şablonu |
| `AyarlarHubPage` | Dağınık settings landing |

`QuickOperationPage`: PREMIUM motor UI — **P0**’da `/hizli-islem` alt route veya fiş ekranına bağlanacak; şimdilik kod korunur.

---

## Shell

- Kendi başlıklı sayfalarda `suppressPageMeta` (`platform-route-meta.ts`)
- `/muhasebe`, `/ayarlar`, `/fabrikalar/*` dahil
- Muhasebe alt route’ları (`/faturalar`, …) sidebar’da Muhasebe aktif

---

*Referans: `docs/OPERATION_AUTOMATION_TARGET.md`, `hallederiz vol2 hızlın satış akışı.txt`*
