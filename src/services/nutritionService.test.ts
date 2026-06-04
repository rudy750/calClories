import { lookupBarcode, searchFood } from './nutritionService';
import type { NutritionSearchResult } from '../types';

const {
  mockSearchByBarcode,
  mockSearchByName,
  mockUsdaSearchByBarcode,
  mockUsdaSearchByName,
} = vi.hoisted(() => ({
  mockSearchByBarcode: vi.fn(),
  mockSearchByName: vi.fn(),
  mockUsdaSearchByBarcode: vi.fn(),
  mockUsdaSearchByName: vi.fn(),
}));

vi.mock('./openFoodFacts', () => ({
  searchByBarcode: mockSearchByBarcode,
  searchByName: mockSearchByName,
}));

vi.mock('./usda', () => ({
  usdaSearchByBarcode: mockUsdaSearchByBarcode,
  usdaSearchByName: mockUsdaSearchByName,
}));

function item(id: string, source: 'openfoodfacts' | 'usda', barcode?: string): NutritionSearchResult {
  return {
    id,
    source,
    sourceId: id,
    name: id,
    calories: 100,
    proteinG: 10,
    carbG: 10,
    fatG: 5,
    servingSizeG: 100,
    servingSizeLabel: '100g',
    barcode,
  };
}

describe('nutritionService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useRealTimers();
  });

  it('prefers OpenFoodFacts for barcode lookup', async () => {
    const ofx = item('ofx-1', 'openfoodfacts', '123');
    mockSearchByBarcode.mockResolvedValueOnce(ofx);

    const result = await lookupBarcode('123');

    expect(result).toEqual(ofx);
    expect(mockUsdaSearchByBarcode).not.toHaveBeenCalled();
  });

  it('falls back to USDA for barcode lookup when OFX misses', async () => {
    const usda = item('usda-1', 'usda', '789');
    mockSearchByBarcode.mockResolvedValueOnce(null);
    mockUsdaSearchByBarcode.mockResolvedValueOnce(usda);

    const result = await lookupBarcode('789');

    expect(result).toEqual(usda);
    expect(mockUsdaSearchByBarcode).toHaveBeenCalledWith('789');
  });

  it('uses cache for repeated barcode lookups', async () => {
    const ofx = item('ofx-2', 'openfoodfacts', '456');
    mockSearchByBarcode.mockResolvedValue(ofx);

    const first = await lookupBarcode('456');
    const second = await lookupBarcode('456');

    expect(first).toEqual(ofx);
    expect(second).toEqual(ofx);
    expect(mockSearchByBarcode).toHaveBeenCalledTimes(1);
  });

  it('deduplicates merged search results by barcode/id', async () => {
    const shared = item('dup', 'openfoodfacts', '999');
    const duplicateFromUsda = item('other-id', 'usda', '999');
    mockSearchByName.mockResolvedValueOnce([shared]);
    mockUsdaSearchByName.mockResolvedValueOnce([duplicateFromUsda, item('u2', 'usda')]);

    const results = await searchFood('milk');

    expect(results).toHaveLength(2);
    expect(results[0].id).toBe('dup');
  });

  it('returns empty list for empty query', async () => {
    await expect(searchFood('   ')).resolves.toEqual([]);
    expect(mockSearchByName).not.toHaveBeenCalled();
    expect(mockUsdaSearchByName).not.toHaveBeenCalled();
  });
});
