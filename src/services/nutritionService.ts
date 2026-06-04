import type { NutritionSearchResult } from '../types';
import { searchByBarcode, searchByName } from './openFoodFacts';
import { usdaSearchByBarcode, usdaSearchByName } from './usda';

// Cache to avoid re-fetching same queries
const cache = new Map<string, { results: NutritionSearchResult[]; ts: number }>();
const TTL = 5 * 60 * 1000; // 5 minutes

function cached(key: string, results: NutritionSearchResult[]): NutritionSearchResult[] {
  cache.set(key, { results, ts: Date.now() });
  return results;
}

function fromCache(key: string): NutritionSearchResult[] | null {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < TTL) return hit.results;
  return null;
}

export async function lookupBarcode(barcode: string): Promise<NutritionSearchResult | null> {
  const cacheKey = `barcode:${barcode}`;
  const hit = fromCache(cacheKey);
  if (hit?.length) return hit[0];

  const ofx = await searchByBarcode(barcode);
  if (ofx) {
    cached(cacheKey, [ofx]);
    return ofx;
  }

  const usda = await usdaSearchByBarcode(barcode);
  if (usda) {
    cached(cacheKey, [usda]);
    return usda;
  }

  return null;
}

export async function searchFood(query: string): Promise<NutritionSearchResult[]> {
  if (!query.trim()) return [];
  const cacheKey = `search:${query.toLowerCase()}`;
  const hit = fromCache(cacheKey);
  if (hit) return hit;

  const [ofxResults, usdaResults] = await Promise.all([
    searchByName(query),
    usdaSearchByName(query),
  ]);

  // Deduplicate by barcode, prefer OFX
  const seen = new Set<string>();
  const merged: NutritionSearchResult[] = [];
  for (const r of [...ofxResults, ...usdaResults]) {
    const dedupeKey = r.barcode ?? r.id;
    if (!seen.has(dedupeKey)) {
      seen.add(dedupeKey);
      merged.push(r);
    }
  }

  return cached(cacheKey, merged.slice(0, 25));
}
