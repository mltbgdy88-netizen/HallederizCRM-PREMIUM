# 02 — ADAWALL Virtual Flagship Teknik Başlangıç Brief'i

## 1. Teknik Amaç

ADAWALL Virtual Flagship için ilk teknik hedef, fotogerçekçi 3D mağaza kabuğunu ve 1 loca prototipini taşıyabilecek modern, modüler ve SaaS'a genişleyebilir bir web altyapısı kurmaktır.

Bu aşamada hedef final ürün değildir. Hedef; doğru teknoloji omurgasını, component yapısını, veri modelini ve 1 loca prototipini doğrulamaktır.

## 2. Önerilen Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- React Three Fiber
- Three.js
- @react-three/drei
- Zustand
- Framer Motion

## 3. İlk Teknik MVP

İlk teknik MVP aşağıdaki özellikleri içermelidir:

1. Tam ekran 3D sahne
2. Fotogerçekçi mekan dosyası için GLB yükleme altyapısı
3. Model yoksa sahnenin kırılmaması
4. Kamera kontrol sistemi
5. Hotspot/loca seçimi
6. 1 loca için duvar material/texture değiştirme
7. Ürün bilgi kartı
8. Renk varyasyonu seçim paneli
9. Mock bayi/fabrika stok verisi
10. Responsive UI overlay

## 4. Dosya Yapısı Önerisi

```text
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
```

## 5. Veri Modeli Taslağı

```ts
export type StockInfo = {
  dealerStock: number;
  factoryStock: number;
  leadTimeDays?: number;
};

export type PatternVariant = {
  id: string;
  sku: string;
  name: string;
  colorName: string;
  swatchHex?: string;
  textureUrl: string;
  price?: number;
  stock: StockInfo;
};

export type WallpaperPattern = {
  id: string;
  collectionName: string;
  patternName: string;
  category: 'botanical_mural' | 'classic_damask' | 'modern_geometric' | 'texture' | 'mural';
  boothId: string;
  heroImage?: string;
  variants: PatternVariant[];
};

export type ShowroomZone = {
  id: string;
  name: string;
  type: 'atrium' | 'wallpaper_corridor' | 'home_textile' | 'adapanel' | 'fragrance' | 'dealer_desk' | 'vip_lounge';
  description: string;
};
```

## 6. Teknik İlkeler

- 3D sahne ve UI birbirinden ayrılacaktır.
- Ürün verisi mock data olarak başlayacaktır.
- Gerçek stok/fiyat entegrasyonu MVP dışında tutulacaktır.
- 3D model bulunmadığında uygulama boş fallback sahne ile açılacaktır.
- Texture/material değişimi sahne yeniden yüklenmeden yapılacaktır.
- Component'ler tek dosyaya yığılmayacaktır.
- Her sahne objesi SaaS tema sistemine genişleyebilir şekilde config tabanlı düşünülmelidir.

## 7. Cursor Görevi

Cursor ilk aşamada sadece teknik starter ve 1 loca prototipi üretmelidir. Tüm mağaza, tüm ürünler ve final SaaS paneli istenmeyecektir.

## 8. Codex Görevi

Codex, Cursor tarafından üretilen kodu aşağıdaki açılardan denetlemelidir:

- TypeScript doğruluğu
- component ayrımı
- gereksiz renderlar
- texture/material değişim mantığı
- build/lint/test komutları
- güvenlik ve veri modeli riskleri
- mock ile gerçek entegrasyonun ayrımı

## 9. Kabul Kriterleri

İlk teknik MVP başarılı sayılmak için:

- Uygulama localde açılmalı
- 3D sahne render olmalı
- 1 loca seçilebilir olmalı
- 3 renk varyasyonu arasında duvar materyali değişmeli
- Ürün kartında SKU, renk, bayi stoğu, fabrika stoğu mock olarak görünmeli
- TypeScript build hata vermemeli
- Kod yapısı modüler olmalı
