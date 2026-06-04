import type { NutritionSearchResult } from '../types';

const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1';
// Use DEMO_KEY - rate limited to 30/hour. User can override in settings.
const getApiKey = () => localStorage.getItem('usda_api_key') ?? 'DEMO_KEY';

interface USDAFood {
  fdcId: number;
  description: string;
  brandOwner?: string;
  brandName?: string;
  gtinUpc?: string;
  foodNutrients?: Array<{
    nutrientId: number;
    nutrientName: string;
    value: number;
    unitName: string;
  }>;
  servingSize?: number;
  servingSizeUnit?: string;
}

function nutrientValue(food: USDAFood, id: number): number {
  return food.foodNutrients?.find(n => n.nutrientId === id)?.value ?? 0;
}

function parseUSDAFood(f: USDAFood): NutritionSearchResult | null {
  const calories = nutrientValue(f, 1008); // Energy kcal
  const protein = nutrientValue(f, 1003);
  const carb = nutrientValue(f, 1005);
  const fat = nutrientValue(f, 1004);

  if (!f.description) return null;

  const servingSizeG = f.servingSize ?? 100;
  const servingSizeLabel = f.servingSize
    ? `${f.servingSize}${f.servingSizeUnit ?? 'g'}`
    : '100g';

  return {
    id: `usda-${f.fdcId}`,
    name: f.description,
    brand: f.brandOwner ?? f.brandName,
    barcode: f.gtinUpc,
    calories,
    proteinG: protein,
    carbG: carb,
    fatG: fat,
    servingSizeG,
    servingSizeLabel,
    source: 'usda',
    sourceId: String(f.fdcId),
  };
}

export async function usdaSearchByBarcode(barcode: string): Promise<NutritionSearchResult | null> {
  try {
    const res = await fetch(
      `${USDA_BASE}/foods/search?query=${encodeURIComponent(barcode)}&dataType=Branded&api_key=${getApiKey()}`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    const food = data.foods?.[0];
    if (!food) return null;
    return parseUSDAFood(food);
  } catch {
    return null;
  }
}

export async function usdaSearchByName(query: string): Promise<NutritionSearchResult[]> {
  try {
    const res = await fetch(
      `${USDA_BASE}/foods/search?query=${encodeURIComponent(query)}&pageSize=15&api_key=${getApiKey()}`,
    );
    if (!res.ok) return [];
    const data = await res.json();
    const foods: USDAFood[] = data.foods ?? [];
    return foods.map(parseUSDAFood).filter((x): x is NutritionSearchResult => x !== null);
  } catch {
    return [];
  }
}
