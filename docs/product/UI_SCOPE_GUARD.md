# UI Scope Guard — HallederizCRM Premium

## 1. Amaç

Bu doküman, **UI dönüşüm serisi** (`ui/00` … `ui/09`) boyunca kod ve içerik sınırlarını tanımlar.

- Backend, worker, veritabanı, auth ve API contract **korunur**.
- `docs/design/ui-design-output/**` altındaki PNG dosyaları **tasarım referansıdır**; runtime bundle’a `import` edilmez.
- Her UI agent PR’ı bu guard’a uyumunu raporlar.

## 2. Allowed change areas (UI serisi genel)

| Alan | İzin |
|------|------|
| `apps/web/**` | UI route, feature component, stil, copy (Türkçe) |
| `packages/ui/**` | Primitives, AppShell parçaları, layout template |
| `docs/product/**` | UI plan, checklist, matrix (gerektiğinde) |
| `docs/design/ui-design-output/**` | **Yalnızca read-only referans** (Agent 00 dışı agent’lar da değiştirmemeli) |

## 3. Agent 00 özel sınırı

**`ui/00-inventory-scope-guard`** yalnızca `docs/product/` altında inventory, coverage matrix, scope guard ve uygulama planı üretir.

- React/CSS/token/route **implementasyonu yok**.
- Mockup PNG kopyalama/taşıma/silme yok.

## 4. Forbidden areas (tüm UI agent’lar)

Aşağıdakilere **UI dönüşüm PR’larında dokunulmaz**:

- `apps/api/**`
- `apps/worker/**`
- `packages/database/**`
- `packages/domain/**`
- `packages/sdk/**`
- `packages/types/**`
- `packages/config/**`
- Migration dosyaları
- Auth / session / permission guard mantığı
- Deployment ve CI workflow dosyaları
- `package.json`, `pnpm-lock.yaml`, kök `tsconfig` dosyaları
- API contract ve OpenAPI şemaları
- Business logic, onay execution, transaction/audit/outbox zinciri

## 5. UI içerik güvenliği

| Kural | Açıklama |
|-------|----------|
| Dil | Kullanıcıya dönük metinler **Türkçe** |
| Lorem | `lorem` / `ipsum` yok |
| Sahte kimlik | Sahte müşteri adı, firma, telefon, adres, fatura no üretilmez |
| Sahte medya | Sahte ürün fotoğrafı, sahte PDF önizleme, sahte harita illüstrasyonu yok |
| Teknik sızıntı | `worker`, `outbox`, `mutation`, `API bekliyor` (kullanıcı yüzünde), stack trace, `Failed to fetch` yok |
| Boş / bekleyen durum | Backend bağlı değilse: **“Canlı veri bekleniyor”**, **“Kayıt bulunamadı”**, **“İşlem geçmişi bulunmuyor”** gibi güvenli, operasyonel Türkçe |

Demo modu (`NEXT_PUBLIC_USE_DEMO_DATA`) ayrı preview band ile işaretlenir; canlı modda sahte kayıt gösterilmez (mevcut onay inbox davranışı korunur).

## 6. AI ekranları kuralı

- AI **mutation yapmaz**; yalnız öneri, özet, risk notu, taslak.
- Güvenli CTA örneği: **“İncele”**, **“Onaya gönder”** (onay akışına yönlendirme).
- Yasak CTA / durum metinleri: **“Uygula”**, **“Otomatik kaydet”**, **“Değiştirildi”** (kullanıcıya “kaydedildi” izlenimi veren AI copy).

Not: `product-page-shell` içindeki **“Uygulandı”** route durum rozeti anlamı taşır; AI mutation CTA değildir — yine de emerald tema geçişinde netleştirilecek.

## 7. Hub route kuralı

Aşağıdaki route’lar **gerçek form değildir**; Hızlı İşlem hub / yönlendirme ekranı kalır:

- `/teklifler/yeni` → `OfferCreateHub`
- `/siparisler/yeni` → `OrderCreateHub`
- `/tahsilatlar/yeni` → `PaymentCreateHub`

Zorunlu CTA: **“Hızlı İşlem’de hazırla”** (veya eşdeğeri). Doğrudan kayıt oluşturma UI’sı eklenmez.

`/cariler/yeni` ayrı kural: mevcut **cari oluşturma formu** (`CustomerCreatePage`); hub listesinden farklı — Agent 05’te mockup ile hizalanırken form/hub ayrımı korunur.

## 8. Tasarım dili (seri geneli)

- Lüks ama sade operasyon cockpit’i; iç personel; dış bayi portalı yok.
- Ana renk sistemi (hedef token’lar — Agent 01):

```css
:root {
  --hz-color-emerald: #047857;
  --hz-color-sidebar: #064E3B;
  --hz-color-gold: #D6A21E;
  --hz-color-gold-soft: #F7D774;
  --hz-color-bg: #F8F6EF;
  --hz-color-surface: #FFFDF7;
  --hz-color-text: #17231D;
  --hz-color-muted: #667568;
  --hz-color-danger: #B42318;
  --hz-color-info: #2563EB;
  --hz-radius-card: 16px;
  --hz-content-max-width: 1604px;
  --hz-detail-panel-width: 360px;
}
```

**Yasak görsel dil:** mor vurgu, lacivert sidebar, rastgele mavi, neon, aşırı gradient, sahte mobil app chrome, dekoratif illüstrasyon kalabalığı.

Mevcut `apps/web/app/globals.css` (PR #122 sonrası) hâlâ lacivert/mor-ağırlıklı legacy token kullanıyor — **Agent 01**’de emerald/gold’a geçilecek; bu branch token değiştirmez.

## 9. Doğru uygulama sırası

```
mockup referansı (read-only PNG)
  → design token (packages/ui + globals)
  → primitive component
  → shared state (loading/empty/error/success)
  → AppShell
  → layout template
  → route implementation
  → QA / smoke
```

## 10. Acceptance checklist (her UI agent PR öncesi)

- [ ] Bu dosya okundu.
- [ ] `UI_ROUTE_COVERAGE_MATRIX.md` içindeki hedef route/agent ile PR kapsamı örtüşüyor.
- [ ] Forbidden alanlara diff yok.
- [ ] PNG runtime import yok.
- [ ] Hub route’lar form’a dönüştürülmedi.
- [ ] AI yasak mutation dili eklenmedi.
- [ ] `pnpm --filter @hallederiz/web typecheck` geçti.
- [ ] `pnpm --filter @hallederiz/ui typecheck` geçti.
- [ ] `pnpm smoke:navigation` geçti (final QA’da `smoke:routes` da).
- [ ] `apps/web/tsconfig.tsbuildinfo` commit’e alınmadı.
