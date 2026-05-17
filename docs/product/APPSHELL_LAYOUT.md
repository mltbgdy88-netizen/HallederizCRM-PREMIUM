# AppShell ve layout (Task 04)

Bu doküman, oturmuş **kabuk (shell)** yapısını ve içerik hizasını özetler; uygulama `packages/ui` + `apps/web/src/components/platform-shell.tsx` + `globals.css` üzerindedir.

## Katmanlar (dıştan içe)

1. **`AppShell`** (`packages/ui/src/app-shell/app-shell.tsx`)  
   `hz-shell` → `hz-shell-frame` → masaüstü `hz-shell-sidebar` + `hz-shell-main` → `hz-shell-workspace` → `hz-shell-header` + `hz-shell-content` → `hz-shell-content-frame`.

2. **`PlatformShell`** (`apps/web/src/components/platform-shell.tsx`)  
   Ürün sidebar ağacı, `Header` (arama, PageMeta bastırma, tema, kullanıcı), altında **`PageContent`** ile sarılı sayfa ağacı.

3. **`PageContent`** (`packages/ui/src/primitives/page-content.tsx`)  
   Varsayılan: `platform-content hz-page-content` — mevcut `:has(.hz-dashboard-page--fit)` vb. kurallar **korunur**; ek olarak `max-width: var(--hz-content-max-width)` ve yatay ortalama uygulanır (UI designer kuralları ile uyumlu).

4. **Sayfa kökü**  
   Örn. `hz-dashboard-page--fit`, `hz-approvals-page`: `hz-shell-content` / `hz-shell-content-frame` ile birlikte taşma ve `min-height: 0` zinciri `globals.css` içinde tanımlıdır.

## Üst başlık (`Header`)

- `layout="dashboard" | "default"` — dashboard’da kompakt üst alan.
- `suppressPageMeta` — kendi başlığını çizen liste/detay sayfalarında çift başlık önlenir (`shouldSuppressShellPageMeta` ile birleşir).
- `leadingSlot`, `toolbarSlot`, `notificationSlot`, `themeSlot`, `userSlot` — sabit sözleşme.

## İki sütun (`SplitContentLayout`)

- `main` + isteğe bağlı `side` (sticky sağ sütun: `hz-split-side`).
- `sideWidth`: **`default`** → `var(--hz-side-panel-width)`; **`detail`** → `min(var(--hz-detail-panel-width), 100%)` (320–360px bandına yakın).

## Yeni / güncel token’lar

Bkz. [DESIGN_TOKENS.md](./DESIGN_TOKENS.md): `--hz-content-max-width`, `--hz-detail-panel-width`.

## Yapılmaması gerekenler

- Shell dışında **ikinci** tam genişlik sidebar üretme.
- `PageContent` kökünden `platform-content` sınıfını kaldırma (mevcut shell CSS kırılır).
- Backend veya auth akışına dokunma.
