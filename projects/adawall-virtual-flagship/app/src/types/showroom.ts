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
  swatchHex: string;
  materialColor: string;
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
