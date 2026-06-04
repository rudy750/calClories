import type { NutritionSearchResult } from '../types';

const OFX_BASE = 'https://world.openfoodfacts.org';

interface OFXProduct {
  product_name?: string;
  brands?: string;
  code?: string;
  nutriments?: {
    'energy-kcal_100g'?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    fiber_100g?: number;
    sodium_100g?: number;
  };
  serving_size?: string;
  serving_quantity?: number;
}

function parseOFXProduct(p: OFXProduct, sourceId: string): NutritionSearchResult | null {
  const n = p.nutriments;
  if (!n || !p.product_name) return null;

  const calories = n['energy-kcal_100g'] ?? 0;
  const protein = n['proteins_100g'] ?? 0;
  const carb = n['carbohydrates_100g'] ?? 0;
  const fat = n['fat_100g'] ?? 0;

  if (calories === 0 && protein === 0 && carb === 0 && fat === 0) return null;

  const servingSizeG = p.serving_quantity ?? 100;
  const servingSizeLabel = p.serving_size ?? `${servingSizeG}g`;

  return {
    id: `ofx-${sourceId}`,
    name: p.product_name,
    brand: p.brands,
    barcode: p.code,
    calories,
    proteinG: protein,
    carbG: carb,
    fatG: fat,
    servingSizeG,
    servingSizeLabel,
    source: 'openfoodfacts',
    sourceId,
  };
}

export async function searchByBarcode(barcode: string): Promise<NutritionSearchResult | null> {
  try {
    const res = await fetch(`${OFX_BASE}/api/v0/product/${barcode}.json`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 1 || !data.product) return null;
    return parseOFXProduct(data.product, barcode);
  } catch {
    return null;
  }
}

export async function searchByName(query: string, page = 1): Promise<NutritionSearchResult[]> {
  try {
    const params = new URLSearchParams({
      search_terms: query,
      search_simple: '1',
      action: 'process',
      json: '1',
      page: String(page),
      page_size: '20',
      fields: 'product_name,brands,code,nutriments,serving_size,serving_quantity',
    });
    const res = await fetch(`${OFX_BASE}/cgi/search.pl?${params}`);
    if (!res.ok) return [];
    const data = await res.json();
    const products: OFXProduct[] = data.products ?? [];
    return products
      .map(p => parseOFXProduct(p, p.code ?? ''))
      .filter((x): x is NutritionSearchResult => x !== null);
  } catch {
    return [];
  }
}
