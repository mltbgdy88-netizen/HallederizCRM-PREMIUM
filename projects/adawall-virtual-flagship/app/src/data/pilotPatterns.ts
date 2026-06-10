import type { WallpaperPattern } from '../types/showroom';

export const pilotPatterns: WallpaperPattern[] = [
  {
    id: 'botanical-luxe-001',
    collectionName: 'Pilot Mural Collection',
    patternName: 'Botanical Luxe',
    category: 'botanical_mural',
    boothId: 'booth-01',
    variants: [
      {
        id: 'sage',
        sku: 'ADA-PILOT-BOT-001-SAGE',
        name: 'Botanical Luxe Sage',
        colorName: 'Sage Green',
        swatchHex: '#7f8f73',
        materialColor: '#7f8f73',
        stock: { dealerStock: 18, factoryStock: 240, leadTimeDays: 4 }
      },
      {
        id: 'sand',
        sku: 'ADA-PILOT-BOT-001-SAND',
        name: 'Botanical Luxe Sand',
        colorName: 'Warm Sand',
        swatchHex: '#c9b691',
        materialColor: '#c9b691',
        stock: { dealerStock: 7, factoryStock: 160, leadTimeDays: 6 }
      },
      {
        id: 'charcoal',
        sku: 'ADA-PILOT-BOT-001-CHAR',
        name: 'Botanical Luxe Charcoal',
        colorName: 'Charcoal Bronze',
        swatchHex: '#3d3932',
        materialColor: '#3d3932',
        stock: { dealerStock: 3, factoryStock: 88, leadTimeDays: 8 }
      }
    ]
  }
];

export const activePilotPattern = pilotPatterns[0];
