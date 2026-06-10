# 03 — Cursor Görev Promptu

Aşağıdaki prompt Cursor Composer'a tek parça görev olarak verilecektir.

```text
Sen kıdemli bir frontend ve 3D web uygulama geliştiricisisin.

Proje adı: ADAWALL Virtual Flagship — T Plan Wallpaper Corridor

Amaç:
Next.js App Router, TypeScript, Tailwind CSS, React Three Fiber, Three.js, @react-three/drei, Zustand ve Framer Motion kullanarak Adawall sanal mağaza pilotu için teknik starter ve 1 loca prototipi oluştur.

Bu aşamada final ürün yapma. Sadece teknik temel ve 1 çalışan loca prototipi üret.

Kesin kapsam:
1. Tam ekran 3D sahne oluştur.
2. /public/models/flagship-shell.glb dosyasını yüklemeye hazır altyapı kur.
3. Model yoksa uygulama kırılmasın; fallback showroom shell geometrisi göster.
4. T plan mağaza mantığını temsil eden basit fallback geometri kur:
   - ana atrium alanı
   - T şeklinde bağlanan Wallpaper Gallery Corridor
   - corridor içinde 1 pilot loca
5. 1 pilot locada duvar yüzeyine pattern texture/material uygulanabilir olsun.
6. Kullanıcı sağ UI panelinden 3 renk varyasyonu arasında seçim yapınca locadaki duvar materyali değişsin.
7. Ürün panelinde koleksiyon adı, desen adı, SKU, renk adı, bayi stoğu, fabrika stoğu ve numune/teklif butonları görünsün.
8. UI premium, sade, koyu/lüks ve profesyonel olsun.
9. Kodları tek dosyaya yığma.
10. TypeScript tiplerini doğru oluştur.

Dosya yapısı:

src/
  app/
    page.tsx
    layout.tsx
    globals.css
  components/
    showroom/
      ShowroomCanvas.tsx
      ShowroomScene.tsx
      FlagshipShell.tsx
      WallpaperCorridor.tsx
      WallpaperBooth.tsx
      Hotspot.tsx
      CameraRig.tsx
    ui/
      TopOverlay.tsx
      ProductPanel.tsx
      ColorSwatchBar.tsx
      LoadingScreen.tsx
      StockBadge.tsx
  data/
    pilotPatterns.ts
    showroomZones.ts
  stores/
    showroomStore.ts
  types/
    showroom.ts
public/
  models/
    README.md
  textures/
    README.md
  images/
    README.md

Teknik kurallar:
- App Router kullan.
- Server/client component ayrımına dikkat et.
- 3D canvas bileşenleri client component olmalı.
- React Three Fiber mantığına uygun yaz.
- Texture yoksa renk bazlı materyal fallback kullan.
- Zustand ile aktif pattern variant state'ini yönet.
- Sahne yeniden yüklenmeden material değişsin.
- Mock veri data/pilotPatterns.ts içinde tutulmalı.
- Gerçek ERP/stok entegrasyonu yazma; sadece veri alanlarını hazırla.
- Test edilmeyen şeyi production-ready diye yazma.

Kabul kriterleri:
- npm/pnpm install sonrası proje çalışmalı.
- TypeScript derlenmeli.
- 3D sahne açılmalı.
- 1 pilot loca görünmeli.
- 3 renk varyasyonu arasında geçiş yapılmalı.
- Ürün kartı seçilen varyanta göre güncellenmeli.
```
